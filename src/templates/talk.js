import React, { Component } from "react"
import { graphql } from "gatsby"
import parse from 'html-react-parser'
import BodyClassName from 'react-body-classname'
import PropTypes from "prop-types"
import { decode as htmlDecode } from 'html-entities'
import { getSrc } from "gatsby-plugin-image"

import RouteTargetHeading from "../components/route-target-heading"
import SEO from '../components/seo'
import Layout from '../components/layout'
import Breadcrumb from '../components/breadcrumb'
import Video from '../components/video'

class TalkPageTemplate extends Component {
  render() {
    const talk = this.props.data.markdownRemark
    const posterSrc = getSrc(talk.frontmatter.posterImg)
    return (
      <BodyClassName className="page">
        <Layout pathname={this.props.location.pathname}>
          <SEO title={ htmlDecode(talk.frontmatter.title) }
            player={talk.frontmatter.videoSrcURL}
            image={posterSrc}
            keywords={['Marcy Sutton', 'MarcySutton.com', 'talks', 'blog']} />
          <section className="generic-wrap page-wrap breathing-room">
            <article>
              <RouteTargetHeading targetID="global-nav">
                { parse(talk.frontmatter.title) }
              </RouteTargetHeading>
              <Video videoSrcURL={talk.frontmatter.videoSrcURL} videoTitle={talk.frontmatter.title} />

              { parse(talk.html) }

              <footer aria-label="Breadcrumb">
                <Breadcrumb url="talks" section="talks" />
              </footer>
            </article>
          </section>
        </Layout>
      </BodyClassName>
    )
  }
}

TalkPageTemplate.propTypes = {
  data: PropTypes.object.isRequired,
  edges: PropTypes.array,
}

export default TalkPageTemplate

export const pageQuery = graphql`
  query($id: String!) {
    markdownRemark(id: { eq: $id }) {
      id
      frontmatter {
        title
        path
        videoSrcURL
        videoTitle
        posterImg {
          childImageSharp {
            gatsbyImageData(width: 480, layout: CONSTRAINED)
          }
      }
      }
      html
    }
  }
`