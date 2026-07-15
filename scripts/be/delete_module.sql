-- =========================================================================
-- Script to cleanly delete a module and all associated permissions & roles
-- =========================================================================
-- How to use:
-- 1. Edit the value of 'v_module_name' below to the name of the module you want to delete.
-- 2. Run this script against your database. It is safe and idempotent.

DO $$
DECLARE
    -- Change this to the module name you want to delete
    v_module_name VARCHAR := 'segmentation';
    v_module_id VARCHAR;
BEGIN
    -- Get the module ID
    SELECT id INTO v_module_id FROM public.crm_modules WHERE name = v_module_name;

    IF v_module_id IS NULL THEN
        RAISE NOTICE 'Module % not found. Nothing to delete.', v_module_name;
        RETURN;
    END IF;

    RAISE NOTICE 'Deleting module: % (ID: %)', v_module_name, v_module_id;

    -- 1. Delete from crm_organizationrolemodulepermissions (ORMP)
    DELETE FROM public.crm_organizationrolemodulepermissions
    WHERE rmp_id IN (
        SELECT rmp.id 
        FROM public.crm_rolemodulepermissions rmp
        JOIN public.crm_modulepermissions mp ON mp.id = rmp.module_permission_id
        WHERE mp.module_id = v_module_id
    );

    -- 2. Delete from crm_organizationmodules (OM)
    DELETE FROM public.crm_organizationmodules
    WHERE module_id = v_module_id;

    -- 3. Delete from crm_rolemodulepermissions (RMP)
    DELETE FROM public.crm_rolemodulepermissions
    WHERE module_permission_id IN (
        SELECT id FROM public.crm_modulepermissions WHERE module_id = v_module_id
    );

    -- 4. Delete from crm_modulepermissions (MP)
    DELETE FROM public.crm_modulepermissions
    WHERE module_id = v_module_id;

    -- 5. Delete from crm_modules (M)
    DELETE FROM public.crm_modules
    WHERE id = v_module_id;

    RAISE NOTICE 'Module % and all associated permissions cleanly deleted.', v_module_name;
END $$;
