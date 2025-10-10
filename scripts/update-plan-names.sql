-- Update subscription plan names in database
-- This script updates existing plan names to match the new naming convention

-- Update Free plan to Hobby
UPDATE "SubscriptionPlan" 
SET name = 'Hobby', "displayName" = 'Хоби', description = 'Идеален за начинаещи художници, които искат да споделят своето творчество и да изградят първоначална аудитория.'
WHERE name = 'Free';

-- Update Medium plan to Pro  
UPDATE "SubscriptionPlan" 
SET name = 'Pro', "displayName" = 'Професионален', description = 'За професионални художници, които искат да разширят своето присъствие и да увеличат продажбите на своите произведения.'
WHERE name = 'Medium';

-- Update High plan to Business
UPDATE "SubscriptionPlan" 
SET name = 'Business', "displayName" = 'Бизнес', description = 'За галерии, арт агенции и големи художници, които управляват мащабни арт проекти и искат максимална видимост.'
WHERE name = 'High';

-- Verify the updates
SELECT id, name, "displayName", description, "monthlyPrice", "yearlyPrice" 
FROM "SubscriptionPlan" 
ORDER BY "monthlyPrice" ASC;
