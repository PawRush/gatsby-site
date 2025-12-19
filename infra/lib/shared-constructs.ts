import * as cdk from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import { Construct } from "constructs";

export interface CodeBuildRoleProps {
  allowSecretsManager?: boolean;
  allowS3Artifacts?: boolean;
  allowCloudFormation?: boolean;
  allowCdkBootstrap?: boolean;
  additionalPolicies?: iam.PolicyStatement[];
}

export class CodeBuildRole extends Construct {
  public readonly role: iam.Role;

  constructor(scope: Construct, id: string, props?: CodeBuildRoleProps) {
    super(scope, id);

    this.role = new iam.Role(this, "Role", {
      assumedBy: new iam.ServicePrincipal("codebuild.amazonaws.com"),
      description: `CodeBuild role for ${id}`,
    });

    // CloudWatch logs permissions (always needed)
    this.role.addToPrincipalPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
        ],
        resources: [
          `arn:aws:logs:*:${cdk.Stack.of(this).account}:log-group:/aws/codebuild/*`,
        ],
      })
    );

    // Secrets Manager permissions
    if (props?.allowSecretsManager) {
      this.role.addToPrincipalPolicy(
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "secretsmanager:GetSecretValue",
            "secretsmanager:DescribeSecret",
          ],
          resources: [
            `arn:aws:secretsmanager:*:${cdk.Stack.of(this).account}:secret:*`,
          ],
        })
      );
    }

    // S3 artifacts permissions
    if (props?.allowS3Artifacts) {
      this.role.addToPrincipalPolicy(
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "s3:GetObject",
            "s3:PutObject",
            "s3:GetBucketVersioning",
          ],
          resources: [
            `arn:aws:s3:::*pipeline*`,
            `arn:aws:s3:::*pipeline*/*`,
          ],
        })
      );
    }

    // CloudFormation permissions
    if (props?.allowCloudFormation) {
      this.role.addToPrincipalPolicy(
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "cloudformation:CreateStack",
            "cloudformation:UpdateStack",
            "cloudformation:DeleteStack",
            "cloudformation:DescribeStacks",
            "cloudformation:DescribeStackEvents",
            "cloudformation:DescribeStackResources",
            "cloudformation:GetTemplateSummary",
          ],
          resources: [`arn:aws:cloudformation:*:${cdk.Stack.of(this).account}:stack/*`],
        })
      );

      // IAM permissions for CloudFormation
      this.role.addToPrincipalPolicy(
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "iam:PassRole",
            "iam:CreateRole",
            "iam:GetRole",
            "iam:AttachRolePolicy",
            "iam:DetachRolePolicy",
            "iam:DeleteRole",
            "iam:DeleteRolePolicy",
            "iam:PutRolePolicy",
          ],
          resources: [
            `arn:aws:iam::${cdk.Stack.of(this).account}:role/cdk-*`,
          ],
        })
      );
    }

    // CDK Bootstrap permissions
    if (props?.allowCdkBootstrap) {
      this.role.addToPrincipalPolicy(
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "s3:CreateBucket",
            "s3:PutBucketVersioning",
            "s3:PutBucketPolicy",
            "s3:GetBucketPolicy",
          ],
          resources: [`arn:aws:s3:::cdk-*`],
        })
      );

      this.role.addToPrincipalPolicy(
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "ecr:CreateRepository",
            "ecr:DescribeRepositories",
          ],
          resources: [`arn:aws:ecr:*:${cdk.Stack.of(this).account}:repository/cdk-*`],
        })
      );
    }

    // Add additional policies if provided
    if (props?.additionalPolicies) {
      props.additionalPolicies.forEach((policy) => {
        this.role.addToPrincipalPolicy(policy);
      });
    }
  }
}

export interface ArtifactsBucketProps {
  appName?: string;
}

export class ArtifactsBucket extends Construct {
  public readonly bucket: s3.Bucket;

  constructor(scope: Construct, id: string, props?: ArtifactsBucketProps) {
    super(scope, id);

    const account = cdk.Stack.of(this).account;
    const appName = props?.appName || "pipeline";

    this.bucket = new s3.Bucket(this, "Bucket", {
      bucketName: `${appName}-artifacts-${account}`,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      lifecycleRules: [
        {
          id: "DeleteOldArtifacts",
          enabled: true,
          noncurrentVersionExpiration: cdk.Duration.days(30),
        },
        {
          id: "AbortIncompleteMultipartUploads",
          enabled: true,
          abortIncompleteMultipartUploadAfter: cdk.Duration.days(7),
        },
      ],
    });
  }
}
