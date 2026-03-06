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

This site is deployed to **AWS S3 + CloudFront** via AWS CDK.

### Live URL

🌐 **https://d2xr07mwscjanf.cloudfront.net**

### AWS Resources

| Resource | Value |
|---|---|
| **CloudFront URL** | `https://d2xr07mwscjanf.cloudfront.net` |
| **Distribution ID** | `E9ZKTFQYOD596` |
| **S3 Bucket** | `gatsby-site-1772795009` |
| **CloudFormation Stack** | `gatsby-site-1772795009` |

### Deploy Command

Build the site and sync to S3:

```sh
# 1. Build
gatsby build

# 2. Sync hashed assets (long-lived cache)
aws s3 sync public/ s3://gatsby-site-1772795009/ --delete \
  --exclude "index.html" --exclude "*.json" \
  --cache-control "public, max-age=31536000, immutable"

# 3. Sync HTML + JSON (no-cache)
aws s3 sync public/ s3://gatsby-site-1772795009/ \
  --exclude "*" --include "index.html" --include "*.json" \
  --cache-control "no-cache, no-store, must-revalidate"

# 4. Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id E9ZKTFQYOD596 \
  --paths "/*"
```

For full deployment details and additional commands, see [DEPLOYMENT.md](./DEPLOYMENT.md).
