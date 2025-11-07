import { PlanName } from "@prisma/client";
import { IsEnum, IsNotEmpty } from "class-validator";



export class CreatePaymentIntentDto {
    @IsNotEmpty()
    @IsEnum(PlanName)
    planName: PlanName;
}