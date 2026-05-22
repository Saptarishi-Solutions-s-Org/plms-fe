DO $$
DECLARE
    v_org_id UUID;
BEGIN
    SELECT id::uuid INTO v_org_id
    FROM crm_organization
    WHERE code = 'sapt4yhYsuyWD0ktw6';

    IF v_org_id IS NULL THEN
        RAISE NOTICE 'Organization not found';
        RETURN;
    END IF;

    DELETE FROM crm_organizationrolemodulepermissions
    WHERE organization_id::text = v_org_id::text;

    DELETE FROM crm_organizationroles
    WHERE organization_id::text = v_org_id::text;

    DELETE FROM crm_organizationmodules
    WHERE organization_id::text = v_org_id::text;

    DELETE FROM crm_user
    WHERE organization_id::text = v_org_id::text;

    DELETE FROM crm_leadactivity
    WHERE lead_id IN (
        SELECT id FROM crm_leads WHERE organization_id::text = v_org_id::text
    );

    DELETE FROM crm_leads
    WHERE organization_id::text = v_org_id::text;

    DELETE FROM crm_offerassignment
    WHERE offer_id IN (
        SELECT id FROM crm_offer WHERE organization_id::text = v_org_id::text
    );

    DELETE FROM crm_offer
    WHERE organization_id::text = v_org_id::text;

    DELETE FROM crm_organization
    WHERE id::text = v_org_id::text;

    RAISE NOTICE 'Organization deleted successfully: %', v_org_id;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error: %', SQLERRM;
END $$;