import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import * as qs from 'qs';

export  interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  obtainedAt: number;
}

@Injectable()
export class FitbitService {
  private clientId = process.env.FITBIT_CLIENT_ID;
  private clientSecret = process.env.FITBIT_CLIENT_SECRET;
  private redirectUri = process.env.FITBIT_REDIRECT_URI;

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
      this.userTokens[userId] = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in,
        obtainedAt: Date.now(),
      };

      return this.userTokens[userId];
    } catch (error: any) {
      throw new HttpException(error.response?.data || error.message, HttpStatus.BAD_REQUEST);
    }
  }

  getAccessToken(userId: string) {
    const token = this.userTokens[userId];
    if (!token) throw new HttpException('User not connected to Fitbit', HttpStatus.UNAUTHORIZED);
    return token.accessToken;
  }

  private async fetchFromFitbit(userId: string, url: string) {
    const accessToken = this.getAccessToken(userId);
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

  async getDevices(userId: string) {
    return this.fetchFromFitbit(userId, 'https://api.fitbit.com/1/user/-/devices.json');
  }

  async getActivity(userId: string, date: string = 'today') {
    return this.fetchFromFitbit(userId, `https://api.fitbit.com/1/user/-/activities/date/${date}.json`);
  }

  async getHeartRate(userId: string, date: string = 'today') {
    return this.fetchFromFitbit(userId, `https://api.fitbit.com/1/user/-/activities/heart/date/${date}/1d.json`);
  }

  async getSleep(userId: string, date: string = 'today') {
    return this.fetchFromFitbit(userId, `https://api.fitbit.com/1.2/user/-/sleep/date/${date}.json`);
  }

  async getWeight(userId: string) {
    return this.fetchFromFitbit(userId, 'https://api.fitbit.com/1/user/-/body/log/weight/date/today.json');
  }

  getConnections(userId: string) {
    return this.userTokens[userId] || {};
  }
}
