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
## 🚢 Deployment

This site is deployed to AWS S3 + CloudFront.

**Live URL:** https://d3ixp6wli19wn5.cloudfront.net

### Deploy

Build the site and sync to S3:

```sh
gatsby build

# Sync hashed assets (JS, CSS, images) with long-lived cache
aws s3 sync public/ s3://gatsby-site-1772791448/ \
  --delete \
  --exclude "index.html" --exclude "*.json" \
  --cache-control "public, max-age=31536000, immutable"

# Sync index.html and JSON manifests with no-cache headers
aws s3 sync public/ s3://gatsby-site-1772791448/ \
  --exclude "*" --include "index.html" --include "*.json" \
  --cache-control "no-cache, no-store, must-revalidate"

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id E27LRFN7KVMIL4 \
  --paths "/*"
```

### AWS Resources

| Resource            | Value                                 |
|---------------------|---------------------------------------|
| S3 Bucket           | `gatsby-site-1772791448`              |
| CloudFront ID       | `E27LRFN7KVMIL4`                      |
| CloudFormation Stack | `gatsby-site-1772791448`             |

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full deployment details.
