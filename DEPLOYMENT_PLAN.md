# Deployment Plan — gatsby-site-1772785016

**Last Updated:** 2025-03-06
**Deployment ID:** gatsby-site-1772785016
**Git Branch:** `deploy-to-aws-gatsby-site-1772785016`

---

## Detected Configuration

| Property         | Value                  |
|------------------|------------------------|
| **Project Name** | MarcySutton_com-gatsby-site |
| **Framework**    | Gatsby v4.25.0         |
| **React**        | v17.0.2                |
| **Package Mgr**  | npm 10.9.2             |
| **Build Command**| `npm run build`        |
| **Prebuild**     | `rm -rf public/ .cache/` (auto-runs via `prebuild` script) |
| **Output Dir**   | `public/`              |
| **Base Path**    | `/`                    |
| **Node.js**      | v22.17.1               |

---

## Prerequisites

| Tool                | Status     | Version / Details                                      |
|---------------------|------------|--------------------------------------------------------|
| Node.js             | ✅ Verified | v22.17.1                                               |
| npm                 | ✅ Verified | 10.9.2                                                 |
| AWS CLI             | ✅ Verified | aws-cli/2.32.33                                        |
| AWS CDK             | ✅ Verified | 2.1101.0 (build 92af268)                               |
| AWS Credentials     | ✅ Verified | Account 002255676568, Role: Admin/jairosp-Isengard     |

---

## Progress Tracker

| Step | Phase                          | Status         | Notes |
|------|--------------------------------|----------------|-------|
| 1    | Detect build configuration     | ✅ Done        | Gatsby, `npm run build`, output: `public/` |
| 2    | Check prerequisites            | ✅ Done        | All 5 checks passed |
| 3    | Create deployment plan         | ✅ Done        | DEPLOYMENT_PLAN.md initialized |
| 4    | Create git branch              | ✅ Done        | `deploy-to-aws-gatsby-site-1772785016` |
| 5    | Commit deployment plan         | ✅ Done        | Commit 2470471 |
| 6    | Revisit / update deployment plan | ✅ Done      | Updated with confirmed config (this update) |
| 7    | Install dependencies           | ⏳ Pending     | `npm install` |
| 8    | Build application              | ⏳ Pending     | `npm run build` → `public/` |
| 9    | Provision AWS infrastructure   | ⏳ Pending     | CDK deploy (S3 + CloudFront OAC) |
| 10   | Deploy assets to S3            | ⏳ Pending     | `aws s3 sync public/ s3://gatsby-site-1772785016` |
| 11   | Verify deployment              | ⏳ Pending     | Smoke-test CloudFront URL (HTTP 200) |

---

## AWS Resources

| Resource              | Name / ID                    | Status     |
|-----------------------|------------------------------|------------|
| S3 Bucket             | `gatsby-site-1772785016`     | ⏳ Pending  |
| CloudFront OAC        | Auto-assigned by AWS         | ⏳ Pending  |
| CloudFront Distribution | Auto-assigned by AWS       | ⏳ Pending  |
| CloudFront URL        | TBD                          | ⏳ Pending  |
| AWS Region            | us-east-1 (default)          | ⏳ Pending  |
| AWS Account           | 002255676568                 | ✅ Confirmed |

---

## Security Model

- S3 bucket: **fully private** — no public access enabled
- CloudFront accesses S3 via **Origin Access Control (OAC)**
- All end-user traffic served over **HTTPS** via CloudFront
- Bucket policy restricts access to **CloudFront service principal only**

---

## Phase Details

### Phase 7 — Install Dependencies
- **Command:** `npm install`
- **Goal:** Install all Node.js packages from `package.json` (including Gatsby v4, React v17, and all plugins)
- **Status:** ⏳ Pending

### Phase 8 — Build Application
- **Command:** `npm run build`
- **Prebuild:** `rm -rf public/ .cache/` (runs automatically)
- **Output:** `public/`
- **Goal:** Compile Gatsby site into optimized static assets
- **Status:** ⏳ Pending

### Phase 9 — Provision AWS Infrastructure (CDK)
- **Tool:** AWS CDK v2.1101.0
- **Resources to create:**
  - S3 Bucket (private, versioned): `gatsby-site-1772785016`
  - CloudFront Origin Access Control (OAC)
  - CloudFront Distribution (HTTPS, global CDN, default root: `index.html`)
  - S3 Bucket Policy (CloudFront-only access)
- **Status:** ⏳ Pending

### Phase 10 — Deploy Assets to S3
- **Command:** `aws s3 sync public/ s3://gatsby-site-1772785016 --delete`
- **Goal:** Upload all static build artifacts; remove stale files with `--delete`
- **Cache headers:**
  - HTML files: `no-cache` (always revalidate)
  - JS/CSS/images: long-lived cache (content-hashed filenames)
- **Status:** ⏳ Pending

### Phase 11 — Verify Deployment
- **Goal:** Confirm CloudFront distribution returns HTTP 200 on root URL
- **Method:** `curl -I https://<distribution>.cloudfront.net`
- **Status:** ⏳ Pending

---

## Outputs (populated after deployment)

| Key               | Value |
|-------------------|-------|
| CloudFront URL    | TBD   |
| S3 Bucket         | TBD   |
| Distribution ID   | TBD   |
| CDK Stack Name    | TBD   |

---

*This file is updated automatically at each deployment step.*
