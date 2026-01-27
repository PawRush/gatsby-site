---
sop_name: deploy-frontend-app
repo_name: gatsby-site
app_name: MarcySite
app_type: Frontend Application (Gatsby)
branch: deploy-to-aws-20260127_182622-sergeyka
created: 2026-01-27T17:30:00Z
last_updated: 2026-01-27T17:30:00Z
---

# Deployment Plan: MarcySite

Coding Agents should follow this Deployment Plan, and validate previous progress if picking up the Deployment in a new coding session.

**IMPORTANT**: Update this plan after EACH step completes. Mark the step `[x]` and update `last_updated` timestamp.

## Phase 1: Gather Context and Configure
- [x] Step 0: Inform User of Execution Flow
- [x] Step 1: Create Deployment Plan
- [x] Step 2: Create Deploy Branch
- [x] Step 3: Detect Build Configuration
- [x] Step 4: Validate Prerequisites
- [x] Step 5: Revisit Deployment Plan

## Phase 2: Build CDK Infrastructure
- [x] Step 6: Initialize CDK Foundation
- [x] Step 7: Generate CDK Stack
- [x] Step 8: Create Deployment Script
- [x] Step 9: Validate CDK Synth

## Phase 3: Deploy and Validate
- [x] Step 10: Execute CDK Deployment
- [x] Step 11: Validate CloudFormation Stack

## Phase 4: Update Documentation
- [ ] Step 12: Finalize Deployment Plan
- [ ] Step 13: Update README.md

## Deployment Info

- Framework: Gatsby v4.25.0
- Package Manager: npm
- Build Command: npm run build
- Output Directory: public/
- Deployment URL: https://dg2p7mr8jna6f.cloudfront.net
- Stack Name: MarcySiteFrontend-preview-sergeyka
- CloudFront Distribution ID: E27X67PVE5JQXP
- CloudFront Distribution Domain: dg2p7mr8jna6f.cloudfront.net
- S3 Bucket Name: marcysitefrontend-preview-s-cftos3s3bucketcae9f2be-atwbodfw5adz
- CloudFront Log Bucket: marcysitefrontend-preview-cftos3cloudfrontloggingb-nbgvp9slb3ff
- S3 Log Bucket: marcysitefrontend-preview-cftos3s3loggingbucket64b-dxik3i2dorjg
- Deployment Timestamp: 2026-01-27T18:46:34Z

## Recovery Guide

```bash
# Rollback
cd infra
cdk destroy "MarcySiteFrontend-<environment>"

# Redeploy
./scripts/deploy.sh
```

## Issues Encountered

None.

## Session Log

### Session 1 - 2026-01-27T17:30:00Z
Agent: Claude Sonnet 4.5
Progress: Created deployment plan
Next: Create deploy branch
