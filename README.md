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

## 🌐 AWS Deployment

This site is deployed on AWS using S3 + CloudFront. See `./deployment_plan.md` for deployment status and history.

**Live Site:** https://d1ayimb380n433.cloudfront.net

### Deploy to AWS

Deploy to your personal preview environment:

```sh
NODE_OPTIONS=--openssl-legacy-provider ./scripts/deploy.sh
```

Deploy to other environments:

```sh
NODE_OPTIONS=--openssl-legacy-provider ./scripts/deploy.sh dev
NODE_OPTIONS=--openssl-legacy-provider ./scripts/deploy.sh prod
```

### AWS Infrastructure

- **S3 Bucket:** gatsbysitefrontend-preview-jairosp-763835214576
- **CloudFront Distribution ID:** E13LJZT96EK968
- **Region:** us-east-1
- **IaC:** AWS CDK (TypeScript) in `./infra` directory

### View Deployment Outputs

```bash
aws cloudformation describe-stacks \
  --stack-name GatsbySiteFrontend-preview-$(whoami) \
  --query 'Stacks[0].Outputs' \
  --output table
```

### Cleanup

To remove deployed resources:

```bash
cd infra && npx cdk destroy --all
```