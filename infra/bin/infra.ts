#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { FrontendStack } from '../lib/frontend-stack';

const app = new cdk.App();

new FrontendStack(app, 'gatsby-site-1772791448', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
  },
  description: 'Gatsby static site infrastructure — S3 + CloudFront (gatsby-site-1772791448)',
  tags: {
    DeploymentId: 'gatsby-site-1772791448',
    Framework: 'gatsby',
    ManagedBy: 'deployment-agent',
  },
});
