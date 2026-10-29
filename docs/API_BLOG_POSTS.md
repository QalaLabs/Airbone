# Airborne OS — Blog Posts Programmatic API

The Airborne OS Blog API provides programmatic endpoints to create, update, publish, retrieve, and delete blog articles and guides directly from external tools, CMS pipelines, scrapers, or automation scripts.

---

## 1. Authentication

All requests to `/api/v1/posts` must include an authorized API key or bearer token. Airborne OS supports three authentication methods:

1. **HTTP Bearer Token Header**:
   ```http
   Authorization: Bearer <BLOG_API_KEY>
   ```
2. **Custom API Key Header**:
   ```http
   x-api-key: <BLOG_API_KEY>
   ```
3. **Admin User Session**:
   Browser requests containing a valid NextAuth session cookie for an Airborne OS administrator or editor.

Unauthenticated or unauthorized requests return `401 Unauthorized`.

---

## 2. Endpoints Summary

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/posts` | Create a new blog post (draft or published), or update if `updateIfExists: true` |
| `GET` | `/api/v1/posts` | List blog posts with pagination, status, tag, and category filters |
| `GET` | `/api/v1/posts/:id` | Retrieve an individual blog post by ID or slug |
| `PUT` | `/api/v1/posts/:id` | Update an existing blog post by ID or slug |
| `DELETE` | `/api/v1/posts/:id` | Delete an article and purge public website cache |

---

## 3. Request Schema (`POST /api/v1/posts`)

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `title` | `string` | **Yes** | — | Article headline (3 to 255 characters). |
| `slug` | `string` | No | Auto from title | URL slug (lowercase alphanumeric and hyphens). Unique within org. |
| `body` / `bodyHtml` | `string` | No | `""` | Article HTML body. Automatically sanitized on ingestion to strip scripts/handlers while preserving headings, lists, tables, and images. |
| `excerpt` / `description` | `string` | No | `""` | Short article excerpt or lead paragraph (max 1000 characters). |
| `category` | `string` | No | `"blog"` | Category taxonomy (e.g. `Pilot Training`, `DGCA Exams`, `Cabin Crew`). |
| `tags` | `string[]` | No | `[]` | Array of topic tags (e.g. `["DGCA", "Ground School", "CPL"]`). |
| `author` | `string \| object` | No | `null` | Author name (`"Capt. Navrang Singh"`) or object `{ name, role, avatar }`. |
| `featuredImageUrl` | `string` | No | `null` | Public HTTPS or site-relative URL for hero image. |
| `featuredImageAlt` | `string` | No | `null` | SEO alt text describing the featured image. |
| `seoTitle` | `string` | No | `null` | Meta title tag (recommended 50–60 characters). |
| `seoDesc` | `string` | No | `null` | Meta description tag (recommended 140–160 characters). |
| `status` | `"DRAFT" \| "PUBLISHED"` | No | `"DRAFT"` | Publication state. `PUBLISHED` sets `publishedAt` and immediately purges website cache. |
| `updateIfExists` | `boolean` | No | `false` | If `true` and the slug already exists, updates the existing article instead of returning 409 Conflict. |

---

## 4. Response Schema

### Success Response (`201 Created` or `200 OK`)

```json
{
  "success": true,
  "data": {
    "id": "e4587db2-6a98-466d-a602-0e54a01c8012",
    "slug": "dgca-ground-school-exam-prep",
    "title": "Complete Guide to DGCA Ground School Exam Preparation",
    "excerpt": "Everything aspiring commercial pilots need to know about preparing for DGCA examinations.",
    "status": "PUBLISHED",
    "category": "DGCA Exams",
    "tags": ["DGCA", "Ground School", "CPL"],
    "seoTitle": "Complete Guide to DGCA Ground School Exams | Airborne Aviation",
    "seoDesc": "Master Air Navigation, Meteorology, and Air Regulations with expert guidance from airline captains at Airborne Aviation ground school in Delhi.",
    "publishedAt": "2026-10-30T03:40:00.000Z",
    "author": "Capt. Navrang Singh",
    "featuredImageUrl": "https://storage.googleapis.com/airborne-aviation-media-prod/blog/dgca-ground-school.webp",
    "featuredImageAlt": "Cockpit instruments and aviation navigation charts",
    "url": "/blog/dgca-ground-school-exam-prep",
    "revalidated": true
  }
}
```

---

## 5. Machine-Readable Error Codes

All errors conform to the standard Airborne API error envelope:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": []
  }
}
```

