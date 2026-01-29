---
sop_name: setup-pipeline
repo_name: gatsby-site
app_name: Marcy
app_type: CI/CD Pipeline for Frontend Application
branch: deploy-to-aws-20260129_231512-sergeyka
created: 2026-01-29T23:18:00Z
last_updated: 2026-01-29T23:37:00Z
code_connection_arn: arn:aws:codeconnections:us-east-1:126593893432:connection/c140aa0c-7407-42c9-aa4b-7c81f5faf40b
---

# Deployment Plan: MarcySutton.com

Coding Agents should follow this Deployment Plan, and validate previous progress if picking up the Deployment in a new coding session.

**IMPORTANT**: Update this plan after EACH step completes. Mark the step `[x]` and update `last_updated` timestamp.

## Phase 1: Gather Context and Configure
- [x] Step 0: Inform User of Execution Flow
- [x] Step 1: Create Deployment Plan
- [x] Step 2: Create Deploy Branch
- [x] Step 3: Detect Build Configuration (npm, gatsby build, public/, root path, URL rewrite function needed)
- [x] Step 4: Validate Prerequisites (AWS credentials, npm, CDK CLI, build successful)
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
- [x] Step 12: Finalize Deployment Plan
- [x] Step 13: Update README.md

## Pipeline Setup (setup-pipeline SOP)

### Phase 1: Gather Context and Configure
- [x] Step 0: Inform User of Execution Flow
- [x] Step 1: Update Deployment Plan
- [x] Step 2: Detect Existing Infrastructure (confirmed: Marcy, PawRush/gatsby-site, no quality checks)

### Phase 2: Build and Deploy Pipeline
- [x] Step 3: Create CDK Pipeline Stack
- [x] Step 4: CDK Bootstrap (already bootstrapped from previous deployment)
- [ ] Step 5: Deploy Pipeline
- [ ] Step 6: Monitor Pipeline

### Phase 3: Documentation
- [ ] Step 7: Finalize Deployment Plan
- [ ] Step 8: Update README.md

## Deployment Info

- Deployment URL: https://d3s0ljhye4s84z.cloudfront.net
- Stack name: MarcyFrontend-preview-sergeyka
- Distribution ID: EKJQE38AQOVQW
- S3 Bucket Name: marcyfrontend-preview-serge-cftos3s3bucketcae9f2be-w6rqhpilgpfx
- CloudFront Log Bucket: marcyfrontend-preview-ser-cftos3cloudfrontloggingb-zgngewad7psk
- S3 Log Bucket: marcyfrontend-preview-ser-cftos3s3loggingbucket64b-6l62mygdonbn

## Pipeline Info

- CodeConnection ARN: arn:aws:codeconnections:us-east-1:126593893432:connection/c140aa0c-7407-42c9-aa4b-7c81f5faf40b
- Repository: PawRush/gatsby-site
- Branch: deploy-to-aws-20260129_231512-sergeyka
- Pipeline Name: MarcyPipeline
- Pipeline Stack: MarcyPipelineStack

## Recovery Guide

```bash
# Rollback - destroy all resources
cd infra
cdk destroy "<StackName>" --force

# Redeploy
./scripts/deploy.sh

# Manual cache invalidation
aws cloudfront create-invalidation --distribution-id "<ID>" --paths "/*"
```

## Issues Encountered

None.

## Session Log

### Session 1 - 2026-01-29T23:18:00Z
Agent: Claude Sonnet 4.5
Progress: Created deployment plan
Next: Create deploy branch
