#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { FrontendStack } from '../lib/frontend-stack';

const app = new cdk.App();

new FrontendStack(app, 'gatsby-site-1772804382', {
  stackName: 'gatsby-site-1772804382',
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  description: 'Gatsby static site — S3 + CloudFront (deployment: gatsby-site-1772804382)',
  tags: {
    DeploymentId: 'gatsby-site-1772804382',
    Framework: 'gatsby',
    ManagedBy: 'cdk',
  },
});
