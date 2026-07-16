-- This Create all permutations and combinations of roles and Mp
WITH roles AS (
    SELECT id, name FROM public.crm_roles
),
modules AS (
    SELECT id, name FROM public.crm_modules
),
permissions AS (
    SELECT id, name FROM public.crm_permissions
),
mp AS (
    SELECT 
        mp.id,
        m.name AS module,
        p.name AS permission
    FROM public.crm_modulepermissions mp
    JOIN modules m ON m.id = mp.module_id
    JOIN permissions p ON p.id = mp.permission_id
),
matrix AS (
    SELECT * FROM (
        VALUES
        ('user','create','System  Admin'),
        ('user','create','Admin'),
        ('user','update','System  Admin'),
        ('user','update','Admin'),
        ('user','view','System  Admin'),
        ('user','view','Admin'),
        ('user','view','Manager'),
        ('user','export','Manager'),

        ('organization','create','System  Admin'),
        ('organization','update','System  Admin'),
        ('organization','view','System  Admin'),

        ('lead','create','Manager'),
        ('lead','create','Executive'),
        ('lead','update','Manager'),
        ('lead','update','Executive'),
        ('lead','view','Manager'),
        ('lead','view','Executive'),
        ('lead','import','Manager'),
        ('lead','export','Manager'),

        ('offers','create','Admin'),
        ('offers','update','Admin'),
        ('offers','view','Admin'),
        ('offers','view','Manager'),
        ('offers','view','Executive'),

        ('reports','create','System  Admin'),
        ('reports','create','Manager'),
        ('reports','view','Manager'),
        ('reports','export','System  Admin'),
        ('reports','export','Manager'),

        ('lead_activity','create','Manager'),
        ('lead_activity','create','Executive'),
        ('lead_activity','update','Manager'),
        ('lead_activity','update','Executive'),
        ('lead_activity','view','Manager'),
        ('lead_activity','view','Executive')
    ) AS t(module, permission, role)
)

INSERT INTO public.crm_rolemodulepermissions (id, role_id, module_permission_id, access)
SELECT 
    gen_random_uuid(),
    r.id,
    mp.id,
    CASE 
        WHEN mtx.role IS NOT NULL THEN true
        ELSE false
    END
FROM roles r
CROSS JOIN mp
LEFT JOIN matrix mtx 
    ON mtx.role = r.name 
    AND mtx.module = mp.module 
    AND mtx.permission = mp.permission
WHERE NOT EXISTS (
    SELECT 1 
    FROM public.crm_rolemodulepermissions existing
    WHERE existing.role_id = r.id 
      AND existing.module_permission_id = mp.id
);

