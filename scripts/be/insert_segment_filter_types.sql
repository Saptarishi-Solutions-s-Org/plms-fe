-- Seed default segment filter types metadata
INSERT INTO crm_segmentfiltertypes (id, name, label, category, operator_type, "default", createdat, modifiedat) VALUES
  ('a1b1c1d1-0001-4000-8000-000000000001', 'gender', 'Gender', 'Demographic', 'Select', true, NOW(), NOW()),
  ('a1b1c1d1-0002-4000-8000-000000000002', 'age', 'Age', 'Demographic', 'Number', true, NOW(), NOW()),
  ('a1b1c1d1-0003-4000-8000-000000000003', 'dob', 'Date of Birth', 'Demographic', 'Date', true, NOW(), NOW()),
  ('a1b1c1d1-0004-4000-8000-000000000004', 'birthday_month', 'Birthday Month', 'Demographic', 'Select', true, NOW(), NOW()),
  ('a1b1c1d1-0005-4000-8000-000000000005', 'city', 'City', 'Demographic', 'Text', true, NOW(), NOW()),
  ('a1b1c1d1-0006-4000-8000-000000000006', 'state', 'State', 'Demographic', 'Text', true, NOW(), NOW()),
  ('a1b1c1d1-0007-4000-8000-000000000007', 'country', 'Country', 'Demographic', 'Text', true, NOW(), NOW()),
  ('a1b1c1d1-0008-4000-8000-000000000008', 'postal_code', 'Postal Code', 'Demographic', 'Text', true, NOW(), NOW()),

  ('b2c2d2e2-0001-4000-8000-000000000001', 'status', 'Status', 'Lead Information', 'Select', true, NOW(), NOW()),
  ('b2c2d2e2-0002-4000-8000-000000000002', 'priority', 'Priority', 'Lead Information', 'Select', true, NOW(), NOW()),
  ('b2c2d2e2-0003-4000-8000-000000000003', 'source', 'Source', 'Lead Information', 'Select', true, NOW(), NOW()),
  ('b2c2d2e2-0004-4000-8000-000000000004', 'import_type', 'Import Type', 'Lead Information', 'Select', true, NOW(), NOW()),
  ('b2c2d2e2-0005-4000-8000-000000000005', 'assigned_executive', 'Assigned Executive', 'Lead Information', 'Select', true, NOW(), NOW()),
  ('b2c2d2e2-0006-4000-8000-000000000006', 'reporting_manager', 'Reporting Manager', 'Lead Information', 'Select', true, NOW(), NOW()),

  ('c3d3e3f3-0001-4000-8000-000000000001', 'has_email', 'Has Email', 'Contact', 'Boolean', true, NOW(), NOW()),
  ('c3d3e3f3-0002-4000-8000-000000000002', 'has_phone', 'Has Phone Number', 'Contact', 'Boolean', true, NOW(), NOW()),
  ('c3d3e3f3-0003-4000-8000-000000000003', 'email_domain', 'Email Domain', 'Contact', 'Text', true, NOW(), NOW()),

  ('d4e4f4a4-0001-4000-8000-000000000001', 'created_date', 'Created Date', 'Date', 'Date', true, NOW(), NOW()),
  ('d4e4f4a4-0002-4000-8000-000000000002', 'updated_date', 'Updated Date', 'Date', 'Date', true, NOW(), NOW()),
  ('d4e4f4a4-0003-4000-8000-000000000003', 'created_today', 'Created Today', 'Date', 'Boolean', true, NOW(), NOW()),
  ('d4e4f4a4-0004-4000-8000-000000000004', 'created_this_week', 'Created This Week', 'Date', 'Boolean', true, NOW(), NOW()),
  ('d4e4f4a4-0005-4000-8000-000000000005', 'created_this_month', 'Created This Month', 'Date', 'Boolean', true, NOW(), NOW()),

  ('e5f5a5b5-0001-4000-8000-000000000001', 'last_activity_date', 'Last Activity Date', 'Activity', 'Date', true, NOW(), NOW()),
  ('e5f5a5b5-0002-4000-8000-000000000002', 'no_activity_days', 'No Activity for X Days', 'Activity', 'Number', true, NOW(), NOW()),
  ('e5f5a5b5-0003-4000-8000-000000000003', 'activity_count', 'Activity Count', 'Activity', 'Number', true, NOW(), NOW()),
  ('e5f5a5b5-0004-4000-8000-000000000004', 'followup_pending', 'Follow-up Pending/Overdue', 'Activity', 'Boolean', true, NOW(), NOW()),

  ('f6a6b6c6-0001-4000-8000-000000000001', 'has_offer', 'Has Offer Assigned', 'Offer', 'Boolean', true, NOW(), NOW()),
  ('f6a6b6c6-0002-4000-8000-000000000002', 'offer_status', 'Offer Status', 'Offer', 'Select', true, NOW(), NOW()),
  ('f6a6b6c6-0003-4000-8000-000000000003', 'offer_validity', 'Offer Validity', 'Offer', 'Date', true, NOW(), NOW()),

  ('a7b7c7d7-0001-4000-8000-000000000001', 'has_address', 'Has Address', 'Custom', 'Boolean', true, NOW(), NOW()),
  ('a7b7c7d7-0002-4000-8000-000000000002', 'without_address', 'Without Address', 'Custom', 'Boolean', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Map newly created default filter types to all existing organizations
INSERT INTO crm_organizationsegmentfiltertypes (id, organization_id, filter_type_id, "default", createdat, modifiedat)
SELECT 
  gen_random_uuid(), 
  org.id, 
  ft.id, 
  true,
  NOW(),
  NOW()
FROM crm_organization org
CROSS JOIN crm_segmentfiltertypes ft
WHERE ft.default = true
ON CONFLICT DO NOTHING;
