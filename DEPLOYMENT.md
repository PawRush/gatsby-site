---
sop_name: deploy-frontend-app
repo_name: gatsby-site
app_name: Marcy
app_type: Frontend Application - Gatsby Static Site
branch: deploy-to-aws-20260129_231512-sergeyka
created: 2026-01-29T23:18:00Z
last_updated: 2026-01-29T23:35:00Z
---

# Deployment Summary

Your app is deployed to AWS! Preview URL: https://d3s0ljhye4s84z.cloudfront.net

**Next Step: Automate Deployments**

You're currently using manual deployment. To automate deployments from GitHub, ask your coding agent to set up AWS CodePipeline using an agent SOP for pipeline creation. Try: "create a pipeline using AWS SOPs"

Services used: CloudFront, S3, CloudFormation, IAM

Questions? Ask your Coding Agent:
 - What resources were deployed to AWS?
 - How do I update my deployment?

## Quick Commands

```bash
# View deployment status
aws cloudformation describe-stacks --stack-name "MarcyFrontend-preview-sergeyka" --query 'Stacks[0].StackStatus' --output text

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id "EKJQE38AQOVQW" --paths "/*"

# View CloudFront access logs (last hour)
aws s3 ls "s3://marcyfrontend-preview-ser-cftos3cloudfrontloggingb-zgngewad7psk/" --recursive | tail -20

# Redeploy
./scripts/deploy.sh
```

## Production Readiness

For production deployments, consider:
- WAF Protection: Add AWS WAF with managed rules (Core Rule Set, Known Bad Inputs) and rate limiting
- CSP Headers: Configure Content Security Policy in CloudFront response headers (`script-src 'self'`, `frame-ancestors 'none'`)
- Custom Domain: Set up Route 53 and ACM certificate
- Monitoring: CloudWatch alarms for 4xx/5xx errors and CloudFront metrics
- Auth Redirect URLs: If using an auth provider (Auth0, Supabase, Firebase, Lovable, etc.), add your CloudFront URL to allowed redirect URLs

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

## Deployment Info

- Deployment URL: https://d3s0ljhye4s84z.cloudfront.net
- Stack name: MarcyFrontend-preview-sergeyka
- Distribution ID: EKJQE38AQOVQW
- S3 Bucket Name: marcyfrontend-preview-serge-cftos3s3bucketcae9f2be-w6rqhpilgpfx
- CloudFront Log Bucket: marcyfrontend-preview-ser-cftos3cloudfrontloggingb-zgngewad7psk
- S3 Log Bucket: marcyfrontend-preview-ser-cftos3s3loggingbucket64b-6l62mygdonbn

## Recovery Guide

```bash
# Rollback - destroy all resources
cd infra
cdk destroy "MarcyFrontend-preview-sergeyka" --force

# Redeploy
./scripts/deploy.sh

# Manual cache invalidation
aws cloudfront create-invalidation --distribution-id "EKJQE38AQOVQW" --paths "/*"
```

## Issues Encountered

None.

## Session Log

### Session 1 - 2026-01-29T23:18:00Z - 2026-01-29T23:35:00Z
Agent: Claude Sonnet 4.5
Progress: Complete deployment - all phases finished successfully
- Phase 1: Gathered context, detected Gatsby build configuration, validated prerequisites
- Phase 2: Built CDK infrastructure with CloudFront + S3
- Phase 3: Deployed to AWS successfully (5m 42s), validated all resources
- Phase 4: Finalized documentation

Deployment completed successfully at https://d3s0ljhye4s84z.cloudfront.net
