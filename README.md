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

### Production Deployment

Pipeline: https://us-east-1.console.aws.amazon.com/codesuite/codepipeline/pipelines/GatsbySitePipeline/view

Deploy: `git push origin deploy-to-aws`

The pipeline automatically builds and deploys to production when you push to the `deploy-to-aws` branch.

### Preview Deployment

Preview URL: https://d3co7n8suw52ey.cloudfront.net

Deploy preview: `./scripts/deploy.sh`

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full details. Created with the [deploy-codepipeline] Agent Standard Operation Procedure from the [AWS MCP](https://docs.aws.amazon.com/aws-mcp/latest/userguide/what-is-mcp-server.html).