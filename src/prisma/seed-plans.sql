-- prisma/seed-plans.sql
INSERT INTO "Plan" (
  id, 
  name, 
  "displayName", 
  "priceCents", 
  currency, 
  "maxPrompts", 
  "maxMedicalReports", 
  "maxMealScans", 
  description, 
  "isActive", 
  "createdAt", 
  "updatedAt"
) VALUES 
(
  gen_random_uuid(), 
  'FREE', 
  'Free Plan', 
  0, 
  'usd', 
  2, 
  1, 
  2, 
  'Basic free plan with limited features', 
  true, 
  NOW(), 
  NOW()
),
(
  gen_random_uuid(), 
  'PRO', 
  'Pro Plan', 
  1900, 
  'usd', 
  15, 
  8, 
  12, 
  'Premium plan with unlimited access', 
  true, 
  NOW(), 
  NOW()
);

-- Verify insertion
SELECT name, "displayName", "priceCents", "isActive" FROM "Plan";