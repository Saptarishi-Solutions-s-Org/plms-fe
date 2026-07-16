# CRM Segmentation Module - Implementation Plan

This document outlines the technical design, database schemas, role permissions, and frontend components for the new **Segmentation** module in the CRM.

---

## 1. Database Schema Design (Backend)

To ensure that segment filter types (Age, Gender, Status, City, etc.) are extensible and manageable per organization (like modules and roles), we will define metadata tables to store them.

### New CDS Schema Entities (to be added in `db/schema.cds`)

```cds
namespace crm;

// 1. Master metadata table for all supported filter types
entity SegmentFilterTypes : cuid, managed {
    name          : String(100) not null; // e.g., 'age', 'gender', 'city'
    label         : String(200) not null; // e.g., 'Age', 'Gender', 'City'
    category      : String(100) not null; // e.g., 'Demographic', 'Lead Information', 'Contact'
    operator_type : String(50) not null;  // e.g., 'Text', 'Number', 'Date', 'Boolean'
    default       : Boolean not null;     // True if enabled for all orgs by default
}

// 2. Organization mapping table to manage filter type availability per org
entity OrganizationSegmentFilterTypes : cuid, managed {
    organization : Association to Organization not null;
    filter_type  : Association to SegmentFilterTypes not null;
    default      : Boolean default true not null;
}

// 3. Segment main details table
entity Segment : cuid, managed {
    organization : Association to Organization not null;
    name         : String(255) not null;
    code         : String(100) not null;   // Unique segment code used in frontend URLs (e.g., 'seg-xxxxxx')
    description  : String(1000);
    type         : String(50) not null;    // 'Static' or 'Dynamic'
    is_active    : Boolean default true not null;
    color        : String(50);             // Hex or CSS color name
    notes        : String(2000);
    
    // Associations
    filters      : Composition of many SegmentFilters on filters.segment = $self;
    staticLeads  : Composition of many SegmentLeads on staticLeads.segment = $self;
    offers       : Composition of many SegmentOffers on offers.segment = $self;
}

// 4. Dynamic filter conditions table
entity SegmentFilters : cuid, managed {
    segment      : Association to Segment not null;
    filter_type  : Association to SegmentFilterTypes not null;
    operator     : String(50) not null;    // e.g., 'Equals', 'Contains', 'GreaterThan'
    value        : String(1000);           // Value or stringified array of values
    group_id     : String(36);             // Used for grouping nested conditions (parent/child)
    logical_op   : String(10);             // 'AND' or 'OR' operator linking to next filter
}

// 5. Static leads mapping table (for Static segments)
entity SegmentLeads : cuid, managed {
    segment      : Association to Segment not null;
    lead         : Association to Leads not null;
}

// 6. Offer assignments table
entity SegmentOffers : cuid, managed {
    segment      : Association to Segment not null;
    offer        : Association to Offer not null;
    assigned_by  : Association to User not null;
    assigned_at  : Timestamp not null;
}

// 7. Audit log table
entity SegmentAuditHistory : cuid, managed {
    organization : Association to Organization not null;
    segment      : Association to Segment;
    action_type  : String(100) not null;   // 'Create', 'Update', 'Delete', 'Assign Offer', 'Remove Offer', 'Refresh'
    user         : Association to User not null;
    timestamp    : Timestamp not null;
    details      : String(4000);           // JSON detail of the event change
}
```

### 1.1 Database Seeding & Migration Script

