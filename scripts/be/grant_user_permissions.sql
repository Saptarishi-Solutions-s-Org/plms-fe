-- =========================================================================
-- SQL Script to grant all permissions to all modules for a specific user,
-- role, and organization.
-- =========================================================================

BEGIN;

-- 1. Enable all modules for the organization
-- This ensures the organization has access to all modules in the master list.
INSERT INTO public.crm_organizationmodules (id, organization_id, module_id, createdat, modifiedat)
SELECT 
    gen_random_uuid(),
    '08c3652d-3c38-4471-ada4-acda20005a7a',
    m.id,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM public.crm_modules m
WHERE NOT EXISTS (
    SELECT 1 
    FROM public.crm_organizationmodules existing
    WHERE existing.organization_id::text = '08c3652d-3c38-4471-ada4-acda20005a7a'::text
      AND existing.module_id::text = m.id::text
);

-- 2. Populate and grant full access to all module permissions for the organization role
-- This maps all default role module permissions (RMPs) to this organization role with access = true.
INSERT INTO public.crm_organizationrolemodulepermissions (
    id, organization_id, organizationrole_id, rmp_id, access, createdat, modifiedat
)
SELECT
    gen_random_uuid(),
    '08c3652d-3c38-4471-ada4-acda20005a7a',
    '38ad0fad-8bfc-4d4d-8fba-35ec2d0d7213',
    rmp.id,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM public.crm_rolemodulepermissions rmp
JOIN public.crm_organizationroles ogr ON ogr.role_id::text = rmp.role_id::text
WHERE ogr.id::text = '38ad0fad-8bfc-4d4d-8fba-35ec2d0d7213'::text
  AND NOT EXISTS (
      SELECT 1 
      FROM public.crm_organizationrolemodulepermissions existing
      WHERE existing.organization_id::text = '08c3652d-3c38-4471-ada4-acda20005a7a'::text
        AND existing.organizationrole_id::text = '38ad0fad-8bfc-4d4d-8fba-35ec2d0d7213'::text
        AND existing.rmp_id::text = rmp.id::text
  );

-- Update all existing organization role module permissions to true
UPDATE public.crm_organizationrolemodulepermissions
SET access = true,
    modifiedat = CURRENT_TIMESTAMP
WHERE organization_id::text = '08c3652d-3c38-4471-ada4-acda20005a7a'::text
  AND organizationrole_id::text = '38ad0fad-8bfc-4d4d-8fba-35ec2d0d7213'::text;

-- 3. Map the user to the organization and dynamically assign the role
DO $$
BEGIN
    -- Update organization reference for the user
    UPDATE public.crm_user
    SET organization_id = '08c3652d-3c38-4471-ada4-acda20005a7a'
    WHERE id::text = '19cf9763-9023-4ffc-8713-4f53b54087c1'::text;

    -- Dynamically update the role association based on the active schema
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'crm_user' 
          AND column_name = 'organizationrole_id'
    ) THEN
        UPDATE public.crm_user
        SET organizationrole_id = '38ad0fad-8bfc-4d4d-8fba-35ec2d0d7213'
        WHERE id::text = '19cf9763-9023-4ffc-8713-4f53b54087c1'::text;
    ELSIF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'crm_user' 
          AND column_name = 'role_id'
    ) THEN
        UPDATE public.crm_user
        SET role_id = '38ad0fad-8bfc-4d4d-8fba-35ec2d0d7213'
        WHERE id::text = '19cf9763-9023-4ffc-8713-4f53b54087c1'::text;
    ELSIF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'crm_user' 
          AND column_name = 'org_role_id'
    ) THEN
        UPDATE public.crm_user
        SET org_role_id = '38ad0fad-8bfc-4d4d-8fba-35ec2d0d7213'
        WHERE id::text = '19cf9763-9023-4ffc-8713-4f53b54087c1'::text;
    END IF;
END $$;

COMMIT;
