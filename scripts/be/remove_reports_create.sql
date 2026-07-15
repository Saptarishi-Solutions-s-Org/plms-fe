-- =========================================================================
-- Script to remove 'reports' module 'create' permissions from RMP and ORMP.
-- =========================================================================

-- 1. Delete from crm_organizationrolemodulepermissions
DELETE FROM crm_organizationrolemodulepermissions
WHERE rmp_id IN (
    SELECT rmp.id 
    FROM crm_rolemodulepermissions rmp
    JOIN crm_modulepermissions mp ON mp.id = rmp.module_permission_id
    JOIN crm_modules m ON m.id = mp.module_id
    JOIN crm_permissions p ON p.id = mp.permission_id
    WHERE m.name = 'reports' AND p.name = 'create'
);

-- 2. Delete from crm_rolemodulepermissions (RMP)
DELETE FROM crm_rolemodulepermissions
WHERE module_permission_id IN (
    SELECT mp.id 
    FROM crm_modulepermissions mp
    JOIN crm_modules m ON m.id = mp.module_id
    JOIN crm_permissions p ON p.id = mp.permission_id
    WHERE m.name = 'reports' AND p.name = 'create'
);
