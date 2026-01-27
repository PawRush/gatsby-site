#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { execSync } from "child_process";
import { FrontendStack } from "../lib/stacks/frontend-stack";
import { PipelineStack } from "../lib/stacks/pipeline-stack";

const app = new cdk.App();

const account = process.env.CDK_DEFAULT_ACCOUNT;
const region = process.env.CDK_DEFAULT_REGION || "us-east-1";

const codeConnectionArn = app.node.tryGetContext("codeConnectionArn");
const repositoryName = app.node.tryGetContext("repositoryName") || "PawRush/gatsby-site";
const branchName = app.node.tryGetContext("branchName") || "deploy-to-aws";

// Manual deployment stacks (without pipeline)
if (!codeConnectionArn) {
  const getDefaultEnvironment = (): string => {
    try {
      const username = process.env.USER || execSync('whoami').toString().trim();
      return `preview-${username}`;
    } catch {
      return 'preview-local';
    }
  };

  const environment = app.node.tryGetContext("environment") || getDefaultEnvironment();
  const buildOutputPath = app.node.tryGetContext("buildPath") || "../public";

  new FrontendStack(app, `GatsbySiteFrontend-${environment}`, {
    env: { account, region },
    environment,
    buildOutputPath,
    description: `Static website hosting - ${environment}`,
    terminationProtection: environment === "prod",
  });

  cdk.Tags.of(app).add("Environment", environment);
}

// Pipeline stack (automated deployment)
if (codeConnectionArn) {
  new PipelineStack(app, "GatsbySitePipelineStack", {
    env: { account, region },
    description: "CI/CD Pipeline for GatsbySite",
    codeConnectionArn,
    repositoryName,
    branchName,
    terminationProtection: true,
  });
}

cdk.Tags.of(app).add("Project", "GatsbySite");
cdk.Tags.of(app).add("ManagedBy", "CDK");
