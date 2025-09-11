import React from 'react'
import Property from '../concepts/Property'

import startCase from 'lodash/startCase'
import find from 'lodash/find'
import keys from 'lodash/keys'
import get from 'lodash/get'
import map from 'lodash/map'
import without from 'lodash/without'


const ConceptSummaryProperties = ({concept, repoVersion}) => {
  const getProperties = () => {
    const summaryProperties = repoVersion?.meta?.display?.concept_summary_properties || []
    if(summaryProperties?.length > 0) {
      let values = []
      summaryProperties.forEach(code => {
        let label = code
        let value;
        if(['concept_class', 'datatype'].includes(code))
          label = startCase(code)
        let property = find(concept?.property, {code: code})
        if(property){
          value = get(property, get(without(keys(property), 'code'), '0'))
          values.push(<Property key={label} code={label} value={value} />)
        }
      })
      return values
    }
    return [
      <Property key={1} code='Concept Class' value={concept.concept_class} />,
      <Property key={2} code='Datatype' value={concept.datatype} />,
    ]
  }

  return (
    <>
      {map(getProperties(), prop => prop)}
    </>
  )
}

export default ConceptSummaryProperties
