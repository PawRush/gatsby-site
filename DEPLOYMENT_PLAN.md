---
sop_name: deploy-frontend-app
repo_name: gatsby-site
app_name: MarcySutton
app_type: Frontend Application (Gatsby)
branch: deploy-to-aws-20260128_131744-sergeyka
created: 2026-01-28T13:22:00Z
last_updated: 2026-01-28T13:25:00Z
---

# Deployment Plan: MarcySutton.com

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

- Framework: Gatsby v4
- Package Manager: npm
- Build Command: npm run build
- Output Directory: public/
- Deployment URL: https://d2xdyoerq6gogv.cloudfront.net
- Stack name: MarcySuttonFrontend-preview-sergeyka
- Distribution ID: E21YYKH3MHQUVB
- S3 Bucket: marcysuttonfrontend-preview-cftos3s3bucketcae9f2be-2zxrly4lavwi
- CloudFront Log Bucket: marcysuttonfrontend-previ-cftos3cloudfrontloggingb-2emm05fzpxzh
- S3 Log Bucket: marcysuttonfrontend-previ-cftos3s3loggingbucket64b-zcrmrczvn0xg
- Deployment Timestamp: 2026-01-28T13:35:37Z

## Recovery Guide

```bash
# Rollback
cd infra && cdk destroy "MarcySuttonFrontend-<environment>"

# Redeploy
./scripts/deploy.sh

# Manual invalidation
aws cloudfront create-invalidation --distribution-id "<ID>" --paths "/*"
```

## Issues Encountered

None.

## Session Log

### Session 1 - 2026-01-28T13:22:00Z
Agent: Claude Sonnet 4.5
Progress: Created deployment plan
Next: Create deploy branch
