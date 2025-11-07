export class SubscriptionResponseDto {
  id: string;
  userId: string;
  planId: string;
  status: string;
  usage: {
    promptsUsed: number;
    medicalReportsUsed: number;
    mealScansUsed: number;
  };
  plan: {
    name: string;
    displayName: string;
    priceCents: number;
    maxPrompts: number;
    maxMedicalReports: number;
    maxMealScans: number;
  };
}