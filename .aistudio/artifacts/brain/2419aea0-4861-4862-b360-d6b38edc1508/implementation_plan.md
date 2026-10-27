# Fix Vercel Build & Prisma TypeScript Errors

## Root Cause Analysis
During the `next build` TypeScript check on Vercel, three errors occurred:
1. **`app/api/websites/[id]/route.ts(33,13)` (`TS2353`)**: The Prisma `select` projection for `cmsIntegrations` included `lastSyncAt: true` and `lastErrorMessage: true`, which do not exist on the `CMSIntegration` model in `prisma/schema.prisma` (the schema uses `lastConnectedAt`, `connectionStatus`, `createdAt`, and `updatedAt`).
2. **`services/db/blog.service.ts(81,19)` (`TS2353`)**: `DbBlogService.getBlogById` also selected `lastSyncAt: true` and `lastErrorMessage: true` on `publishingRecords.include.integration`.
3. **`app/api/publish/route.ts(67,35)` (`TS2339: Property 'approvals' does not exist`)**: Because `DbBlogService.getBlogById` had an invalid nested `select` inside its `include` block, Prisma's generic type inference fell back to the base `Blog` scalar type (omitting the included `approvals`, `website`, and `publishingRecords` relations). Fixing the `integration` select in `DbBlogService.getBlogById` automatically restores the full relational return type including `dbBlog.approvals`.

Additionally, `SAFE_CMS_INTEGRATION_SELECT` in `services/db/website.service.ts` also contains `lastSyncAt` and `lastErrorMessage`, which would cause a Prisma runtime validation error when querying websites.

---

## Proposed Changes

### 1. Align `CMSIntegration` Safe Select Projections with `prisma/schema.prisma`
- **`services/db/website.service.ts`**:
  - Update `SAFE_CMS_INTEGRATION_SELECT` to remove `lastSyncAt` and `lastErrorMessage`, keeping only valid schema fields (`id`, `websiteId`, `provider`, `cmsUrl`, `username`, `connectionStatus`, `lastConnectedAt`, `createdAt`, `updatedAt`) while continuing to exclude `encryptedCredentials`.
- **`app/api/websites/[id]/route.ts`**:
  - Remove `lastSyncAt: true` and `lastErrorMessage: true` from `cmsIntegrations.select` (and include `createdAt: true`, `updatedAt: true` to match the schema).
- **`services/db/blog.service.ts`**:
  - Remove `lastSyncAt: true` and `lastErrorMessage: true` from `publishingRecords.include.integration.select` in `DbBlogService.getBlogById(id)` so Prisma accurately infers the `include` payload (`approvals`, `website`, `researchReport`, `qualityReports`, `publishingRecords`, `workflowExecutions`).

### 2. Verify TypeScript & Production Build
- Run `compile_applet` (`next build`) to confirm all TypeScript checks and route compilations pass with zero errors.