| HTTP Status | Error Code | Meaning |
|---|---|---|
| `400` | `VALIDATION_ERROR` | Request payload failed schema checks (e.g. title too short, malformed slug). `details` contains field-specific issues. |
| `401` | `UNAUTHORIZED` | Missing or invalid API key / bearer token. |
| `403` | `FORBIDDEN` | Caller does not have permissions to manage posts. |
| `404` | `NOT_FOUND` | Post with the specified ID or slug was not found. |
| `409` | `CONFLICT` | A post with the specified slug already exists, and `updateIfExists` was not set to `true`. |
| `500` | `INTERNAL_SERVER_ERROR` | An unexpected server or database error occurred. |

---

## 6. Real-Time Website On-Demand Revalidation

When an article is published or updated with status `PUBLISHED`:
1. The database record is committed first.
2. An on-demand revalidation request is immediately sent to the public website (`/api/revalidate`):
   - Cache tags: `resources`, `blogs`
   - Explicit URL paths: `/blog`, `/blog/:slug`, `/sitemap.xml`
3. The new or updated post resolves instantly on the public website with zero transient 404s.

---

## 7. Example cURL Requests

### 1. Create a Draft Article

```bash
curl -X POST https://airborne-admin-368523757732.asia-south1.run.app/api/v1/posts \
  -H "Authorization: Bearer YOUR_BLOG_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Aviation Weather and Meteorology Basics",
    "slug": "aviation-meteorology-basics",
    "excerpt": "Understanding cloud formations, METARs, and weather radar for cadet pilots.",
    "status": "DRAFT",
    "category": "Ground School",
    "tags": ["Meteorology", "DGCA Exams"],
    "author": "Capt. Navrang Singh",
    "bodyHtml": "<h2>Introduction to METARs</h2><p>Accurate weather interpretation is essential for flight safety.</p>"
  }'
```

### 2. Publish an Article Directly (with HTML Table & Revalidation)

```bash
curl -X POST https://airborne-admin-368523757732.asia-south1.run.app/api/v1/posts \
  -H "Authorization: Bearer YOUR_BLOG_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "CPL Flight Training Flying Hours Breakdown",
    "slug": "cpl-flight-training-flying-hours-breakdown",
    "excerpt": "A complete breakdown of the 200 flying hours required for DGCA Commercial Pilot License.",
    "status": "PUBLISHED",
    "category": "Pilot Training",
    "tags": ["CPL", "Flying Hours", "DGCA"],
    "author": "Capt. Navrang Singh",
    "featuredImageUrl": "https://storage.googleapis.com/airborne-aviation-media-prod/blog/cpl-hours.webp",
    "featuredImageAlt": "Cadet pilot flying Cessna 172 at sunrise",
    "seoTitle": "CPL Flight Training Flying Hours Breakdown | Airborne Aviation",
    "seoDesc": "Learn the exact DGCA requirements for 200 flying hours: solo, dual, cross-country, and night flying hours explained.",
    "bodyHtml": "<h2>DGCA 200 Hours Flying Breakdown</h2><p>Here is the required flight time distribution:</p><table class=\"table\"><thead><tr><th>Requirement</th><th>Minimum Hours</th></tr></thead><tbody><tr><td>Solo Flying</td><td>100 hrs</td></tr><tr><td>Cross-Country Solo</td><td>50 hrs</td></tr><tr><td>Instrument Flying</td><td>20 hrs</td></tr><tr><td>Night Flying</td><td>5 hrs</td></tr></tbody></table>"
  }'
```

### 3. Update an Existing Article (Idempotent Update)

```bash
curl -X POST https://airborne-admin-368523757732.asia-south1.run.app/api/v1/posts \
  -H "Authorization: Bearer YOUR_BLOG_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "CPL Flight Training Flying Hours Breakdown (Updated 2026)",
    "slug": "cpl-flight-training-flying-hours-breakdown",
    "updateIfExists": true,
    "status": "PUBLISHED",
    "bodyHtml": "<h2>DGCA 200 Hours Flying Breakdown</h2><p>Updated guidelines for simulator credit and glass-cockpit flying hours.</p>"
  }'
```

### 4. Fetch an Individual Article

```bash
curl -X GET https://airborne-admin-368523757732.asia-south1.run.app/api/v1/posts/cpl-flight-training-flying-hours-breakdown \
  -H "Authorization: Bearer YOUR_BLOG_API_KEY"
```
