---
sop_name: deploy-frontend-app
repo_name: MarcySutton_com-gatsby-site
app_name: MarcySutton
app_type: Frontend Application (Gatsby Static Site)
branch: deploy-to-aws-20260501_121659-kamielw
created: 2026-05-01T12:55:00Z
last_updated: 2026-05-01T13:05:00Z
---

# Deployment Summary

Your app is deployed to AWS! Preview URL: **https://d2pj0vcu8ixtoj.cloudfront.net**

**Next Step: Automate Deployments**

You're currently using manual deployment. To automate deployments from GitHub, ask your coding agent to set up AWS CodePipeline using an agent SOP for pipeline creation. Try: "create a pipeline using AWS SOPs"

Services used: CloudFront, S3, CloudFormation, IAM

Questions? Ask your Coding Agent:
 - What resources were deployed to AWS?
 - How do I update my deployment?

## Quick Commands

```bash
# View deployment status
aws cloudformation describe-stacks --stack-name "MarcySuttonFrontend-preview-kamielw" --region eu-central-1 --query 'Stacks[0].StackStatus' --output text

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id "E3EL8K3SVQP65Q" --paths "/*"

# View CloudFront access logs (last hour)
aws s3 ls "s3://marcysuttonfrontend-previ-cftos3cloudfrontloggingb-zsengz9tmzcf/" --recursive | tail -20

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

*Original deployment plan continues below...*

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
- [x] Step 12: Finalize Deployment Plan
- [x] Step 13: Update README.md

## Deployment Info

- Framework: Gatsby 4.x
- Package Manager: npm (package-lock.json detected)
- Build Command: npm run build
- Output Directory: public/
- URL Structure: /path/ (directories with index.html)
- CloudFront Config: URL rewrite function (/path → /path/index.html)
- Base Path: / (root deployment)
- Trailing Slash: Default (always) - creates /path/index.html
- Lint Command: None detected
- Deployment URL: https://d2pj0vcu8ixtoj.cloudfront.net
- Stack Name: MarcySuttonFrontend-preview-kamielw
- AWS Region: eu-central-1
- CloudFront Distribution ID: E3EL8K3SVQP65Q
- CloudFront Domain: d2pj0vcu8ixtoj.cloudfront.net
- S3 Bucket Name: marcysuttonfrontend-preview-cftos3s3bucketcae9f2be-7agpn7iuda6y
- CloudFront Log Bucket: marcysuttonfrontend-previ-cftos3cloudfrontloggingb-zsengz9tmzcf
- S3 Log Bucket: marcysuttonfrontend-previ-cftos3s3loggingbucket64b-mfsipwiajnqi
- Deployment Timestamp: 2026-05-01T11:03:00Z
- Stack Status: CREATE_COMPLETE
- CloudFront Status: Deployed

## Recovery Guide

```bash
# Rollback
cd infra && npx cdk destroy "MarcySuttonFrontend-preview-kamielw" --region eu-central-1

# Redeploy
./scripts/deploy.sh

# View deployment status
aws cloudformation describe-stacks --stack-name "MarcySuttonFrontend-preview-kamielw" --region eu-central-1 --query 'Stacks[0].StackStatus' --output text

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id "E3EL8K3SVQP65Q" --paths "/*"
```

## Issues Encountered

None.

## Session Log

### Session 1 - 2026-05-01T12:55:00Z
Agent: Claude Sonnet 4.5
Progress: ✅ All Phases Complete - Successfully deployed Gatsby site to AWS CloudFront + S3. Phases completed: (1) Detected build config and validated prerequisites, (2) Generated CDK infrastructure with URL rewrite function, (3) Deployed to eu-central-1 with hotswap mode
Next: Finalize documentation (DEPLOYMENT.md, AGENTS.md, README.md updates)
