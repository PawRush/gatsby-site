#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core';
import { FrontendStack } from '../lib/frontend-stack';

const deploymentId = 'gatsby-site-1772785016';

const app = new cdk.App();

new FrontendStack(app, `FrontendStack-${deploymentId}`, {
  deploymentId,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION ?? 'us-east-1',
  },
  description: `Gatsby static site infrastructure — ${deploymentId}`,
  tags: {
    DeploymentId: deploymentId,
    Framework: 'gatsby',
    ManagedBy: 'cdk',
  },
});
