// import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
// import axios from 'axios';
// import * as qs from 'qs';
// import { PrismaService } from 'src/prisma/prisma.service';

// export interface TokenData {
//   accessToken: string;
//   refreshToken: string;
//   expiresAt: number; // UNIX timestamp
// }

// @Injectable()
// export class StravaService {
//   private clientId = process.env.STRAVA_CLIENT_ID;
//   private clientSecret = process.env.STRAVA_CLIENT_SECRET;
//   private redirectUri = process.env.STRAVA_REDIRECT_URI;

//   constructor(private readonly prisma: PrismaService) {}

//   private userTokens: Record<string, TokenData> = {};

//   getAuthUrl(userId: string): string {
//     return `https://www.strava.com/oauth/authorize?${qs.stringify({
//       client_id: this.clientId,
//       response_type: 'code',
//       redirect_uri: this.redirectUri,
//       scope: 'activity:read_all,profile:read_all',
//       state: userId,
//       approval_prompt: 'auto',
//     })}`;
//   }

//   async exchangeCodeForToken(code: string, userId: string) {
//     try {
//       const response = await axios.post(
//         'https://www.strava.com/oauth/token',
//         qs.stringify({
//           client_id: this.clientId,
//           client_secret: this.clientSecret,
//           code,
//           grant_type: 'authorization_code',
//         }),
//         {
//           headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
//         }
//       );

//       const data = response.data;

//       await this.prisma.$transaction(async (tx) => {
//         await tx.user.update({
//           where: { id: parseInt(userId) },
//           data: {
//             stravaAccessToken: data.access_token,
//             stravaRefreshToken: data.refresh_token,
//             stravaAccessTokenExpiry: new Date(data.expires_at * 1000),
//           },
//         });

//         this.userTokens[userId] = {
//           accessToken: data.access_token,
//           refreshToken: data.refresh_token,
//           expiresAt: data.expires_at,
//         };
//       });
//     } catch (error: any) {
//       console.error('Error connecting Strava:', error.response?.data || error.message);
//       throw new HttpException(error.response?.data || error.message, HttpStatus.BAD_REQUEST);
//     }
//   }

//   async getAccessToken(userId: string): Promise<string> {
//     const user = await this.prisma.user.findUnique({
//       where: { id: parseInt(userId) },
//       select: { stravaAccessToken: true, stravaRefreshToken: true, stravaAccessTokenExpiry: true },
//     });

//     if (!user || !user.stravaAccessToken) {
//       throw new HttpException('User not connected to Strava', HttpStatus.UNAUTHORIZED);
//     }

//     // Refresh token if expired
//     if (user.stravaAccessTokenExpiry && user.stravaAccessTokenExpiry.getTime() < Date.now()) {
//       return this.refreshToken(userId, user.stravaRefreshToken);
//     }

//     return user.stravaAccessToken;
//   }

//   private async refreshToken(userId: string, refreshToken: string | null): Promise<string> {
//     try {
//       const response = await axios.post(
//         'https://www.strava.com/oauth/token',
//         qs.stringify({
//           client_id: this.clientId,
//           client_secret: this.clientSecret,
//           grant_type: 'refresh_token',
//           refresh_token: refreshToken,
//         }),
//         {
//           headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
//         }
//       );

//       const data = response.data;

//       await this.prisma.user.update({
//         where: { id: parseInt(userId) },
//         data: {
//           stravaAccessToken: data.access_token,
//           stravaRefreshToken: data.refresh_token,
//           stravaAccessTokenExpiry: new Date(data.expires_at * 1000),
//         },
//       });

//       this.userTokens[userId] = {
//         accessToken: data.access_token,
//         refreshToken: data.refresh_token,
//         expiresAt: data.expires_at,
//       };

//       return data.access_token;
//     } catch (error: any) {
//       console.error('Error refreshing Strava token:', error.response?.data || error.message);
//       throw new HttpException('Unable to refresh Strava token', HttpStatus.UNAUTHORIZED);
//     }
//   }

//   private async fetchFromStrava(userId: string, url: string, params?: any) {
//     const accessToken = await this.getAccessToken(userId);
//     try {
//       const { data } = await axios.get(url, {
//         headers: { Authorization: `Bearer ${accessToken}` },
//         params,
//       });
//       return data;
//     } catch (error: any) {
//       throw new HttpException(error.response?.data || error.message, HttpStatus.INTERNAL_SERVER_ERROR);
//     }
//   }

//   async getProfile(userId: string) {
//     return this.fetchFromStrava(userId, 'https://www.strava.com/api/v3/athlete');
//   }

//   async getActivities(userId: string, after?: number, before?: number) {
//     const params: any = {};
//     if (after) params.after = after;
//     if (before) params.before = before;

//     return this.fetchFromStrava(userId, 'https://www.strava.com/api/v3/athlete/activities', params);
//   }

//   getConnections(userId: string) {
//     return this.userTokens[userId] || {};
//   }
// }
