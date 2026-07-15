-- =========================================================================
-- Script to view and verify permissions assigned to roles for a module
-- =========================================================================
-- How to use:
-- 1. Edit the value of 'v_module_name' below to filter by your module name.
-- 2. Run this script against your database to see a tabular report of access rights.

SELECT 
    m.name AS module_name,
    r.name AS role_name,
    p.name AS permission_name,
    rmp.access AS has_access
FROM public.crm_rolemodulepermissions rmp
JOIN public.crm_roles r ON r.id = rmp.role_id
JOIN public.crm_modulepermissions mp ON mp.id = rmp.module_permission_id
JOIN public.crm_modules m ON m.id = mp.module_id
JOIN public.crm_permissions p ON p.id = mp.permission_id
WHERE m.name = 'segmentation' -- Change to your module name to filter
ORDER BY 
    m.name, 
    CASE 
        WHEN LOWER(r.name) LIKE '%system%admin%' THEN 1
        WHEN LOWER(r.name) = 'admin' THEN 2
        WHEN LOWER(r.name) = 'manager' THEN 3
        WHEN LOWER(r.name) = 'executive' THEN 4
        ELSE 5
    END, 
    p.name;
