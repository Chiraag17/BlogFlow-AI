# Comprehensive Site-Wide Technical SEO & In-App Blog SEO Engine Plan

## 1. Architectural Overview
We will upgrade SEO across both layers of **BlogFlow AI**:
1. **Site-Wide Technical SEO, Social Sharing Cards & Structured Data (`applet-seo` Compliance)**:
   - Full OpenGraph + Twitter `summary_large_image` metadata, canonical URLs, robot directives, and title templates in `/app/layout.tsx` (synced with `/metadata.json`).
   - Dynamic 1200×630 OpenGraph social card image generator at `/app/opengraph-image.tsx` styled in BlogFlow AI's Midnight Forest & 24K Brushed Brass editorial palette.
   - Rich Schema.org JSON-LD structured data (`WebApplication` / `SoftwareApplication`, `Organization`, and `WebSite` in `/app/layout.tsx`, plus `FAQPage` structured data in `/app/landing/page.tsx`).
   - Dynamic `/app/sitemap.ts` (`sitemap.xml`) and `/app/robots.ts` (`robots.txt`) routes.
2. **In-App Blog SEO Analyzer, Live SERP Preview & JSON-LD Schema Generator**:
   - Enhance `/services/content/seo-analysis.service.ts` to compute keyword density, H1/H2/H3 hierarchy diagnostics, internal linking recommendations, and auto-generated `BlogPosting` + `FAQPage` JSON-LD structured data for any generated blog post.
   - Upgrade the **SEO & Metadata Tab** in `/app/(dashboard)/content/[id]/page.tsx` with a **Live Google SERP & Social Card Preview**, an interactive **Run Deep SEO Audit** panel wired to `/api/ai/analyze-seo`, and a **Copy Article JSON-LD Schema** block.

---

## 2. File-by-File Implementation Plan

### A. `/app/layout.tsx` & `/metadata.json`
1. **Metadata & Social Cards**:
   - Configure `metadataBase` resolving from `process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://blogflow.ai'`.
   - Set specific branded `<title>` (`BlogFlow AI — AI Content Research, Drafting & CMS Studio`, 56 chars) and `<meta name="description">` (`Transform any topic or website into citation-grounded, SEO-optimized articles with live web research, editorial review, and WordPress publishing.`, 146 chars) in both `/app/layout.tsx` and `/metadata.json`.
   - Configure `openGraph` (`type: 'website'`, `siteName: 'BlogFlow AI'`, `title`, `description`, `locale: 'en_US'`) and `twitter` (`card: 'summary_large_image'`, `title`, `description`).
   - Configure `alternates: { canonical: '/' }` and `robots` directives (`index: true`, `follow: true`, `googleBot` max-snippet and max-image-preview).
2. **Root Schema.org JSON-LD (`@graph`)**:
   - Inject a `<script type="application/ld+json">` tag inside `<head>` containing `WebApplication` (`applicationCategory: "BusinessApplication"`, `operatingSystem: "All"`, `offers`, `aggregateRating`), `Organization`, and `WebSite` schemas.

### B. `/app/opengraph-image.tsx` (New File)
- Implement a Next.js App Router `ImageResponse` (`next/og`) generating a crisp 1200×630 PNG social card featuring:
  - Deep Forest & Brushed 24K Gold editorial branding (`#101714` & `#C8A15A`).
  - *"Research. Think. Publish."* headline and core capability badges (`Live Web Citations`, `94+ SEO Score`, `1-Click WordPress Sync`).

### C. `/app/sitemap.ts` & `/app/robots.ts` (New Files)
- **`/app/sitemap.ts`**: Dynamically generate `MetadataRoute.Sitemap` entries using `process.env.APP_URL` for `/`, `/landing`, `/generator`, `/research`, `/studio`, `/dashboard`, `/analytics`, and `/integrations` with appropriate `priority` and `changeFrequency`.
- **`/app/robots.ts`**: Dynamically generate `MetadataRoute.Robots` allowing all crawlers on public pages, disallowing `/api/`, and referencing `${baseUrl}/sitemap.xml`.

### D. `/app/landing/page.tsx`
- **`FAQPage` & `HowTo` Schema.org JSON-LD**:
  - Inject a `<script type="application/ld+json">` in `LandingPage` mapping the `FAQS` array into a valid `https://schema.org/FAQPage` entity (`mainEntity` of `Question` / `acceptedAnswer` items) plus a 4-step `HowTo` schema for the *Research → Draft → Review → Publish* pipeline.

### E. `/services/content/seo-analysis.service.ts` & `/app/(dashboard)/content/[id]/page.tsx`
1. **Enhanced `SeoAnalysisService` (`/services/content/seo-analysis.service.ts`)**:
   - Extend `SeoAnalysisResult` with:
     - `readabilityMetrics`: average sentence length, word count, reading time, and status.
     - `schemaJsonLd`: auto-generated `BlogPosting` + optional `FAQPage` JSON-LD string for the article.
   - Escape regex special characters in `focusKeyword` when counting occurrences so multi-word or punctuated keywords never throw a regex error.
2. **Upgraded SEO & Metadata Tab (`/app/(dashboard)/content/[id]/page.tsx`)**:
   - Add a **Live Google SERP & Social Card Preview** (toggleable between Google Search Result snippet and X/LinkedIn OpenGraph card) that updates in real time as the editor modifies `metaTitle`, `metaDescription`, `focusKeyword`, and `slug`.
   - Wire a **"Run Deep SEO Diagnostics"** button to `POST /api/ai/analyze-seo`, rendering:
     - Character-length progress bars with optimal green/amber zones (`35–60 chars` for Title, `120–160 chars` for Meta Description).
     - Focus Keyword placement badges (*In Title*, *In First 100 Words*, *In H2 Subheadings*, *Keyword Density %*).
     - Heading Hierarchy breakdown (`H1`, `H2`, `H3` counts) and AI Internal Linking suggestions.
     - Copyable **Article + FAQ Schema.org JSON-LD** snippet for direct CMS embedding.

---

## 3. Verification & Quality Gates
- Run `compile_applet` and `lint_applet` together to verify all Next.js metadata routes (`opengraph-image.tsx`, `sitemap.ts`, `robots.ts`), JSON-LD scripts, and TypeScript types compile with 0 errors.
