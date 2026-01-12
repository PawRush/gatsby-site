import React, { Component } from "react"
import { graphql } from "gatsby"
import ReactHtmlParser from 'react-html-parser'
import BodyClassName from 'react-body-classname'
import PropTypes from "prop-types"
import { getSrc } from "gatsby-plugin-image"

import RouteTargetHeading from "../components/route-target-heading"
import SEO from '../components/seo'
import Layout from '../components/layout'

class FeatureTemplate extends Component {
  render() {
    const page = this.props.data.markdownRemark
    const coverImageSrc = page.frontmatter.coverImage ? getSrc(page.frontmatter.coverImage) : null

    return (
      <BodyClassName className="page">
        <Layout pathname={this.props.location.pathname}>
          <SEO title={ page.frontmatter.title } keywords={['Marcy Sutton', 'MarcySutton.com', 'writing', 'pages', 'blog']}
            image={coverImageSrc} />
          <section className="generic-wrap page-post-detail">
            <article>
                <RouteTargetHeading targetID="global-nav">
                  { ReactHtmlParser(page.frontmatter.title) }
                </RouteTargetHeading>
                { ReactHtmlParser(page.html) }
            </article>
          </section>
        </Layout>
      </BodyClassName>
    )
  }
}


FeatureTemplate.propTypes = {
  data: PropTypes.object.isRequired,
  edges: PropTypes.array,
}

export default FeatureTemplate

export const pageQuery = graphql`
  query($id: String!) {
    markdownRemark(id: { eq: $id }) {
      id
      frontmatter {
        title
        coverImage {
          childImageSharp {
            gatsbyImageData(layout: FIXED)
          }
        }
      }
      excerpt
      html
    }
  }
`
