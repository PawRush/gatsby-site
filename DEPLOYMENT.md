---
sop_name: deploy-frontend-app
repo_name: gatsby-site
app_name: MarcySutton
app_type: Frontend Application (Gatsby)
branch: deploy-to-aws-20260128_131744-sergeyka
created: 2026-01-28T13:22:00Z
completed: 2026-01-28T13:36:00Z
---

# Deployment Summary

Your app is deployed to AWS! Preview URL: https://d2xdyoerq6gogv.cloudfront.net

**Next Step: Automate Deployments**

You're currently using manual deployment. To automate deployments from GitHub, ask your coding agent to set up AWS CodePipeline using an agent SOP for pipeline creation. Try: "create a pipeline using AWS SOPs"

Services used: CloudFront, S3, CloudFormation, IAM

Questions? Ask your Coding Agent:
 - What resources were deployed to AWS?
 - How do I update my deployment?

## Quick Commands

```bash
# View deployment status
aws cloudformation describe-stacks --stack-name "MarcySuttonFrontend-preview-sergeyka" --query 'Stacks[0].StackStatus' --output text

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id "E21YYKH3MHQUVB" --paths "/*"

# View CloudFront access logs (last hour)
aws s3 ls "s3://marcysuttonfrontend-previ-cftos3cloudfrontloggingb-2emm05fzpxzh/" --recursive | tail -20

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
cd infra && cdk destroy "MarcySuttonFrontend-preview-sergeyka"

# Redeploy
./scripts/deploy.sh

# Manual invalidation
aws cloudfront create-invalidation --distribution-id "E21YYKH3MHQUVB" --paths "/*"
```

## Issues Encountered

None.

## Session Log

### Session 1 - 2026-01-28T13:22:00Z - 2026-01-28T13:36:00Z
Agent: Claude Sonnet 4.5
Progress: Complete deployment from setup through AWS deployment
- Phase 1: Analyzed codebase, detected Gatsby configuration, validated prerequisites
- Phase 2: Created CDK infrastructure with CloudFront + S3 distribution, URL rewrite function
- Phase 3: Successfully deployed to AWS, validated stack and distribution
- Phase 4: Finalized documentation
Result: Successfully deployed at https://d2xdyoerq6gogv.cloudfront.net
