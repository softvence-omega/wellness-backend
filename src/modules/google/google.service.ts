import { Injectable, UnauthorizedException } from '@nestjs/common';
import { google } from 'googleapis';

@Injectable()
export class GoogleService {
  private clientId: string;

  constructor() {
    this.clientId = process.env.GOOGLE_CLIENT_ID!;
    if (!this.clientId) {
      throw new Error('GOOGLE_CLIENT_ID is not set in env');
    }
  }

  async verifyIdToken(idToken: string) {
    const client = new google.auth.OAuth2(this.clientId);
    try {
      const ticket = await client.verifyIdToken({
        idToken,
        audience: this.clientId,
      });
      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        throw new UnauthorizedException('Invalid Google ID token');
      }
      return {
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
      };
    } catch (err) {
      throw new UnauthorizedException('Failed to verify Google ID token');
    }
  }
}