A SQL migration script has been created under [insert_segment_filter_types.sql](file:///D:/plms-fe/scripts/be/insert_segment_filter_types.sql) to initialize default filter types and auto-wire existing organizations.

This script:
1. Seeds master records in `crm_segmentfiltertypes` (Age, Gender, Status, State, etc.) with unique static UUIDs.
2. Performs a `CROSS JOIN` query to dynamically link these default filter types to all existing organizations in `crm_organizationsegmentfiltertypes`, setting `"default"` to true.

### 1.2 Segment Code Generation

To align with the existing `generateLeadCode` and `generateOfferCode` architecture:
- We will implement a utility helper `d:\plms-be\srv\lib\segmentcode.ts` to generate alphanumeric codes:
  ```typescript
  const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  export const generateSegmentCode = (): string => {
    let code = "SEG";
    for (let i = 0; i < 12; i++) {
      code += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
    }
    return code;
  };
  ```

---

## 2. Role Permissions & UI Matrix Rules

Based on the role matrix clean-up patterns and your updated requirements, we define the following rules for each role under the `segmentation` module:

| Role | `view` | `create` | `update` | `delete` | `export` | `import` |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **System Admin** | 🚫 *Blocked* | 🚫 *Blocked* | 🚫 *Blocked* | 🚫 *Blocked* | 🚫 *Blocked* | 🚫 *Blocked* |
| **Admin** | Active | Active | Active | Active | Active | 🚫 *Blocked* |
| **Manager** | Active | Active | Active | Active | Active | 🚫 *Blocked* |
| **Executive** | Active | Active | Active | 🚫 *Blocked* | 🚫 *Blocked* | 🚫 *Blocked* |

### Functional Constraints & Data Ownership Per Role:

1. **System Admin**:
   - **Reasoning**: System Admins manage global configurations and organizations; they have no access to lead operations.
   - **Action**: All segmentation actions are blocked with the `🚫` ban symbol.

2. **Admin**:
   - **Data Scope**: **Organization-Wide Leads**. Can build segments using any lead belonging to their organization (`leads.organization_ID = <admin_org_id>`).
   - **Filter Configuration**: Admin is the only role allowed to enable/disable specific segment filter types for the organization (managing rows in `OrganizationSegmentFilterTypes`).
   - **Blocked**: `import` is blocked.

3. **Manager**:
   - **Data Scope**: **Team Leads**. Can build segments using leads assigned directly to themselves, or leads assigned to any executive who reports to them:
     ```sql
     leads.assigned_to_ID = <manager_user_id> 
     OR leads.assigned_to_ID IN (
         SELECT id FROM crm_user WHERE reporting_manager_ID = <manager_user_id>
     )
     ```
   - **Constraints**: Uses the filter types configured by the Admin, but cannot enable/disable filter types.
   - **Blocked**: `import` is blocked.

4. **Executive**:
   - **Data Scope**: **Individual Leads**. Can create, view, and update segments strictly restricted to leads assigned directly to them:
     ```sql
     leads.assigned_to_ID = <executive_user_id>
     ```
     This isolation condition is automatically appended to the segment's preview, count, and offer-assignment query generator on the backend.
   - **Blocked**: `delete` (cannot delete global segments, can only delete own segments), `export` (🚫 blocked to prevent lead database leakage), and `import` (🚫 blocked).

---

## 3. Backend Service Endpoints (OData v4)

We will define a new service `SegmentationService` in `srv/organization-service.cds` to handle all query actions.

```cds
service SegmentationService {
    // 1. Get all segments configuration with current lead count
    function getSegments() returns array of {
        id           : UUID;
        code         : String; // Unique segment code
        name         : String;
        type         : String;
        is_active    : Boolean;
        color        : String;
        lead_count   : Integer;
        offer_titles : String;
        modifiedAt   : Timestamp;
    };

    // 2. Fetch leads matches for a set of draft filter expressions (live preview)
    action previewSegment(
        type    : String, // 'Static' or 'Dynamic'
        filters : array of {
            filter_type_id : UUID;
            operator       : String;
            value          : String;
            group_id       : String;
            logical_op     : String;
        },
        static_lead_ids : array of UUID
    ) returns {
        total_count : Integer;
        male_count  : Integer;
        female_count: Integer;
        avg_age     : Decimal(5, 2);
        leads       : array of {
            id      : UUID;
            name    : String;
            gender  : String;
            dob     : Date;
            status  : String;
            city    : String;
        };
    };

    // 3. Save a segment (creates/updates metadata and configuration)
    action saveSegment(
        id          : UUID,
        name        : String,
        description : String,
        type        : String,
        color       : String,
        notes       : String,
        is_active   : Boolean,
        filters     : array of {
            filter_type_id : UUID;
            operator       : String;
            value          : String;
            group_id       : String;
            logical_op     : String;
        },
        static_lead_ids : array of UUID
    ) returns {
        segmentId : UUID;
        message   : String;
    };

    // 4. Assign Offers to a Segment
    action assignOffersToSegment(
        segmentId : UUID,
        offerIds  : array of UUID
    ) returns {
        message          : String;
        assignedCount    : Integer;
    };
    
    // 5. Get Audit Log history for a segment
    function getSegmentAuditHistory(segmentId: UUID) returns array of {
        action_type : String;
        username    : String;
        timestamp   : Timestamp;
        details     : String;
    };
}
```

---

## 4. Frontend UI/UX Structure

### New Routing Path
- `/dashboard/segments` -> Main Segments list & overview dashboard.
- `/dashboard/segments/new` -> Segment creation builder screen.
- `/dashboard/segments/[code]` -> Segment detail dashboard, preview list, offer settings, and logs (identified by the unique `code` in the URL).

### UI Components (Vanilla CSS + Tailwind)

1. **Dashboard Summary Cards (Top Section)**:
   - 4 Card layout: Total Leads, Active Leads, Avg Age, Offers Assigned.
   - Uses HSL tailored color schemes consistent with the purple theme.

2. **Segments List View**:
   - Branded grids representing each Segment.
   - Displays Name, Description, color badge, active status, leads count, and list of assigned offers.
   - Dropdown menu actions: View, Edit, Duplicate, Deactivate, Delete, Export.

3. **Condition Builder Component (For Dynamic Segments)**:
   - Interactive list where users select:
     1. Category -> Filter Type (e.g. Demographic -> Gender)
     2. Operator (e.g. Equals)
     3. Value input (Select dropdown, input field, or date picker depending on metadata type)
   - Supports nesting (Add Group) and conditional connectors (AND / OR).

4. **Live Preview Panel (Sticky Right Sidebar in Builder)**:
   - Displays real-time matching metrics using `previewSegment` action:
     - Matching lead count gauge.
     - Demographic indicators (Male/Female counts, Average Age).
     - Table listing the first 20 matching lead names.

---

## 5. Architectural Alignment & Implementation Guidelines

> [!IMPORTANT]
> During implementation, developers must actively study and duplicate existing repository patterns:
> - **Routing & Structure**: Mirror dynamic layouts and route handlers matching the patterns under `app/[orgCode]/leads/` and `app/[orgCode]/offers/`.
> - **Code Helper Utilities**: Replicate character dictionary code generators as done in `d:\plms-be\srv\lib\leadcode.ts` and `d:\plms-be\srv\lib\orgcode.ts`.
> - **UI/UX Aesthetics**: Inherit standard HSL color palettes, table borders, dialog transitions, loading loaders, and dropdown actions currently implemented.
> - **Service Calls**: Standardize OData bindings, authentication contexts, and request payloads conforming to active modules.
