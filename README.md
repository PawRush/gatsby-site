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

The site is deployed to AWS (S3 + CloudFront) using AWS CDK.

### Live URL

**https://d10vf2tw1paq7l.cloudfront.net**

### AWS Resources

| Resource | Value |
|---|---|
| **S3 Bucket** | `gatsby-site-1772804382` |
| **CloudFront Distribution ID** | `E3348J8OUMRF4A` |
| **CloudFormation Stack** | `gatsby-site-1772804382` |

### Deploy

```sh
# 1. Build the site
gatsby build

# 2. Sync hashed assets (JS, CSS, images) — long-lived cache
aws s3 sync public/ s3://gatsby-site-1772804382/ --delete \
  --exclude "index.html" --exclude "*.json" \
  --cache-control "public, max-age=31536000, immutable"

# 3. Sync HTML + JSON manifests — no cache
aws s3 sync public/ s3://gatsby-site-1772804382/ \
  --exclude "*" --include "index.html" --include "*.json" \
  --cache-control "no-cache, no-store, must-revalidate"

# 4. Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id E3348J8OUMRF4A \
  --paths "/*"
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full details including infrastructure teardown and CDK redeploy commands.
