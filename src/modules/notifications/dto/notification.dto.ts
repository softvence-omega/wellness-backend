import { IsBoolean, IsDateString, IsOptional } from "class-validator";

export class NotificationDto {
  @IsOptional() @IsBoolean() activityReminders?: boolean;
  @IsOptional() @IsBoolean() mealTracking?: boolean;
  @IsOptional() @IsBoolean() sleepInsights?: boolean;
  @IsOptional() @IsBoolean() progressUpdates?: boolean;
  @IsOptional() @IsBoolean() waterIntake?: boolean;
  @IsOptional() @IsBoolean() motivationalNudges?: boolean;
  @IsOptional() @IsBoolean() wellnessTips?: boolean;
  @IsOptional() @IsBoolean() personalizedTips?: boolean;
  @IsOptional() @IsBoolean() systemAlerts?: boolean;
  @IsOptional() @IsBoolean() doNotDisturb?: boolean;
  @IsOptional() @IsDateString() doNotDisturbStart?: Date;
  @IsOptional() @IsDateString() doNotDisturbEnd?: Date;


}