-- Module Permissions Permutations and Combinations
-- This script generates all possible combinations of permissions for a given set of modules.
INSERT INTO public.crm_modulepermissions (id, module_id, permission_id)
SELECT 
    gen_random_uuid(),
    m.id,
    p.id
FROM public.crm_modules m
CROSS JOIN public.crm_permissions p
WHERE NOT EXISTS (
    SELECT 1 
    FROM public.crm_modulepermissions mp
    WHERE mp.module_id = m.id 
      AND mp.permission_id = p.id
);