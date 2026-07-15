-- =========================================================================
-- Script to insert the 'segmentation' module into public.crm_modules
-- =========================================================================
-- This script is fully idempotent and safe to run multiple times.

INSERT INTO public.crm_modules (id, name, "default")
SELECT gen_random_uuid(), 'segmentation', true
WHERE NOT EXISTS (
    SELECT 1 FROM public.crm_modules WHERE name = 'segmentation'
);
