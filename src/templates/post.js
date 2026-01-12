import React, { Component } from "react"
import { graphql } from "gatsby"
import parse from 'html-react-parser'
import PropTypes from "prop-types"
import BodyClassName from 'react-body-classname'
import { decode as htmlDecode } from 'html-entities'
import { getSrc } from "gatsby-plugin-image"

import RouteTargetHeading from "../components/route-target-heading"
import SEO from '../components/seo'
import Layout from '../components/layout'
import List from '../components/list'

class PostTemplate extends Component {
  render() {
    const post = this.props.data.markdownRemark
    const posts = this.props.data.allMarkdownRemark.edges
    const coverImageSrc = post.frontmatter.coverImage ? getSrc(post.frontmatter.coverImage) : null

    return (
      <BodyClassName className="post">
        <Layout pathname={this.props.pageContext.pathname}>
          <SEO
            title={ htmlDecode(post.frontmatter.title) }
            shortTitle={ htmlDecode(post.frontmatter.shortTitle) }
            description={ htmlDecode(post.frontmatter.excerpt) }
            keywords={['Marcy Sutton', 'MarcySutton.com', 'writing', 'posts', 'blog']}
            image={coverImageSrc} />
            <div className="generic-wrap page-post-wrap">
              <section className="page-post-detail breathing-room">
                  <article>
                    <RouteTargetHeading targetID="global-nav">
                      { parse(post.frontmatter.title) }
                    </RouteTargetHeading>
                    { post.frontmatter.date ? <h2 className="subhead">{ post.frontmatter.date }</h2> : null }
                    { parse(post.html) }
                  </article>
              </section>
              <aside className="page-post-list-wrap">
                  <List 
                      className="list-writing-post breathing-room"
                      items={posts}
                      listName="writing"
                      subtitle="More Posts"
                      pathname={this.props.location.pathname} />
              </aside>
            </div>
        </Layout>
    </BodyClassName>
    )
  }
}

PostTemplate.propTypes = {
  data: PropTypes.object.isRequired,
  edges: PropTypes.array,
}

export default PostTemplate

export const pageQuery = graphql`
  query($id: String!) {
    markdownRemark(id: { eq: $id }) {
      id
      frontmatter {
        date(formatString: "MMMM DD, YYYY")
        title
        coverImage {
          childImageSharp {
            gatsbyImageData(layout: FIXED)
          }
        }
        shortTitle
        excerpt
      }
      html
    }
    allMarkdownRemark(
      limit: 20,
      sort: { order: DESC, fields: [frontmatter___date] },
      filter: {fileAbsolutePath: {regex: "/posts/"}}
    ) {
        edges {
          node {
            id
            frontmatter {
                title
                path
                unlisted
            }
          }
        }
    }
  }
`