import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';

export class FrontendStack extends cdk.Stack {
  public readonly bucketName: string;
  public readonly distributionId: string;
  public readonly distributionDomainName: string;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ── S3 Bucket (private, no public access) ──────────────────────────────
    const siteBucket = new s3.Bucket(this, 'SiteBucket', {
      bucketName: 'gatsby-site-1772791448',
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      versioned: false,
    });

    // ── Gatsby URL-rewrite function (SPA + clean URLs) ─────────────────────
    // Gatsby generates /foo/index.html for every route.
    // This function rewrites:
    //   /                   → /index.html
    //   /about              → /about/index.html
    //   /about/             → /about/index.html
    //   /page.html          → /page.html  (passthrough)
    //   /static/img.png     → /static/img.png (passthrough)
    const urlRewriteFunction = new cloudfront.Function(this, 'UrlRewriteFunction', {
      functionName: `gatsby-url-rewrite-gatsby-site-1772791448`,
      comment: 'Rewrite clean URLs to index.html for Gatsby static site',
      code: cloudfront.FunctionCode.fromInline(`
function handler(event) {
  var request = event.request;
  var uri = request.uri;

  // If URI has a file extension, pass through as-is
  if (uri.match(/\\.[a-zA-Z0-9]+$/)) {
    return request;
  }

  // Ensure trailing slash then append index.html
  if (uri.endsWith('/')) {
    request.uri = uri + 'index.html';
  } else {
    request.uri = uri + '/index.html';
  }

  return request;
}
      `),
      runtime: cloudfront.FunctionRuntime.JS_2_0,
    });

    // ── Origin Access Control ──────────────────────────────────────────────
    const oac = new cloudfront.S3OriginAccessControl(this, 'OAC', {
      description: 'OAC for gatsby-site-1772791448',
    });

    // ── CloudFront Distribution ────────────────────────────────────────────
    const distribution = new cloudfront.Distribution(this, 'Distribution', {
      comment: 'gatsby-site-1772791448 CloudFront distribution',
      defaultRootObject: 'index.html',
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(siteBucket, {
          originAccessControl: oac,
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        compress: true,
        functionAssociations: [
          {
            function: urlRewriteFunction,
            eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
          },
        ],
      },
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.seconds(0),
        },
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/404/index.html',
          ttl: cdk.Duration.seconds(0),
        },
      ],
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
    });

    // ── Outputs ────────────────────────────────────────────────────────────
    this.bucketName = siteBucket.bucketName;
    this.distributionId = distribution.distributionId;
    this.distributionDomainName = distribution.distributionDomainName;

    new cdk.CfnOutput(this, 'BucketName', {
      value: siteBucket.bucketName,
      description: 'S3 bucket name for static assets',
      exportName: `gatsby-site-1772791448-bucket-name`,
    });

    new cdk.CfnOutput(this, 'DistributionId', {
      value: distribution.distributionId,
      description: 'CloudFront distribution ID',
      exportName: `gatsby-site-1772791448-distribution-id`,
    });

    new cdk.CfnOutput(this, 'DistributionUrl', {
      value: `https://${distribution.distributionDomainName}`,
      description: 'CloudFront distribution URL',
      exportName: `gatsby-site-1772791448-distribution-url`,
    });
  }
}
