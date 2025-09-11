import React from 'react'

const Property = ({code, value}) => {
  return (
    <span className='searchable' style={{marginRight: '6px'}}><i style={{marginRight: '3px'}}>{code}:</i>{value}</span>
  )
}

export default Property
