---
sop_name: setup-pipeline
repo_name: gatsby-site
app_name: MarcySite
app_type: CI/CD Pipeline
branch: deploy-to-aws-20260127_182622-sergeyka
created: 2026-01-27T18:50:00Z
last_updated: 2026-01-27T18:50:00Z
---

# Deployment Plan: MarcySite Pipeline

Coding Agents should follow this Deployment Plan, and validate previous progress if picking up the Deployment in a new coding session.

**IMPORTANT**: Update this plan after EACH step completes. Mark the step `[x]` and update `last_updated` timestamp.

## Phase 1: Gather Context and Configure
- [ ] Step 0: Inform User of Execution Flow
- [ ] Step 1: Create Deployment Plan
- [ ] Step 2: Detect Existing Infrastructure
  - [ ] 2.1: Detect stacks and frontend
  - [ ] 2.2: Detect app name and git repository
  - [ ] 2.3: Determine quality checks
  - [ ] 2.4: User confirmation
  - [ ] 2.5: Use existing CodeConnection

## Phase 2: Build and Deploy Pipeline
- [ ] Step 3: Create CDK Pipeline Stack
- [ ] Step 4: CDK Bootstrap
- [ ] Step 5: Deploy Pipeline
  - [ ] 5.1: Push to remote
  - [ ] 5.2: Verify CodeConnection
  - [ ] 5.3: Deploy pipeline stack
  - [ ] 5.4: Trigger pipeline
- [ ] Step 6: Monitor Pipeline

## Phase 3: Documentation
- [ ] Step 7: Finalize Deployment Plan
- [ ] Step 8: Update README.md

## Pipeline Info

- Pipeline Name: (after creation)
- Pipeline ARN: (after creation)
- CodeConnection ARN: arn:aws:codeconnections:us-east-1:126593893432:connection/c140aa0c-7407-42c9-aa4b-7c81f5faf40b
- Repository: (to be detected)
- Branch: deploy-to-aws-20260127_182622-sergeyka
- Build Output: (to be detected)

## Recovery Guide

```bash
# Rollback
cd infra
cdk destroy "MarcySitePipelineStack" --context codeConnectionArn=arn:aws:codeconnections:us-east-1:126593893432:connection/c140aa0c-7407-42c9-aa4b-7c81f5faf40b

# Redeploy
npm run deploy:pipeline
```

## Issues Encountered

None.

## Session Log

### Session 1 - 2026-01-27T18:50:00Z
Agent: Claude Sonnet 4.5
Progress: Created deployment plan
Next: Detect existing infrastructure
