#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { FrontendStack } from '../lib/frontend-stack';

const app = new cdk.App();

const deploymentId = 'gatsby-site-1772795009';

new FrontendStack(app, deploymentId, {
  deploymentId,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT || '002255676568',
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
  },
  description: `Gatsby static site deployment — ${deploymentId}`,
  tags: {
    DeploymentId: deploymentId,
    Framework: 'gatsby',
    ManagedBy: 'cdk',
  },
});

app.synth();
