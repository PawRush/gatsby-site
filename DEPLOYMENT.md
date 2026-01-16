---
sop_name: deploy-frontend-app
repo_name: gatsby-site
app_name: GatsbySite
app_type: Frontend Application
framework: Gatsby v4.25.0
package_manager: npm
build_command: npm run build
output_directory: public/
base_path: /
cloudfront_config: URL rewrite function (static multi-page)
branch: deploy-to-aws
created: 2026-01-16T16:18:00Z
last_updated: 2026-01-16T16:33:00Z
---

# Deployment Summary

Your app is deployed to AWS with a 'preview' URL that doesn't change when you update GitHub. Share this link with others.

To connect deployments to GitHub changes, ask your coding agent to `setup a AWS CodePipeline`.

Services used: CloudFront, S3, CloudFormation, IAM

Questions? Ask your Coding Agent:
 - What resources were deployed to AWS?
 - How do I update my deployment?

## Quick Commands

```bash
# View deployment status
aws cloudformation describe-stacks --stack-name "GatsbySiteFrontend-preview-sergeyka" --query 'Stacks[0].StackStatus' --output text --no-cli-pager

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id "E34ZLTRCJA36XY" --paths "/*" --no-cli-pager

# View CloudFront access logs (last hour)
aws s3 ls "s3://gatsbysitefrontend-previe-cftos3cloudfrontloggingb-abx9zd0mvyyr/" --recursive | tail -20

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

# Deployment Plan: GatsbySite

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

- Deployment URL: https://d3co7n8suw52ey.cloudfront.net
- Stack name: GatsbySiteFrontend-preview-sergeyka
- Distribution ID: E34ZLTRCJA36XY
- S3 bucket name: gatsbysitefrontend-preview--cftos3s3bucketcae9f2be-jzhcw3r57mcx
- CloudFront log bucket: gatsbysitefrontend-previe-cftos3cloudfrontloggingb-abx9zd0mvyyr
- S3 log bucket: gatsbysitefrontend-previe-cftos3s3loggingbucket64b-synbd112c83a
- Deployment timestamp: 2026-01-16T16:32:58Z

## Recovery Guide

```bash
# Rollback
cd infra
cdk destroy "GatsbySiteFrontend-preview-sergeyka"

# Redeploy
./scripts/deploy.sh
```

## Issues Encountered

None.

## Session Log

### Session 1 - 2026-01-16T16:18:00Z
Agent: Claude Sonnet 4.5
Progress: Complete deployment - all phases finished successfully
- Phase 1: Gathered context, detected Gatsby configuration
- Phase 2: Built CDK infrastructure with CloudFront + S3
- Phase 3: Deployed to AWS, validated stack
- Phase 4: Finalized documentation
Next: Use ./scripts/deploy.sh to redeploy after changes
