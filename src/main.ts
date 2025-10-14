import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor';

async function bootstrap() {
  // Create Winston logger instance
  const logger = WinstonModule.createLogger({
    level: 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json(),
    ),
    defaultMeta: { service: 'wellness-api' },
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple(),
        ),
      }),
      new winston.transports.File({ 
        filename: 'logs/error.log', 
        level: 'error',
        maxsize: 10 * 1024 * 1024, // 10MB
        maxFiles: 5,
      }),
      new winston.transports.File({ 
        filename: 'logs/combined.log',
        maxsize: 10 * 1024 * 1024, // 10MB
        maxFiles: 5,
      }),
    ],
  });

  try {
    logger.log('Starting application bootstrap process...');

    const app = await NestFactory.create(AppModule, {
      logger,
      bufferLogs: true,
    });

    const configService = app.get(ConfigService);
    if (!configService) {
      throw new Error('ConfigService not available');
    }

    const reflector = app.get(Reflector);

    // Security Middlewares
    app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: [`'self'`],
          styleSrc: [`'self'`, `'unsafe-inline'`],
          imgSrc: [`'self'`, 'data:', 'validator.swagger.io'],
          scriptSrc: [`'self'`],
        },
      },
      crossOriginEmbedderPolicy: false,
    }));

    // Rate Limiting
    const generalLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100,
      message: 'Too many requests from this IP, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    });

    const authLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5,
      message: 'Too many authentication attempts, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    });

    app.use('/auth/login', authLimiter);
    app.use('/auth/register', authLimiter);
    app.use('/auth/forgot-password', authLimiter);
    app.use(generalLimiter);

    // Compression
    app.use(compression());

    // Cookie parser
    app.use(cookieParser());

    // Global pipes for validation
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
        validationError: {
          target: false,
          value: false,
        },
      }),
    );

    // Global filters and interceptors
    const nestLogger = new Logger('GlobalExceptionFilter');
    app.useGlobalFilters(new HttpExceptionFilter(nestLogger));
    app.useGlobalInterceptors(
      new TransformInterceptor(reflector),
      new TimeoutInterceptor(10000),
    );

    // API Versioning
    app.setGlobalPrefix('api');
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: '1',
    });

    // CORS Configuration
    const corsOrigins = configService.get<string>('CORS_ORIGINS')?.split(',').map(origin => origin.trim()) || [];
    app.enableCors({
      origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'https://yourdomain.com',
        ...corsOrigins,
      ],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin',
        'Access-Control-Request-Method',
        'Access-Control-Request-Headers',
      ],
      exposedHeaders: ['Authorization', 'X-Total-Count'],
      credentials: true,
      maxAge: 86400,
    });

    // Swagger Documentation (only in development)
    if (configService.get<string>('NODE_ENV') !== 'production') {
      const config = new DocumentBuilder()
        .setTitle('Wellness API')
        .setDescription('Wellness Application API Documentation')
        .setVersion('1.0')
        .addBearerAuth(
          {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            name: 'JWT',
            description: 'Enter JWT token',
            in: 'header',
          },
          'JWT-auth',
        )
        .addCookieAuth('refreshToken')
        .addServer(`http://localhost:${configService.get<number>('PORT') || 3000}`)
        .addServer('https://api.yourdomain.com')
        .build();

      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup('api/docs', app, document, {
        swaggerOptions: {
          persistAuthorization: true,
          tagsSorter: 'alpha',
          operationsSorter: 'alpha',
        },
      });
    }

    // Health check endpoint
    app.getHttpAdapter().get('/health', (req, res) => {
      res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
      });
    });

    // Graceful shutdown handling
    process.on('SIGINT', async () => {
      logger.log('Received SIGINT, starting graceful shutdown');
      await app.close();
      logger.log('Application gracefully shut down');
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      logger.log('Received SIGTERM, starting graceful shutdown');
      await app.close();
      logger.log('Application gracefully shut down');
      process.exit(0);
    });

    // Global error handlers
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });

    const port = configService.get<number>('PORT') || 3000;
    await app.listen(port);

    logger.log(`🚀 Application is running on: http://localhost:${port}`);
    logger.log(` API Documentation available at: http://localhost:${port}/api/docs`);
    logger.log(`❤️  Health check available at: http://localhost:${port}/health`);

  } catch (error) {
    logger.error('Application bootstrap failed:', error);
    process.exit(1);
  }
}

bootstrap();