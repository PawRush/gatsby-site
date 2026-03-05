#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { FrontendStack } from '../lib/frontend-stack';
import * as path from 'path';

const app = new cdk.App();

const deploymentId = process.env.DEPLOYMENT_ID || 'gatsby-site-1772712371';
const buildOutputPath = path.join(__dirname, '../../public');

new FrontendStack(app, `${deploymentId}-stack`, {
  deploymentId: deploymentId,
  buildOutputPath: buildOutputPath,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  description: `Frontend deployment stack for ${deploymentId} (Gatsby)`,
});

app.synth();
