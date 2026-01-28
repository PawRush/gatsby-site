---
sop_name: deploy-frontend-app
repo_name: gatsby-site
app_name: MarcySutton
app_type: Frontend Application (Gatsby)
branch: deploy-to-aws-20260128_131744-sergeyka
created: 2026-01-28T13:22:00Z
last_updated: 2026-01-28T13:22:00Z
---

# Deployment Plan: MarcySutton.com

Coding Agents should follow this Deployment Plan, and validate previous progress if picking up the Deployment in a new coding session.

**IMPORTANT**: Update this plan after EACH step completes. Mark the step `[x]` and update `last_updated` timestamp.

## Phase 1: Gather Context and Configure
- [...] Step 0: Inform User of Execution Flow
- [ ] Step 1: Create Deployment Plan
- [ ] Step 2: Create Deploy Branch
- [ ] Step 3: Detect Build Configuration
- [ ] Step 4: Validate Prerequisites
- [ ] Step 5: Revisit Deployment Plan

## Phase 2: Build CDK Infrastructure
- [ ] Step 6: Initialize CDK Foundation
- [ ] Step 7: Generate CDK Stack
- [ ] Step 8: Create Deployment Script
- [ ] Step 9: Validate CDK Synth

## Phase 3: Deploy and Validate
- [ ] Step 10: Execute CDK Deployment
- [ ] Step 11: Validate CloudFormation Stack

## Phase 4: Update Documentation
- [ ] Step 12: Finalize Deployment Plan
- [ ] Step 13: Update README.md

## Deployment Info

- Framework: Gatsby v4
- Package Manager: npm
- Build Command: npm run build
- Output Directory: public/
- Deployment URL: [after completion]
- Stack name: [after creation]
- Distribution ID: [after creation]
- S3 Bucket: [after creation]

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
