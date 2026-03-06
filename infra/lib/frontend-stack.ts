import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as cr from 'aws-cdk-lib/custom-resources';

export interface FrontendStackProps extends cdk.StackProps {
  deploymentId: string;
}

export class FrontendStack extends cdk.Stack {
  public readonly bucketName: string;
  public readonly distributionId: string;
  public readonly distributionDomainName: string;

  constructor(scope: Construct, id: string, props: FrontendStackProps) {
    super(scope, id, props);

    const { deploymentId } = props;

    // -------------------------------------------------------------------------
    // S3 Bucket — private, blocks all public access; only CloudFront can read
    // -------------------------------------------------------------------------
    const siteBucket = new s3.Bucket(this, 'SiteBucket', {
      bucketName: deploymentId,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // -------------------------------------------------------------------------
    // CloudFront Origin Access Control (OAC) — modern replacement for OAI
    // -------------------------------------------------------------------------
    const oac = new cloudfront.CfnOriginAccessControl(this, 'OAC', {
      originAccessControlConfig: {
        name: `oac-${deploymentId}`,
        originAccessControlOriginType: 's3',
        signingBehavior: 'always',
        signingProtocol: 'sigv4',
        description: `OAC for ${deploymentId}`,
      },
    });

    // -------------------------------------------------------------------------
    // CloudFront Function — Gatsby SPA URL rewrite
    //
    // Gatsby generates clean URLs (no .html extension) and stores files as:
    //   about/index.html  →  served at /about
    //   index.html        →  served at /
    //
    // This function rewrites incoming request URIs so that:
    //   /about            →  /about/index.html
    //   /about/           →  /about/index.html
    //   /                 →  /index.html
    //   /main.js          →  /main.js  (unchanged — has extension)
    // -------------------------------------------------------------------------
    const urlRewriteFunction = new cloudfront.Function(this, 'UrlRewriteFunction', {
      functionName: `url-rewrite-${deploymentId}`,
      comment: 'Gatsby SPA URL rewrite: append /index.html to extensionless paths',
      code: cloudfront.FunctionCode.fromInline(`
function handler(event) {
  var request = event.request;
  var uri = request.uri;

  // If the URI ends with '/', append 'index.html'
  if (uri.endsWith('/')) {
    request.uri = uri + 'index.html';
  }
  // If the URI has no file extension, append '/index.html'
  else if (!uri.includes('.', uri.lastIndexOf('/'))) {
    request.uri = uri + '/index.html';
  }

  return request;
}
      `.trim()),
      runtime: cloudfront.FunctionRuntime.JS_2_0,
    });

    // -------------------------------------------------------------------------
    // CloudFront Cache Policy — optimised for Gatsby static assets
    // Gatsby hashes asset filenames (e.g. main-abc123.js), so they can be
    // cached long-term. HTML files should be cached briefly (revalidated).
    // -------------------------------------------------------------------------
    const cachePolicy = new cloudfront.CachePolicy(this, 'CachePolicy', {
      cachePolicyName: `cache-policy-${deploymentId}`,
      comment: 'Gatsby static site cache policy',
      defaultTtl: cdk.Duration.days(1),
      minTtl: cdk.Duration.seconds(0),
      maxTtl: cdk.Duration.days(365),
      headerBehavior: cloudfront.CacheHeaderBehavior.none(),
      queryStringBehavior: cloudfront.CacheQueryStringBehavior.none(),
      cookieBehavior: cloudfront.CacheCookieBehavior.none(),
      enableAcceptEncodingGzip: true,
      enableAcceptEncodingBrotli: true,
    });

    // -------------------------------------------------------------------------
    // CloudFront Distribution
    // -------------------------------------------------------------------------
    const distribution = new cloudfront.Distribution(this, 'Distribution', {
      comment: `Gatsby site — ${deploymentId}`,
      defaultRootObject: 'index.html',

      defaultBehavior: {
        // Use S3BucketOrigin for OAC support (aws-cdk-lib >= 2.147)
        origin: origins.S3BucketOrigin.withOriginAccessControl(siteBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        compress: true,
        functionAssociations: [
          {
            function: urlRewriteFunction,
            eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
          },
        ],
      },

      // Gatsby client-side routing: return index.html for 403/404 so React
      // Router can handle the path. HTTP 200 avoids caching broken responses.
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
          responsePagePath: '/index.html',
          ttl: cdk.Duration.seconds(0),
        },
      ],

      priceClass: cloudfront.PriceClass.PRICE_CLASS_100, // US, Canada, Europe
    });

    // -------------------------------------------------------------------------
    // Wire OAC to the distribution's S3 origin
    // CDK's L2 S3BucketOrigin.withOriginAccessControl() creates the OAC for us,
    // but we also need to attach the bucket policy granting CloudFront access.
    // The L2 construct handles the bucket policy automatically; we just need to
    // ensure the OAC resource dependency is correct.
    // -------------------------------------------------------------------------

    // -------------------------------------------------------------------------
    // Bucket Policy — allow CloudFront service principal via OAC
    // -------------------------------------------------------------------------
    siteBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        sid: 'AllowCloudFrontServicePrincipal',
        effect: iam.Effect.ALLOW,
        principals: [new iam.ServicePrincipal('cloudfront.amazonaws.com')],
        actions: ['s3:GetObject'],
        resources: [`${siteBucket.bucketArn}/*`],
        conditions: {
          StringEquals: {
            'AWS:SourceArn': `arn:aws:cloudfront::${this.account}:distribution/${distribution.distributionId}`,
          },
        },
      })
    );

    // -------------------------------------------------------------------------
    // Expose values as CloudFormation Outputs
    // -------------------------------------------------------------------------
    this.bucketName = siteBucket.bucketName;
    this.distributionId = distribution.distributionId;
    this.distributionDomainName = distribution.distributionDomainName;

    new cdk.CfnOutput(this, 'BucketName', {
      exportName: `${deploymentId}-bucket-name`,
      value: siteBucket.bucketName,
      description: 'S3 bucket that holds the Gatsby build output',
    });

    new cdk.CfnOutput(this, 'DistributionId', {
      exportName: `${deploymentId}-distribution-id`,
      value: distribution.distributionId,
      description: 'CloudFront distribution ID (used for cache invalidation)',
    });

    new cdk.CfnOutput(this, 'DistributionDomainName', {
      exportName: `${deploymentId}-distribution-domain`,
      value: `https://${distribution.distributionDomainName}`,
      description: 'CloudFront HTTPS URL for the deployed Gatsby site',
    });

    new cdk.CfnOutput(this, 'DeployCommand', {
      value: `aws s3 sync public/ s3://${siteBucket.bucketName} --delete`,
      description: 'Command to sync Gatsby build output to S3',
    });

    new cdk.CfnOutput(this, 'InvalidateCommand', {
      value: `aws cloudfront create-invalidation --distribution-id ${distribution.distributionId} --paths "/*"`,
      description: 'Command to invalidate CloudFront cache after deploy',
    });
  }
}
