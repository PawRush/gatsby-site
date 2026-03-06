<h1 align="center">
  MarcySutton.com v5
</h1>
<p>Redesign is live!</p>

<p>This website was built with Gatsby.js. It has a baseline of accessibility, works without JavaScript and is offline-capable.</p>

## 🚀 Quick start


1.  **Start developing.**

    Start it up.

    ```sh
    gatsby develop
    ```

1.  **Open the source code and start editing!**

    The site is now running at `http://localhost:8000`!
    
    *Note: You'll also see a second link: `http://localhost:8000/___graphql`. This is a tool you can use to experiment with querying this website's data. Learn more about using this tool in the [Gatsby tutorial](https://www.gatsbyjs.org/tutorial/part-five/#introducing-graphiql).*


1.  **Build and serve.**

    To build the site for production and serve it in a browser:

    ```sh
    gatsby build && gatsby serve
    ```

1. **Give Feedback.**

    I'm actively working to improve this website's accessibility and functionality. If you find something that could be improved, please [file an issue](./issues/new)!
## 🚀 Deployment

The site is deployed to **AWS S3 + CloudFront** using AWS CDK.

### Live URL

> **https://d1qxkv3zwgmkge.cloudfront.net**

### AWS Resources

| Resource | Value |
|---|---|
| **CloudFront Distribution** | `E176NW0OB17LVR` |
| **S3 Bucket** | `gatsby-site-1772785016` |
| **CloudFormation Stack** | `FrontendStack-gatsby-site-1772785016` |
| **Region** | `us-east-1` |

### Deploy Command

Build the site and sync to S3, then invalidate the CloudFront cache:

```sh
# 1. Install dependencies and build
npm ci && npm run build

# 2. Sync to S3
aws s3 sync public/ s3://gatsby-site-1772785016/ \
  --cache-control "public,max-age=31536000,immutable" --delete

# 3. Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id E176NW0OB17LVR \
  --paths "/*"
```

Or use the all-in-one script:

```sh
bash scripts/deploy.sh
```

### Update Infrastructure

```sh
cd infra
cdk deploy --require-approval never \
  -c deploymentId=gatsby-site-1772785016 \
  --outputs-file cdk-outputs.json
```

For full deployment details, see [DEPLOYMENT.md](./DEPLOYMENT.md).
