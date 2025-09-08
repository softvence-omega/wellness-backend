import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { resetPasswordTemplate, verificationTemplate } from './templates/email-templates';

@Injectable()
export class MailService {
    private transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: Number(process.env.MAIL_PORT),
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
            
        });
    }

    async sendEmailVerification(email: string, otp: string) {
        try {
            await this.transporter.sendMail({
                from: process.env.MAIL_USER,
                to: email,
                subject: 'Verify Your Email',
                html: verificationTemplate(otp),
            });
        } catch (error) {
            throw error;
        }
    }

    async sendPasswordReset(email: string, token: string) {
        try {
            const url = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
            await this.transporter.sendMail({
                from: process.env.SMTP_FROM,
                to: email,
                subject: 'Reset Your Password',
                html: resetPasswordTemplate(url),
            });
        } catch (error) {
            throw error;
        }
    }
}
