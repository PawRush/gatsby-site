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

## Deployment

**Preview**: https://dg2p7mr8jna6f.cloudfront.net
**Pipeline**: [MarcySitePipeline](https://us-east-1.console.aws.amazon.com/codesuite/codepipeline/pipelines/MarcySitePipeline/view)

### Automated Deployment

Push to `deploy-to-aws-20260127_182622-sergeyka` branch to trigger automatic deployment:

```bash
git push origin deploy-to-aws-20260127_182622-sergeyka
```

### Manual Deployment

For preview environments:

```bash
./scripts/deploy.sh
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full details. Created with the [deploy-frontend-app] and [setup-pipeline] Agent Standard Operation Procedures from the [AWS MCP](https://docs.aws.amazon.com/aws-mcp/latest/userguide/what-is-mcp-server.html).