import { IsNumber, IsOptional, IsBoolean, Min } from 'class-validator';

export class UpdateNudgeProgressDto {
  @IsNumber()
  @Min(0)
  consumedAmount: number;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}
