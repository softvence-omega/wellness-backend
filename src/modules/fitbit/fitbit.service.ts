import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import * as qs from 'qs';
import { PrismaService } from 'src/prisma/prisma.service';

export interface TokenData {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    obtainedAt: number;
}

function today() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // 0-indexed
    const day = String(today.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`; // Format: YYYY-MM-DD
}

@Injectable()
export class FitbitService {
    private clientId = process.env.FITBIT_CLIENT_ID;
    private clientSecret = process.env.FITBIT_CLIENT_SECRET;
    private redirectUri = process.env.FITBIT_REDIRECT_URI;
    constructor(private readonly prisma: PrismaService) { }

    // In-memory storage for demo, replace with DB for production
    private userTokens: Record<string, TokenData> = {};

    getAuthUrl(userId: string): string {
        return `https://www.fitbit.com/oauth2/authorize?${qs.stringify({
            response_type: 'code',
            client_id: this.clientId,
            redirect_uri: this.redirectUri,
            scope: 'activity heartrate sleep profile',
            expires_in: '604800', // optional, 7 days
            state: userId,
        })}`;
    }

  async exchangeCodeForToken(code: string, userId: string) {
  try {
    const response = await axios.post(
      'https://api.fitbit.com/oauth2/token',
      qs.stringify({
        client_id: this.clientId,
        grant_type: 'authorization_code',
        redirect_uri: this.redirectUri,
        code,
      }),
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    const data = response.data;

    // Save tokens in DB (single update, no transaction needed)
    await this.prisma.user.update({
      where: { id: parseInt(userId) },
      data: {
        fitbitAccessToken: data.access_token,
        fitbitRefreshToken: data.refresh_token,
        fitbitAccessTokenExpiry: new Date(Date.now() + data.expires_in * 1000),
      },
    });

    // Update in-memory cache
    this.userTokens[userId] = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      obtainedAt: Date.now(),
    };

  } catch (error: any) {
    console.error('Error connecting Fitbit:', error.response?.data || error.message);
    throw new HttpException(error.response?.data || error.message, HttpStatus.BAD_REQUEST);
  }
}



    async getAccessToken(userId: string): Promise<string> {
        // Database থেকে user fetch করে access token নেওয়া
        const user = await this.prisma.user.findUnique({
            where: { id: parseInt(userId) },
            select: { fitbitAccessToken: true },
        });

        if (!user || !user.fitbitAccessToken) {
            throw new HttpException('User not connected to Fitbit', HttpStatus.UNAUTHORIZED);
        }
        return user.fitbitAccessToken;
    }


    private async fetchFromFitbit(userId: string, url: string) {
        const accessToken =await this.getAccessToken(userId);
        try {
            const { data } = await axios.get(url, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            return data;
        } catch (error: any) {
            throw new HttpException(error.response?.data || error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getProfile(userId: string) {
        return this.fetchFromFitbit(userId, 'https://api.fitbit.com/1/user/-/profile.json');
    }


    async getActivity(userId: string, date: string = today()) {
        return this.fetchFromFitbit(userId, `https://api.fitbit.com/1/user/-/activities/date/${date}.json`);

    }

    async getHeartRate(userId: string, date: string = today()) {
        return this.fetchFromFitbit(userId, `https://api.fitbit.com/1/user/-/activities/heart/date/${date}/1d.json`);
    }

    async getSleep(userId: string, date: string = today()) {
        return this.fetchFromFitbit(userId, `https://api.fitbit.com/1.2/user/-/sleep/date/${date}.json`);
    }

    async getWeight(userId: string) {
        return this.fetchFromFitbit(userId, 'https://api.fitbit.com/1/user/-/body/log/weight/date/today.json');
    }

    getConnections(userId: string) {
        return this.userTokens[userId] || {};
    }
}
