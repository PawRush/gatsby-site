import { Link } from 'gatsby'
import React from 'react'
import parse from 'html-react-parser'
import { GatsbyImage } from 'gatsby-plugin-image'

const Feature = ({ subhead, title, description, extendedDescription = '', path, image, imageAlt = '' }) => (
    <section className={`feature`}>
        <GatsbyImage image={ image } alt={ imageAlt } />
        <div className="breathing-room">
            <h2 className="subhead">{ subhead }</h2>
            <h3><Link to={ path }>{ title }</Link></h3>
            <p>{ parse(description) }</p>
            {extendedDescription.length > 0 && 
                parse(extendedDescription)
            }
        </div>
    </section>
)

export default Feature
