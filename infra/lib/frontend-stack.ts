import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as cloudfront_origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';
import * as fs from 'fs';
import * as path from 'path';

export interface FrontendStackProps extends cdk.StackProps {
  readonly deploymentId: string;
  readonly buildOutputPath: string;
}

export class FrontendStack extends cdk.Stack {
  public readonly distribution: cloudfront.Distribution;
  public readonly bucket: s3.Bucket;
  public readonly distributionUrl: string;

  constructor(scope: Construct, id: string, props: FrontendStackProps) {
    super(scope, id, props);

    const { deploymentId, buildOutputPath } = props;

    // Create S3 bucket for static website hosting
    this.bucket = new s3.Bucket(this, 'WebsiteBucket', {
      bucketName: `${deploymentId}-bucket`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      versioned: false,
    });

    // Create Origin Access Identity for CloudFront
    const oai = new cloudfront.OriginAccessIdentity(this, 'OAI', {
      comment: `OAI for ${deploymentId}`,
    });

    // Grant read permissions to CloudFront
    this.bucket.grantRead(oai);

    // Create CloudFront Function for URL rewriting (Gatsby SPA support)
    const urlRewriteFunction = new cloudfront.Function(this, 'UrlRewriteFunction', {
      functionName: `${deploymentId}-url-rewrite`,
      code: cloudfront.FunctionCode.fromInline(`
function handler(event) {
  var request = event.request;
  var uri = request.uri;
  
  // Check if the URI is missing a file extension or ends with '/'
  if (!uri.includes('.')) {
    // If URI ends with '/', append 'index.html'
    if (uri.endsWith('/')) {
      request.uri = uri + 'index.html';
    } 
    // Otherwise, append '/index.html' for client-side routing
    else {
      request.uri = uri + '/index.html';
    }
  }
  
  return request;
}
      `),
      comment: 'URL rewrite function for Gatsby SPA routing',
    });

    // Create CloudFront distribution
    this.distribution = new cloudfront.Distribution(this, 'Distribution', {
      comment: `CloudFront distribution for ${deploymentId}`,
      defaultBehavior: {
        origin: new cloudfront_origins.S3Origin(this.bucket, {
          originAccessIdentity: oai,
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
        compress: true,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        functionAssociations: [
          {
            function: urlRewriteFunction,
            eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
          },
        ],
      },
      defaultRootObject: 'index.html',
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/404.html',
          ttl: cdk.Duration.minutes(5),
        },
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.minutes(5),
        },
      ],
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
      enableIpv6: true,
      httpVersion: cloudfront.HttpVersion.HTTP2_AND_3,
      minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
    });

    // Deploy website content to S3 only if build output exists
    const buildOutputExists = fs.existsSync(buildOutputPath);
    
    if (buildOutputExists) {
      const deployment = new s3deploy.BucketDeployment(this, 'DeployWebsite', {
        sources: [s3deploy.Source.asset(buildOutputPath)],
        destinationBucket: this.bucket,
        distribution: this.distribution,
        distributionPaths: ['/*'],
        prune: true,
        memoryLimit: 512,
        cacheControl: [
          s3deploy.CacheControl.setPublic(),
          s3deploy.CacheControl.maxAge(cdk.Duration.days(365)),
        ],
        contentLanguage: 'en',
      });
    } else {
      // Add a warning annotation
      cdk.Annotations.of(this).addWarning(
        `Build output directory not found at ${buildOutputPath}. ` +
        'S3 deployment will be skipped. Run the build before deploying.'
      );
    }

    this.distributionUrl = `https://${this.distribution.distributionDomainName}`;

    // Outputs
    new cdk.CfnOutput(this, 'DistributionUrl', {
      value: this.distributionUrl,
      description: 'CloudFront distribution URL',
      exportName: `${deploymentId}-distribution-url`,
    });

    new cdk.CfnOutput(this, 'DistributionId', {
      value: this.distribution.distributionId,
      description: 'CloudFront distribution ID',
      exportName: `${deploymentId}-distribution-id`,
    });

    new cdk.CfnOutput(this, 'BucketName', {
      value: this.bucket.bucketName,
      description: 'S3 bucket name',
      exportName: `${deploymentId}-bucket-name`,
    });

    new cdk.CfnOutput(this, 'DeploymentId', {
      value: deploymentId,
      description: 'Deployment ID',
    });

    new cdk.CfnOutput(this, 'BuildOutputPath', {
      value: buildOutputPath,
      description: 'Build output directory path',
    });

    new cdk.CfnOutput(this, 'BuildOutputExists', {
      value: buildOutputExists ? 'true' : 'false',
      description: 'Whether build output exists',
    });

    // Add tags for resource management
    cdk.Tags.of(this).add('DeploymentId', deploymentId);
    cdk.Tags.of(this).add('Framework', 'Gatsby');
    cdk.Tags.of(this).add('ManagedBy', 'CDK');
  }
}
