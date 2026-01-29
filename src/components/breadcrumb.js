import React from 'react'
import { Link } from 'gatsby'

const Breadcrumb = ({ section, url }) => (
  <Link className="breadcrumb" to={`/${url}`}>
    <span aria-hidden="true">◀</span>{' '}
    <span className="text">Back to {section}</span>
  </Link>
)

export default Breadcrumb
