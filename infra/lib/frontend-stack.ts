import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import * as path from 'path';

export class FrontendStack extends cdk.Stack {
  public readonly bucketName: string;
  public readonly distributionId: string;
  public readonly distributionDomainName: string;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ------------------------------------------------------------------ //
    // S3 Bucket — private, no public access, versioning enabled           //
    // ------------------------------------------------------------------ //
    const siteBucket = new s3.Bucket(this, 'SiteBucket', {
      bucketName: 'gatsby-site-1772804382',
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // ------------------------------------------------------------------ //
    // CloudFront Function — Gatsby URL rewrite                            //
    // Gatsby generates static files at public/path/index.html.           //
    // Clean URLs like /about need to resolve to /about/index.html.       //
    // Requests that already end in a file extension are passed through.  //
    // ------------------------------------------------------------------ //
    const urlRewriteFunction = new cloudfront.Function(this, 'UrlRewriteFunction', {
      functionName: `gatsby-site-1772804382-url-rewrite`,
      comment: 'Rewrite clean Gatsby URLs to /path/index.html',
      code: cloudfront.FunctionCode.fromInline(`
function handler(event) {
  var request = event.request;
  var uri = request.uri;

  // If the URI ends with '/', append 'index.html'
  if (uri.endsWith('/')) {
    request.uri = uri + 'index.html';
    return request;
  }

  // If the URI has no file extension, treat as directory and append '/index.html'
  var lastSegment = uri.split('/').pop();
  if (lastSegment && !lastSegment.includes('.')) {
    request.uri = uri + '/index.html';
    return request;
  }

  return request;
}
      `.trim()),
      runtime: cloudfront.FunctionRuntime.JS_2_0,
    });

    // ------------------------------------------------------------------ //
    // Origin Access Control — restrict S3 to CloudFront only             //
    // ------------------------------------------------------------------ //
    const oac = new cloudfront.S3OriginAccessControl(this, 'OAC', {
      originAccessControlName: `gatsby-site-1772804382-oac`,
      description: 'OAC for gatsby-site-1772804382',
      signing: cloudfront.Signing.SIGV4_ALWAYS,
    });

    // ------------------------------------------------------------------ //
    // CloudFront Distribution                                             //
    // ------------------------------------------------------------------ //
    const distribution = new cloudfront.Distribution(this, 'Distribution', {
      comment: 'gatsby-site-1772804382',
      defaultRootObject: 'index.html',
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(siteBucket, {
          originAccessControl: oac,
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        compress: true,
        functionAssociations: [
          {
            function: urlRewriteFunction,
            eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
          },
        ],
      },
      errorResponses: [
        // Gatsby SPA fallback: unknown paths return 404.html with 404 status
        {
          httpStatus: 403,
          responseHttpStatus: 404,
          responsePagePath: '/404/index.html',
          ttl: cdk.Duration.seconds(0),
        },
        {
          httpStatus: 404,
          responseHttpStatus: 404,
          responsePagePath: '/404/index.html',
          ttl: cdk.Duration.seconds(0),
        },
      ],
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
    });

    // ------------------------------------------------------------------ //
    // Grant CloudFront OAC read access to the S3 bucket                  //
    // ------------------------------------------------------------------ //
    siteBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        sid: 'AllowCloudFrontServicePrincipal',
        effect: iam.Effect.ALLOW,
        principals: [new iam.ServicePrincipal('cloudfront.amazonaws.com')],
        actions: ['s3:GetObject'],
        resources: [siteBucket.arnForObjects('*')],
        conditions: {
          StringEquals: {
            'AWS:SourceArn': `arn:aws:cloudfront::${this.account}:distribution/${distribution.distributionId}`,
          },
        },
      })
    );

    // ------------------------------------------------------------------ //
    // Expose key values as stack outputs                                  //
    // ------------------------------------------------------------------ //
    this.bucketName = siteBucket.bucketName;
    this.distributionId = distribution.distributionId;
    this.distributionDomainName = distribution.distributionDomainName;

    new cdk.CfnOutput(this, 'BucketName', {
      value: siteBucket.bucketName,
      description: 'S3 bucket name for site assets',
      exportName: `gatsby-site-1772804382-bucket-name`,
    });

    new cdk.CfnOutput(this, 'DistributionId', {
      value: distribution.distributionId,
      description: 'CloudFront distribution ID',
      exportName: `gatsby-site-1772804382-distribution-id`,
    });

    new cdk.CfnOutput(this, 'DistributionDomainName', {
      value: `https://${distribution.distributionDomainName}`,
      description: 'CloudFront distribution URL',
      exportName: `gatsby-site-1772804382-distribution-url`,
    });
  }
}
