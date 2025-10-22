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

// Load environment variables early
import * as dotenv from 'dotenv';
import * as path from 'path';

// Determine environment and load appropriate .env file
const env = process.env.NODE_ENV || 'development';
const envPath = path.resolve(process.cwd(), `.env.${env}`);

// Load environment variables
const result = dotenv.config({ path: envPath });
if (result.error) {
  // Fallback to default .env file
  dotenv.config();
}

// Import filters and interceptors
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor';

// Alternative ports to try if default port is busy
const ALTERNATIVE_PORTS = [3001, 3002, 5000, 8000, 8080];

async function bootstrap() {
  // Create Winston logger instance
  const logger = WinstonModule.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json(),
    ),
    defaultMeta: { service: 'wellness-api', platform: 'mobile-web' },
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
        maxsize: 10 * 1024 * 1024,
        maxFiles: 5,
      }),
      new winston.transports.File({
        filename: 'logs/combined.log',
        maxsize: 10 * 1024 * 1024,
        maxFiles: 5,
      }),
      new winston.transports.File({
        filename: 'logs/mobile.log',
        maxsize: 10 * 1024 * 1024,
        maxFiles: 3,
      }),
    ],
  });

  try {
    logger.log(
      `Starting Wellness API for Mobile & Web in ${env} environment...`,
    );

    const app = await NestFactory.create(AppModule, {
      logger,
      bufferLogs: true,
    });

    const configService = app.get(ConfigService);
    if (!configService) {
      throw new Error('ConfigService not available');
    }

    const reflector = app.get(Reflector);

    // Enhanced Security Middlewares for Mobile & Web
    app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: [`'self'`],
            styleSrc: [
              `'self'`,
              `'unsafe-inline'`,
              'https://fonts.googleapis.com',
            ],
            imgSrc: [`'self'`, 'data:', 'blob:', 'https:'],
            scriptSrc: [`'self'`, `'unsafe-inline'`],
            connectSrc: [`'self'`, 'https:', 'wss:'],
            fontSrc: [`'self'`, 'https://fonts.gstatic.com'],
          },
        },
        crossOriginEmbedderPolicy: false,
        crossOriginResourcePolicy: { policy: 'cross-origin' }, // For mobile apps
      }),
    );

    // Enhanced Rate Limiting for Mobile & Web
    const generalLimiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: configService.get<number>('RATE_LIMIT_MAX') || 200, // Higher for mobile apps
      message: {
        error: 'Rate limit exceeded',
        message: 'Too many requests from this IP, please try again later.',
        retryAfter: 900, // 15 minutes in seconds
      },
      standardHeaders: true,
      legacyHeaders: false,
      skipSuccessfulRequests: false,
    });

    const authLimiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: configService.get<number>('AUTH_RATE_LIMIT_MAX') || 10, // Higher for mobile auth flows
      message: {
        error: 'Auth rate limit exceeded',
        message: 'Too many authentication attempts, please try again later.',
        retryAfter: 900,
      },
      standardHeaders: true,
      legacyHeaders: false,
    });

    const mobileLimiter = rateLimit({
      windowMs: 1 * 60 * 1000, // 1 minute
      max: 30, // Higher burst for mobile apps
      message: {
        error: 'Mobile rate limit exceeded',
        message: 'Too many requests from mobile client, please slow down.',
        retryAfter: 60,
      },
      standardHeaders: true,
      legacyHeaders: false,
    });

    // Apply rate limiting
    app.use('/auth/login', authLimiter);
    app.use('/auth/register', authLimiter);
    app.use('/auth/forgot-password', authLimiter);
    app.use('/auth/google-mobile-login', mobileLimiter);
    app.use('/auth/apple-mobile-login', mobileLimiter);
    app.use('/api/v1/mobile/', mobileLimiter); // Mobile-specific endpoints
    app.use(generalLimiter);

    // Enhanced Compression for mobile networks
    app.use(
      compression({
        level: 6,
        threshold: 1024,
        filter: (req, res) => {
          if (req.headers['x-no-compression']) {
            return false;
          }
          return compression.filter(req, res);
        },
      }),
    );

    // Enhanced Cookie parser for mobile and web
    app.use(cookieParser(configService.get<string>('COOKIE_SECRET')));

    // Global pipes for validation - Mobile friendly
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
        disableErrorMessages:
          configService.get<string>('NODE_ENV') === 'production',
      }),
    );

    // Global filters and interceptors
    const nestLogger = new Logger('GlobalExceptionFilter');
    app.useGlobalFilters(new HttpExceptionFilter(nestLogger));
    app.useGlobalInterceptors(
      new TransformInterceptor(reflector),
      new TimeoutInterceptor(
        configService.get<number>('MOBILE_REQUEST_TIMEOUT') || 15000,
      ), // Longer timeout for mobile
    );

    // API Versioning with mobile support
    app.setGlobalPrefix('api');
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: '1',
    });

    // Enhanced CORS Configuration for Mobile Apps & Web
    const corsOrigins =
      configService
        .get<string>('CORS_ORIGINS')
        ?.split(',')
        .map((origin) => origin.trim()) || [];
    const mobileAppOrigins =
      configService
        .get<string>('MOBILE_APP_ORIGINS')
        ?.split(',')
        .map((origin) => origin.trim()) || [];

    app.enableCors({
      origin: [
        // Web origins
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:5173', // Vite
        'http://localhost:8080',
        'https://yourdomain.com',
        'https://www.yourdomain.com',

        // Mobile app origins (Expo, React Native, etc.)
        'exp://localhost:19000',
        'exp://localhost:19001',
        'exp://localhost:19002',
        'http://localhost:19006',
        'ionic://localhost',
        'capacitor://localhost',

        // Add all mobile and web origins from environment
        ...corsOrigins,
        ...mobileAppOrigins,
      ],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin',
        'Access-Control-Request-Method',
        'Access-Control-Request-Headers',
        'X-API-Key',
        'X-Device-ID',
        'X-Platform',
        'X-App-Version',
        'X-Client-Type', // mobile or web
        'User-Agent',
        'Cache-Control',
        'X-Request-ID',
      ],
      exposedHeaders: [
        'Authorization',
        'X-Total-Count',
        'X-API-Version',
        'X-Request-ID',
        'X-RateLimit-Limit',
        'X-RateLimit-Remaining',
        'X-RateLimit-Reset',
      ],
      credentials: true,
      maxAge: configService.get<number>('CORS_MAX_AGE') || 86400,
      preflightContinue: false,
      optionsSuccessStatus: 204,
    });

    // Mobile-specific middleware
    app.use((req, res, next) => {
      // Add platform identification
      const userAgent = req.headers['user-agent'] || '';
      const clientType =
        req.headers['x-client-type'] ||
        (userAgent.toLowerCase().includes('mobile') ? 'mobile' : 'web');

      // Add client info to request object
      (req as any).client = {
        type: clientType,
        platform: req.headers['x-platform'] || 'unknown',
        version: req.headers['x-app-version'] || 'unknown',
        deviceId: req.headers['x-device-id'] || null,
      };

      // Add request ID for tracking
      const requestId =
        req.headers['x-request-id'] ||
        `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      (req as any).requestId = requestId;
      res.setHeader('X-Request-ID', requestId);

      next();
    });

    // Swagger Documentation (only in development)
    if (configService.get<string>('NODE_ENV') !== 'production') {
      const config = new DocumentBuilder()
        .setTitle('Wellness API - Mobile & Web')
        .setDescription(
          'Wellness Application API Documentation for Mobile Apps and Web Clients',
        )
        .setVersion('1.0')
        .addBearerAuth(
          {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            name: 'JWT',
            description: 'Enter JWT token for Mobile/Web authentication',
            in: 'header',
          },
          'JWT-auth',
        )
        .addCookieAuth('refreshToken', {
          type: 'apiKey',
          in: 'cookie',
          description: 'Refresh token for mobile app sessions',
        })
        .addApiKey(
          {
            type: 'apiKey',
            name: 'X-API-Key',
            in: 'header',
            description: 'API Key for mobile app access',
          },
          'API-Key',
        )
        .addServer(
          `http://localhost:${configService.get<number>('PORT') || 3000}`,
          'Development Server',
        )
        .addServer('https://api.yourdomain.com', 'Production Server')
        .addServer('https://mobile-api.yourdomain.com', 'Mobile API Gateway')
        .addTag('Auth', 'Mobile & Web Authentication endpoints')
        .addTag('Users', 'User management for both platforms')
        .addTag('Mobile', 'Mobile-specific endpoints')
        .addTag('Web', 'Web-specific endpoints')
        .addTag('Health', 'Health monitoring endpoints')
        .build();

      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup('api/docs', app, document, {
        swaggerOptions: {
          persistAuthorization: true,
          tagsSorter: 'alpha',
          operationsSorter: 'alpha',
          docExpansion: 'none',
          filter: true,
          showRequestDuration: true,
        },
        customCss: `
          .swagger-ui .topbar { display: none }
          .swagger-ui .info { margin: 20px 0 }
          .mobile-badge { background: #4CAF50; color: white; padding: 2px 6px; border-radius: 3px; font-size: 12px; margin-left: 8px }
        `,
        customSiteTitle: 'Wellness API - Mobile & Web',
        customfavIcon: '/favicon.ico',
      });

      logger.log('📚 Swagger documentation enabled at /api/docs');
    }

    // Enhanced Health check endpoint for mobile monitoring
    app.getHttpAdapter().get('/health', (req, res) => {
      const healthCheck = {
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        environment: env,
        version: process.env.npm_package_version || '1.0.0',
        platform: 'mobile-web-api',
        services: {
          database: 'connected', // You can add actual DB checks
          cache: 'connected',
          storage: 'connected',
        },
      };

      res.status(200).json(healthCheck);
    });

    // Mobile-specific health check
    app.getHttpAdapter().get('/mobile/health', (req, res) => {
      res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        apiVersion: '1.0',
        minAppVersion: '1.0.0',
        maintenance: false,
        message: 'Mobile API is healthy',
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

    // Try multiple ports if the default is busy
    const defaultPort = configService.get<number>('PORT') || 3000;
    let port = defaultPort;
    let server;

    for (const tryPort of [defaultPort, ...ALTERNATIVE_PORTS]) {
      try {
        server = await app.listen(tryPort);
        port = tryPort;
        logger.log(`✅ Successfully bound to port ${port}`);
        break;
      } catch (error: any) {
        if (error.code === 'EADDRINUSE') {
          logger.warn(`Port ${tryPort} is already in use, trying next port...`);
          continue;
        } else {
          throw error;
        }
      }
    }

    if (!server) {
      throw new Error(
        `Could not find an available port. Tried: ${[defaultPort, ...ALTERNATIVE_PORTS].join(', ')}`,
      );
    }

    // Startup success message
    logger.log(` Wellness API Server is running!`);
    logger.log(` Local: http://localhost:${port}`);
    logger.log(` Network: http://${getLocalIpAddress()}:${port}`);

    if (configService.get<string>('NODE_ENV') !== 'production') {
      logger.log(` API Docs: http://localhost:${port}/api/docs`);
    }

    logger.log(`  Health Check: http://localhost:${port}/health`);
    logger.log(` Mobile Health: http://localhost:${port}/mobile/health`);
    logger.log(`⚡ Environment: ${env}`);
    logger.log(`🕒 Started at: ${new Date().toISOString()}`);
    logger.log(`📊 Platform: Mobile & Web Support Enabled`);
  } catch (error: any) {
    if (error.code === 'EADDRINUSE') {
      logger.error(` Port ${error.port} is already in use. Solutions:`);
      logger.error('   1. Change PORT in .env file');
      logger.error('   2. Kill process: sudo kill -9 $(sudo lsof -t -i:PORT)');
      logger.error('   3. Use different port');
    } else {
      logger.error(` Application bootstrap failed: ${error.message}`);
      logger.error(error.stack || error);
    }
    process.exit(1);
  }
}

// Helper function to get local IP address for mobile testing
function getLocalIpAddress(): string {
  const interfaces = require('os').networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const netInterface of interfaces[name]) {
      if (netInterface.family === 'IPv4' && !netInterface.internal) {
        return netInterface.address;
      }
    }
  }
  return 'localhost';
}

bootstrap();
