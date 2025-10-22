// types/user.types.ts
export interface UserResponse {
  id: string;
  email: string;
  phone?: string;
  role: UserRole;
  isAgreeTerms: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  profile?: ProfileResponse;
  notification?: NotificationResponse;
  deviceIntegration?: DeviceIntegrationResponse;
}

export interface ProfileResponse {
  id: string;
  fullName?: string;
  photo?: string;
  isEnableNotification: boolean;
  language: Language;
  dateOfBirth?: Date;
  gender?: Gender;
  height?: number;
  weight?: number;
  healthGoal?: HealthGoal;
}

export interface NotificationResponse {
  id: string;
  activityReminders: boolean;
  mealTracking: boolean;
  sleepInsights: boolean;
  progressUpdates: boolean;
  waterIntake: boolean;
  motivationalNudges: boolean;
  wellnessTips: boolean;
  personalizedTips: boolean;
  systemAlerts: boolean;
  doNotDisturb: boolean;
  doNotDisturbStart?: Date;
  doNotDisturbEnd?: Date;
}

export interface DeviceIntegrationResponse {
  id: string;
  appleHealth_isConnected: boolean;
  appleHealth_lastSync?: Date;
  googleFit_isConnected: boolean;
  googleFit_lastSync?: Date;
  fitbit_isConnected: boolean;
  fitbit_lastSync?: Date;
  strava_isConnected: boolean;
  strava_lastSync?: Date;
  auto_sync?: Date;
}

export interface UserListResponse {
  success: boolean;
  data: UserResponse[];
  count: number;
  pagination?: {
    page: number;
    limit: number;
    totalPages: number;
    totalCount: number;
  };
}

export interface SingleUserResponse {
  success: boolean;
  data: UserResponse;
}

// Enums from your Prisma schema
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export enum Language {
  EN = 'EN',
  BN = 'BN'
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER'
}

export enum HealthGoal {
  LOSE_WEIGHT = 'LOSE_WEIGHT',
  BUILD_MUSCLE = 'BUILD_MUSCLE',
  MAINTAIN_HEALTH = 'MAINTAIN_HEALTH',
  IMPROVE = 'IMPROVE'
}