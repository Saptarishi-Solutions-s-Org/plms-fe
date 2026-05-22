DO $$
DECLARE
    v_org_id UUID;
    v_role_id UUID;
    v_org_role_id UUID;
BEGIN

-- 1. CREATE SYSTEM ORGANIZATION
INSERT INTO public.crm_organization (
    id, name, code, email, phone, state_id, country_id,
    is_active, is_super_organization, createdat, modifiedat
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
RETURNING id INTO v_org_id;


-- 2. GET SYSTEM ADMIN ROLE
SELECT id INTO v_role_id 
FROM public.crm_roles 
WHERE LOWER(name) = 'system admin';


-- 3. CREATE ORGANIZATION ROLE
INSERT INTO public.crm_organizationroles (
    id, organization_id, role_id, createdat, modifiedat
)
VALUES (
    gen_random_uuid(),
    v_org_id,
    v_role_id,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
RETURNING id INTO v_org_role_id;


-- 4. ASSIGN ALL MODULES TO SYSTEM ORG
INSERT INTO public.crm_organizationmodules (
    id, organization_id, module_id, createdat, modifiedat
)
SELECT
    gen_random_uuid(),
    v_org_id,
    m.id,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM public.crm_modules m;


-- 5. ASSIGN FULL RMP ACCESS
INSERT INTO public.crm_organizationrolemodulepermissions (
    id,
    organization_id,
    organizationrole_id,
    rmp_id,
    access,
    createdat,
    modifiedat
)
SELECT
    gen_random_uuid(),
    v_org_id,
    v_org_role_id,
    rmp.id,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM public.crm_rolemodulepermissions rmp
JOIN public.crm_roles r ON r.id = rmp.role_id
WHERE LOWER(r.name) = 'system admin';


END $$;