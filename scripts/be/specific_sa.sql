WITH org AS (
    INSERT INTO public.crm_organization (
        id, name, code, email, phone, state_id, country_id, is_active, is_super_organization, createdat, modifiedat
    )
    VALUES (
        gen_random_uuid(),
        'SYSTEM',
        'sapt' || substr(md5(random()::text),1,14),
        'sriramgandrothu@saptarishi.tech',
        '7842713943',
        '72bf0d03-f240-42bd-8878-c2a3203b8db0',
        '33e35097-6105-47d8-bd2a-789f4cb16915',
        true,
        true,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    )
    RETURNING id
),

sys_role AS (
    SELECT id FROM public.crm_roles WHERE name = 'System  Admin'
),

org_role AS (
    INSERT INTO public.crm_organizationroles (id, organization_id, role_id)
    SELECT gen_random_uuid(), o.id, r.id
    FROM org o, sys_role r
    RETURNING id, organization_id, role_id
),

allowed_modules AS (
    SELECT id, name FROM public.crm_modules 
    WHERE name IN ('user','roles','organization','reports')
),

-- Insert allowed modules
org_modules AS (
    INSERT INTO public.crm_organizationmodules (id, organization_id, module_id)
    SELECT gen_random_uuid(), o.id, m.id
    FROM org o
    CROSS JOIN allowed_modules m
),

-- All module permissions
mp AS (
    SELECT 
        mp.id,
        m.name AS module,
        rmp.id AS rmp_id,
        rmp.access
    FROM public.crm_modulepermissions mp
    JOIN public.crm_modules m ON m.id = mp.module_id
    JOIN public.crm_rolemodulepermissions rmp ON rmp.module_permission_id = mp.id
    JOIN sys_role sr ON sr.id = rmp.role_id
),

final_insert AS (
    INSERT INTO public.crm_organizationrolemodulepermissions (
        id,
        organization_id,
        organizationrole_id,
        rmp_id,
        access
    )
    SELECT 
        gen_random_uuid(),
        o.id,
        orr.id,
        mp.rmp_id,
        CASE 
            WHEN mp.module IN ('user','roles','organization','reports') 
                THEN mp.access
            ELSE false
        END
    FROM org o
    JOIN org_role orr ON orr.organization_id = o.id
    CROSS JOIN mp
)

SELECT 'DONE';