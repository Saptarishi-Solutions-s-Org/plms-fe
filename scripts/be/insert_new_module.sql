-- =========================================================================
-- Script to insert a new module and configure its role & organization permissions
-- =========================================================================
-- How to use:
-- 1. Edit the value of 'v_module_name' below to the name of your new module.
-- 2. Run this script against your database. It is safe and idempotent.

DO $$
DECLARE
    -- Change this to your desired module name
    v_module_name VARCHAR := 'segmentation';
    v_module_id VARCHAR;
BEGIN
    -- 1. Ensure the module exists in crm_modules
    INSERT INTO public.crm_modules (id, name, "default")
    SELECT gen_random_uuid(), v_module_name, true
    WHERE NOT EXISTS (
        SELECT 1 FROM public.crm_modules WHERE name = v_module_name
    );

    -- Get the module ID (whether newly created or existing)
    SELECT id INTO v_module_id FROM public.crm_modules WHERE name = v_module_name;

    RAISE NOTICE 'Processing module: % (ID: %)', v_module_name, v_module_id;

    -- 2. Associate the new module with all standard permissions in crm_modulepermissions
    INSERT INTO public.crm_modulepermissions (id, module_id, permission_id)
    SELECT 
        gen_random_uuid(),
        v_module_id,
        p.id
    FROM public.crm_permissions p
    WHERE NOT EXISTS (
        SELECT 1 
        FROM public.crm_modulepermissions mp
        WHERE mp.module_id = v_module_id 
          AND mp.permission_id = p.id
    );

    -- 3. Insert or update default role permissions in crm_rolemodulepermissions
    -- Rules:
    -- - System Admin (or System  Admin): all access = true
    -- - Admin: all access = false
    -- - Manager: create and import = false, view, update, delete, export = true
    -- - Executive: import = false, create, view, update, delete, export = true
    -- - Others: access = false
    INSERT INTO public.crm_rolemodulepermissions (id, role_id, module_permission_id, access)
    SELECT 
        gen_random_uuid(),
        r.id,
        mp.id,
        CASE
            -- System Admin: Full access
            WHEN LOWER(REGEXP_REPLACE(TRIM(r.name), '\s+', ' ', 'g')) = 'system admin' THEN true
            
            -- Admin: No access
            WHEN LOWER(REGEXP_REPLACE(TRIM(r.name), '\s+', ' ', 'g')) = 'admin' THEN false
            
            -- Manager: create and import no, others yes
            WHEN LOWER(REGEXP_REPLACE(TRIM(r.name), '\s+', ' ', 'g')) = 'manager' THEN 
                CASE 
                    WHEN p.name IN ('create', 'import') THEN false
                    WHEN p.name IN ('view', 'update', 'delete', 'export') THEN true
                    ELSE false
                END
                
            -- Executive: import no, others yes
            WHEN LOWER(REGEXP_REPLACE(TRIM(r.name), '\s+', ' ', 'g')) = 'executive' THEN
                CASE 
                    WHEN p.name = 'import' THEN false
                    WHEN p.name IN ('create', 'view', 'update', 'delete', 'export') THEN true
                    ELSE false
                END
                
            -- Default fallback
            ELSE false
        END AS access
    FROM public.crm_roles r
    CROSS JOIN public.crm_modulepermissions mp
    JOIN public.crm_permissions p ON p.id = mp.permission_id
    WHERE mp.module_id = v_module_id
      AND NOT EXISTS (
          SELECT 1 
          FROM public.crm_rolemodulepermissions existing
          WHERE existing.role_id = r.id 
            AND existing.module_permission_id = mp.id
      );

    -- 4. Assign the new module to all existing organizations in crm_organizationmodules
    INSERT INTO public.crm_organizationmodules (id, organization_id, module_id, createdat, modifiedat)
    SELECT
        gen_random_uuid(),
        org.id,
        v_module_id,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    FROM public.crm_organization org
    WHERE NOT EXISTS (
        SELECT 1 
        FROM public.crm_organizationmodules existing
        WHERE existing.organization_id = org.id
          AND existing.module_id = v_module_id
    );

    -- 5. Propagate role module permissions to organization roles in crm_organizationrolemodulepermissions
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
    WHERE rmp.module_permission_id IN (
        SELECT id FROM public.crm_modulepermissions WHERE module_id = v_module_id
    )
    AND NOT EXISTS (
        SELECT 1 
        FROM public.crm_organizationrolemodulepermissions existing
        WHERE existing.organization_id = ogr.organization_id
          AND existing.organizationrole_id = ogr.id
          AND existing.rmp_id = rmp.id
    );

    RAISE NOTICE 'Module % and permissions successfully configured!', v_module_name;
END $$;
