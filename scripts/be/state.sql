-- This script is used to insert seed file into state table
-- Must change the country id
WITH country AS (
    SELECT '33e35097-6105-47d8-bd2a-789f4cb16915'::varchar AS country_id
)
INSERT INTO public.crm_state (id, name, statecode, country_id, createdat, modifiedat)
SELECT 
    gen_random_uuid(),
    s.name,
    s.statecode,
    c.country_id,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM country c
CROSS JOIN (
    VALUES
    ('West Bengal', 'WB'),
    ('Nagaland', 'NL'),
    ('Ladakh', 'LA'),
    ('Arunachal Pradesh', 'AR'),
    ('Sikkim', 'SK'),
    ('Bihar', 'BR'),
    ('Uttarakhand', 'UK'),
    ('Chandigarh', 'CH'),
    ('Lakshadweep', 'LD'),
    ('Puducherry', 'PY'),
    ('Kerala', 'KL'),
    ('Meghalaya', 'ML'),
    ('Haryana', 'HR'),
    ('Rajasthan', 'RJ'),
    ('Madhya Pradesh', 'MP'),
    ('Tamil Nadu', 'TN'),
    ('Manipur', 'MN'),
    ('Odisha', 'OD'),
    ('Goa', 'GA'),
    ('Assam', 'AS'),
    ('Delhi', 'DL'),
    ('Himachal Pradesh', 'HP'),
    ('Punjab', 'PB'),
    ('Maharashtra', 'MH'),
    ('Gujarat', 'GJ'),
    ('Dadra and Nagar Haveli and Daman and Diu', 'DN'),
    ('Mizoram', 'MZ'),
    ('Tripura', 'TR'),
    ('Andhra Pradesh', 'AP'),
    ('Karnataka', 'KA'),
    ('Andaman and Nicobar Islands', 'AN'),
    ('Telangana', 'TS'),
    ('Jharkhand', 'JH'),
    ('Uttar Pradesh', 'UP'),
    ('Chhattisgarh', 'CG'),
    ('Jammu and Kashmir', 'JK')
) AS s(name, statecode);