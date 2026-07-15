-- Seed script to ensure standard permissions exist in crm_permissions
INSERT INTO public.crm_permissions (id, name)
SELECT gen_random_uuid(), p.name
FROM (
    VALUES 
    ('create'),
    ('update'),
    ('view'),
    ('delete'),
    ('import'),
    ('export')
) AS p(name)
WHERE NOT EXISTS (
    SELECT 1 FROM public.crm_permissions WHERE name = p.name
);
