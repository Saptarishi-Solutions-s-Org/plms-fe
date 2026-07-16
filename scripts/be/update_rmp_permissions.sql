-- =========================================================================
-- Script to update default Role Module Permissions (RMP) and propagate them
-- to all existing organizations.
-- =========================================================================
-- How to use:
-- 1. Edit the list of allowed permissions in the 'temp_desired_rmp' table below.
--    Only modules listed in this table will have their permissions updated.
--    Any custom modules (e.g. 'segmentation') not listed here will remain untouched.
-- 2. Run this script against your PostgreSQL database.
-- =========================================================================

BEGIN;

-- Create a temporary table of desired permissions
CREATE TEMP TABLE temp_desired_rmp (
    module VARCHAR(255),
    permission VARCHAR(255),
    role VARCHAR(255)
) ON COMMIT DROP;

-- Specify all default permissions that should be set to TRUE (access = true)
INSERT INTO temp_desired_rmp (module, permission, role) VALUES
    -- User Module Permissions
    ('user', 'create', 'System Admin'),
    ('user', 'create', 'System  Admin'),
    ('user', 'create', 'Admin'),
    ('user', 'update', 'System Admin'),
    ('user', 'update', 'System  Admin'),
    ('user', 'update', 'Admin'),
    ('user', 'view', 'System Admin'),
    ('user', 'view', 'System  Admin'),
    ('user', 'view', 'Admin'),
    -- MANAGER defaults (view, update, export)
    ('user', 'view', 'Manager'),
    ('user', 'export', 'Manager'),

    -- Organization Module Permissions
    ('organization', 'create', 'System Admin'),
    ('organization', 'create', 'System  Admin'),
    ('organization', 'update', 'System Admin'),
    ('organization', 'update', 'System  Admin'),
    ('organization', 'view', 'System Admin'),
    ('organization', 'view', 'System  Admin'),

    -- Lead Module Permissions
    ('lead', 'create', 'Manager'),
    ('lead', 'create', 'Executive'),
    ('lead', 'update', 'Manager'),
    ('lead', 'update', 'Executive'),
    ('lead', 'view', 'Manager'),
    ('lead', 'view', 'Executive'),
    ('lead', 'import', 'Manager'),
    ('lead', 'export', 'Manager'),

    -- Offers Module Permissions
    ('offers', 'create', 'Admin'),
    ('offers', 'update', 'Admin'),
    ('offers', 'view', 'Admin'),
    ('offers', 'view', 'Manager'),
    ('offers', 'view', 'Executive'),

    -- Reports Module Permissions
    ('reports', 'create', 'System Admin'),
    ('reports', 'create', 'System  Admin'),
    ('reports', 'create', 'Manager'),
    ('reports', 'view', 'Manager'),
    ('reports', 'export', 'System Admin'),
    ('reports', 'export', 'System  Admin'),
    ('reports', 'export', 'Manager'),

    -- Lead Activity Module Permissions
    ('lead_activity', 'create', 'Manager'),
    ('lead_activity', 'create', 'Executive'),
    ('lead_activity', 'update', 'Manager'),
    ('lead_activity', 'update', 'Executive'),
    ('lead_activity', 'view', 'Manager'),
    ('lead_activity', 'view', 'Executive');

-- 1. Ensure all combinations of roles and module permissions exist in public.crm_rolemodulepermissions.
-- If any combination is missing, insert it with access = false.
INSERT INTO public.crm_rolemodulepermissions (id, role_id, module_permission_id, access, createdat, modifiedat)
SELECT 
    gen_random_uuid(),
    r.id,
    mp.id,
    false,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM public.crm_roles r
CROSS JOIN (
    SELECT mp.id, m.name AS module, p.name AS permission
    FROM public.crm_modulepermissions mp
    JOIN public.crm_modules m ON m.id = mp.module_id
    JOIN public.crm_permissions p ON p.id = mp.permission_id
) mp
WHERE NOT EXISTS (
    SELECT 1 
    FROM public.crm_rolemodulepermissions existing
    WHERE existing.role_id = r.id 
      AND existing.module_permission_id = mp.id
);

-- 2. Update default RMP permissions in public.crm_rolemodulepermissions based on the matrix.
-- Note: Only modules listed in temp_desired_rmp will have their permissions updated.
UPDATE public.crm_rolemodulepermissions rmp
SET access = CASE WHEN mtx.role IS NOT NULL THEN true ELSE false END,
    modifiedat = CURRENT_TIMESTAMP
FROM public.crm_roles r
JOIN (
    SELECT mp.id, m.name AS module, p.name AS permission
    FROM public.crm_modulepermissions mp
    JOIN public.crm_modules m ON m.id = mp.module_id
    JOIN public.crm_permissions p ON p.id = mp.permission_id
) mp ON true
LEFT JOIN temp_desired_rmp mtx
    ON LOWER(REGEXP_REPLACE(TRIM(mtx.role), '\s+', ' ', 'g')) = LOWER(REGEXP_REPLACE(TRIM(r.name), '\s+', ' ', 'g'))
    AND LOWER(TRIM(mtx.module)) = LOWER(TRIM(mp.module))
    AND LOWER(TRIM(mtx.permission)) = LOWER(TRIM(mp.permission))
WHERE rmp.role_id = r.id 
  AND rmp.module_permission_id = mp.id
  AND mp.module IN (SELECT DISTINCT module FROM temp_desired_rmp);

-- 3. Ensure all organizations have the required crm_organizationrolemodulepermissions entries.
-- If any organization role is missing a mapping, insert it with access matching the default.
INSERT INTO public.crm_organizationrolemodulepermissions (
    id, organization_id, organizationrole_id, rmp_id, access, createdat, modifiedat
)
SELECT
    gen_random_uuid(),
    ogr.organization_id,
    ogr.id AS organizationrole_id,
    rmp.id AS rmp_id,
    rmp.access,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM public.crm_organizationroles ogr
JOIN public.crm_rolemodulepermissions rmp ON rmp.role_id = ogr.role_id
WHERE NOT EXISTS (
    SELECT 1 
    FROM public.crm_organizationrolemodulepermissions existing
    WHERE existing.organization_id = ogr.organization_id
      AND existing.organizationrole_id = ogr.id
      AND existing.rmp_id = rmp.id
);

-- 4. Propagate updated default RMP permissions to all existing organizations.
-- This updates access for existing organization roles to match their master RMP access.
-- Again, we limit this to modules that are defined in temp_desired_rmp to keep other modules untouched.
UPDATE public.crm_organizationrolemodulepermissions ormp
SET access = rmp.access,
    modifiedat = CURRENT_TIMESTAMP
FROM public.crm_rolemodulepermissions rmp
JOIN (
    SELECT mp.id, m.name AS module
    FROM public.crm_modulepermissions mp
    JOIN public.crm_modules m ON m.id = mp.module_id
) mp ON mp.id = rmp.module_permission_id
WHERE ormp.rmp_id = rmp.id
  AND ormp.access IS DISTINCT FROM rmp.access
  AND mp.module IN (SELECT DISTINCT module FROM temp_desired_rmp);

-- Clean up temporary table
DROP TABLE IF EXISTS temp_desired_rmp;

COMMIT;
