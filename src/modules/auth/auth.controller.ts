import { Controller, Post, Body, Get, Redirect, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { successResponse } from 'src/common/response';
import { GoogleService } from '../google/google.service';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService, private googleService: GoogleService,
    ) { }

    @Post('register')
    async register(@Body() createUserDto: CreateUserDto) {
        const result = await this.authService.register(createUserDto);
        return successResponse(result, "Registration successfully");
    }

    @Post('login')
    async login(@Body() loginUserDto: LoginUserDto) {
        const result = await this.authService.login(loginUserDto);
        return successResponse(result, "Login successfully");
    }

    @Post('forgot-password')
    async forgotPassword(@Body('email') email: string) {
        const result = await this.authService.forgotPassword(email);
        return successResponse(result, "OTP has been sent to your email");
    }

    @Post('verify-otp')
    async verifyOtp(@Body() { email, otp }: { email: string; otp: string }) {
        const result = await this.authService.verifyOtp(email, otp);
        return successResponse(result, "OTP verified successfully");
    }

    @Post('reset-password')
    async resetPassword(@Body() { email, otp, newPassword }: { email: string; otp: string; newPassword: string }) {
        const result = await this.authService.resetPasswordWithOtp(email, otp, newPassword);
        return successResponse(result, "Password changed successfully");
    }

    @Post('google-mobile-login')
    async googleMobileLogin(@Body('idToken') idToken: string) {
        // 1️⃣ Verify token and get Google user info
        const googleUser = await this.googleService.verifyIdToken(idToken);

        // 2️⃣ Login or register user in your DB
        const token = await this.authService.googleMobileLogin(googleUser);

        return { accessToken: token.accessToken };
    }

    @Post('apple-mobile-login')
    async appleMobileLogin(@Body('code') code: string) {
        const token = await this.authService.appleMobileLogin(code);
        return { accessToken: token.accessToken };
    }
}