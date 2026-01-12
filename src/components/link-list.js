import PropTypes from 'prop-types'
import React from 'react'
import parse from 'html-react-parser'

import MoreLink from './more-link'

const LinkList = ({ className, listName, subtitle, items, allItems = false, linkNewWindow = false }) => (
    <div className={`list ${className}`}>
        <h2 className="subhead">{subtitle}</h2>
        <ul>{ items.map((items) => {
            return <li key={ items.node.id }>
                <a className="item"
                    target={ linkNewWindow ? '_blank' : null }
                    rel={ linkNewWindow ? 'noopener noreferrer' : null }
                    href={ items.node.link }>
                  { parse(items.node.name) }
                </a>
            </li>
            }) 
        }</ul>
        { allItems ? null : <MoreLink itemLabel={listName} /> }
    </div>
)

LinkList.propTypes = {
  items: PropTypes.array,
  listName: PropTypes.string,
}

LinkList.defaultProps = {
  items: [],
  listName: '',
}

export default LinkList
