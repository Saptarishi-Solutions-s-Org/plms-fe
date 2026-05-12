# PLMS Realtime Guide

Realtime in PLMS uses Socket.IO as an invalidation system.

Do not send full business data through sockets. Send a small event that says
"something changed", then let the page refetch through its normal API.

## Core Idea

- `GET` APIs do not emit realtime events.
- Mutation APIs such as create, update, delete, import, approve, assign, etc. emit events after the DB transaction succeeds.
- Pages that display data subscribe to those events and call their existing GET API again.
- The database/API remains the source of truth.

Example flow:

1. User creates an organization.
2. Backend commits the DB transaction.
3. Backend emits `system-admin:dashboard:changed`.
4. System Admin dashboard receives the event.
5. Dashboard calls `getSystemAdminDashboard()` again.
6. UI updates without page reload.

## Backend Pattern

Use helpers from:

```ts
srv/realtime/socket.ts
```

Available helpers:

```ts
emitGlobal(type, data)
emitToUser(userId, type, data)
emitToOrg(orgId, type, data)
emitToRole(role, type, data)
emitToSystemAdmins(type, data)
```

Emit only after the DB change is successful.

```ts
await client.query("COMMIT");

emitToOrg(orgId, "lead:changed", {
  reason: "lead-created",
  leadId,
});
```

For System Admin dashboard:

```ts
emitToSystemAdmins("system-admin:dashboard:changed", {
  reason: "organization-created",
  orgId,
});
```

## Event Naming

Use this format:

```txt
module:resource:changed
```

Examples:

```txt
system-admin:dashboard:changed
organization:list:changed
organization:detail:changed
lead:list:changed
lead:detail:changed
manager:dashboard:changed
executive:dashboard:changed
```

Keep event names specific enough that pages only refetch when needed.

In the frontend, put shared PLMS event names in:

```ts
types/realtime.ts
```

Use those constants instead of repeating strings in every page.

## Frontend Pattern

Use helpers from:

```ts
lib/socket.ts
```

Subscribe inside the page/component that owns the data.

```tsx
useEffect(() => {
  return subscribeRealtime("lead:list:changed", () => {
    loadLeads("realtime");
  });
}, [loadLeads]);
```

The page should already have an API loader:

```tsx
const loadLeads = useCallback(async (mode: "initial" | "realtime") => {
  if (mode === "realtime") setIsRefreshing(true);

  try {
    const data = await getLeadsWithStats();
    setLeads(data.leads);
    setStats(data.stats);
  } finally {
    if (mode === "realtime") setIsRefreshing(false);
    else setIsInitialLoading(false);
  }
}, []);
```

## Loading Rules

Use the global loader only for the first page load:

```tsx
if (isInitialLoading) return <GlobalLoader />;
```

For realtime updates, use local state only:

```tsx
{isRefreshing && <span>Refreshing...</span>}
```

Do not block the whole app during realtime refresh.

## Room Selection

Choose the smallest correct audience:

| Use case | Backend helper |
| --- | --- |
| All connected users | `emitGlobal` |
| One user only | `emitToUser` |
| Everyone in an organization | `emitToOrg` |
| Users with a role | `emitToRole` |
| System admins only | `emitToSystemAdmins` |

## Reference Implementation

Use the System Admin dashboard and organization pages as references:

- Backend emits `system-admin:dashboard:changed` after organization/admin-user mutations.
- Backend emits `organization:list:changed` after organization create/update mutations.
- Backend emits `organization:detail:changed` after organization/admin-user mutations.
- Frontend subscribes in:

```txt
app/[orgCode]/dashboard/roledashboards/system-admin-dashboard.tsx
app/[orgCode]/dashboard/organization/page.tsx
app/[orgCode]/dashboard/organization/[code]/page.tsx
```

They refetch via:

```ts
getSystemAdminDashboard()
getOrganizations()
getOrganizationByCode(code)
getAdminUsers(organization.id)
```

## Important Notes

- GET handlers should not emit realtime events.
- Direct DB changes outside the backend will not automatically emit events.
- If direct DB changes must trigger realtime, add a backend job, DB trigger listener, or admin API that emits after the DB update.
- Always unsubscribe by returning the function from `subscribeRealtime`.
- Never send secrets, tokens, or full records through realtime events.
