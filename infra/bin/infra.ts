#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { execSync } from "child_process";
import { FrontendStack } from '../lib/stacks/frontend-stack';
import { PipelineStack } from '../lib/pipeline-stack';

const app = new cdk.App();

const getDefaultEnvironment = (): string => {
  try {
    const username = process.env.USER || execSync("whoami").toString().trim();
    return `preview-${username}`;
  } catch {
    return "preview-local";
  }
};

const environment = app.node.tryGetContext("environment") || getDefaultEnvironment();
const account = process.env.CDK_DEFAULT_ACCOUNT;
const region = process.env.CDK_DEFAULT_REGION || "us-east-1";
const buildOutputPath = app.node.tryGetContext("buildPath") || "../public";
const pipelineOnly = app.node.tryGetContext("pipelineOnly") === "true";

// Create infrastructure stacks only if not pipeline-only mode
if (!pipelineOnly) {
  new FrontendStack(app, `GatsbySiteFrontend-${environment}`, {
    env: { account, region },
    environment,
    buildOutputPath,
    description: `Static website hosting - ${environment}`,
  });
}

// Create pipeline stack (only if CodeConnection ARN is provided)
const codeConnectionArn = app.node.tryGetContext("codeConnectionArn");
const repositoryName = app.node.tryGetContext("repositoryName") || "PawRush/gatsby-site";
const branchName = app.node.tryGetContext("branchName") || "main";

if (codeConnectionArn) {
  new PipelineStack(app, "MarcySuttonPipelineStack", {
    env: { account, region },
    codeConnectionArn,
    repositoryName,
    branchName,
    description: "CI/CD Pipeline for MarcySutton.com",
  });
} else if (pipelineOnly) {
  console.warn(
    "⚠️  CodeConnection ARN not provided. Pipeline stack will not be created."
  );
  console.warn("   Provide via: --context codeConnectionArn=<ARN>");
}

cdk.Tags.of(app).add("Project", "GatsbySite");
cdk.Tags.of(app).add("ManagedBy", "CDK");
cdk.Tags.of(app).add("Environment", environment);
