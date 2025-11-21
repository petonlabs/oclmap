import React from 'react'
import { useTranslation } from 'react-i18next';
import Typography from '@mui/material/Typography'
import ListItemText from '@mui/material/ListItemText'
import has from 'lodash/has'
import values from 'lodash/values'
import isEmpty from 'lodash/isEmpty'
import find from 'lodash/find'
import get from 'lodash/get'
import filter from 'lodash/filter'
import keys from 'lodash/keys'
import forEach from 'lodash/forEach'
import compact from 'lodash/compact'
import { URIToParentParams } from '../../common/utils'
import Retired from '../common/Retired'
import ConceptSummaryProperties from '../concepts/ConceptSummaryProperties'
import MapButton from './MapButton'
import Score from './Score'

const MappingDecisionResult = ({targetConcept, row, rowIndex, mapTypes, allMapTypes, onMap, proposed, columns, repoVersion, onTargetClick}) => {
  const { t } = useTranslation();
  const parentParams = targetConcept?.url ? URIToParentParams(targetConcept.url) : {}
  const hasClass = has(row, 'Class') || has(row, 'Concept Class') || has(row, 'Property: Class')
  const hasDatatype = has(row, 'Datatype') || has(row, 'datatype') || has(row, 'Property: Datatype')
  const getFieldFromProposed = field => {
    return find(proposed?.attributes, attr => attr?.name?.toLowerCase()?.includes(field))?.value || ''
  }

  const getValue = field => {
    const col = find(columns, col => col?.label?.toLowerCase() == field.toLowerCase())
    return getValueFromColumn(col, field)
  }

  const getValueFromColumn = (col, field) => {
    let val
    if(col?.dataKey)
      val = row[col.dataKey]
    if(!val)
      val = get(row, field) || get(row, field.toLowerCase())
    return val
  }

  const getLeftTitle = () => {
    let title = ''
    const id = getValue('ID')
    const name = getValue('name')
    if(id)
      title = `${id}:`
    if(name)
      title += name
    return title
  }

  const getLeftMappings = () => {
    let mappedCodes = {}
    filter(columns, col => col?.label?.toLowerCase() == 'Mapping: Code'.toLowerCase()).forEach(col => {
      const key = get(keys(col.targetSource), '0') || col.dataKey
      const value = getValueFromColumn(col, '')
      if(value && key) {
        if(!mappedCodes[key])
          mappedCodes[key] = []
        mappedCodes[key].push(value)
      }
    })
    const mappings = getValue('Mapping: List')
    if(mappings) {
      mappings.split(',').forEach(combo => {
        let parts = combo.split(':')
        const value = get(parts, '1')
        const key = get(parts, '0')
        if(value && key) {
          if(!mappedCodes[key])
            mappedCodes[key] = []
          mappedCodes[key].push(value)
        }
      })
    }
    let mappedValues = []
    forEach(mappedCodes, (code, source) => {
      forEach(code, c => mappedValues.push(`${source}:${c}`))
    })

    return mappedValues.join(', ')
  }

  const getRightMappings = () => {
    const { mappings } = targetConcept
    if(mappings?.length) {
      let mappedCodes = {}
      forEach(mappings, mapping => {
        if(!mappedCodes[mapping.cascade_target_source_name])
          mappedCodes[mapping.cascade_target_source_name] = []
        mappedCodes[mapping.cascade_target_source_name].push(mapping.cascade_target_concept_code)
      })
      let mappedValues = []
      forEach(mappedCodes, (code, source) => {
        forEach(code, c => mappedValues.push(`${source}:${c}`))
      })

      return mappedValues.join(', ')
    }
  }

  const leftMappings = getLeftMappings()
  const rightMappings = getRightMappings()

  return (
    <div className='col-xs-12 padding-0' style={{display: 'flex', margin: '8px 0', justifyContent: 'space-between'}}>
      <div style={{maxWidth: '45%'}}>
        <Typography component='span' sx={{color: 'rgba(0, 0, 0, 0.6)', fontSize: '12px'}}>{t('map_project.source_code')}</Typography>
        <div className='col-xs-12 padding-0'>
          <ListItemText
            primary={getLeftTitle()}
            secondary={
              <span style={{fontSize: '12px'}}>
                {
                  hasClass &&
                    <>{t('map_project.class')}: <i>{getValue('Property: Class') || getValue('Class') || getValue('concept_class')}</i></>
                }
                {hasClass && hasDatatype && ','}
                {
                  hasDatatype &&
                    <>{t('map_project.datatype')}: <i>{getValue('Property: Datatype') || getValue('datatype')}</i></>
                }
                {
                  leftMappings &&
                    <><br/>{t('mapping.mappings')}: <i>{leftMappings}</i></>
                }
              </span>
            }
            sx={{height: '100px', overflow: 'auto', marginTop: 0, '.MuiListItemText-secondary': {marginTop: '-4px'}}}
          />
        </div>
      </div>
      {
        targetConcept?.url &&
          <>
            <div style={{marginLeft: '8px'}}>
              <Typography component='div' sx={{color: 'rgba(0, 0, 0, 0.6)', fontSize: '12px'}}>{t('mapping.relationship')}</Typography>
              <MapButton options={allMapTypes} selected={mapTypes[rowIndex]} onClick={(event, applied, mapType) => onMap(event, targetConcept, !applied, mapType)} isMapped sx={{marginTop: '6px'}} mapOnly usedMapTypes={compact(values(mapTypes))} />
            </div>
            <div style={{marginLeft: '24px', maxWidth: '45%', cursor: 'pointer'}} onClick={() => onTargetClick(targetConcept)}>
              <Typography component='span' sx={{color: 'rgba(0, 0, 0, 0.6)', fontSize: '12px'}}>{t('map_project.target_code')}</Typography>
              <div className='col-xs-12 padding-0'>
                <ListItemText
                  primary={
                    <span className='searchable'>
                      <span>
                        {`${parentParams.repo}:${targetConcept.id} ${targetConcept.display_name || ''}`}
                      </span>
                      {
                        targetConcept.retired &&
                          <Retired size='small' style={{margin: '0 12px'}} />
                      }
                    </span>
                  }
                  secondary={
                    <>
                      <div className='searchable'>
                        <span className='searchable' style={{fontSize: '12px'}}>
                          <ConceptSummaryProperties concept={targetConcept} repoVersion={repoVersion}  />
                          {
                            rightMappings &&
                              <><br/>{t('mapping.mappings')}: <i>{rightMappings}</i></>
                          }
                        </span>
                      </div>
                      <div>
                        <Score concept={targetConcept} sx={{padding: '0 4px'}} />
                      </div>
                    </>
                  }
                  sx={{height: '100px', overflow: 'auto', marginTop: 0, '.MuiListItemText-secondary': {marginTop: '-4px'}}}
                />
              </div>
            </div>
          </>
      }
      {
        !targetConcept?.url && !isEmpty(proposed) &&
          <>
            <div style={{marginLeft: '8px'}}>
              <Typography component='div' sx={{color: 'rgba(0, 0, 0, 0.6)', fontSize: '12px'}}>Relationship</Typography>
              <Typography component='div' sx={{}}>{proposed?.map_type || '-'}</Typography>
            </div>
            <div style={{marginLeft: '24px', maxWidth: '45%'}}>
              <Typography component='span' sx={{color: 'rgba(0, 0, 0, 0.6)', fontSize: '12px'}}>Target Code</Typography>
              <div className='col-xs-12 padding-0'>
                <ListItemText
                  className='searchable'
                  primary={`${proposed?.source || ''}:${proposed?.id || ''} ${proposed?.name || ''}`}
                  secondary={
                    <span className='searchable' style={{fontSize: '12px'}}>
                      {t('map_project.class')}: <i>{getFieldFromProposed('class')}</i>,
                      {t('map_project.datatype')}: <i>{getFieldFromProposed('datatype')}</i>
                    </span>
                  }
                  sx={{marginTop: 0, '.MuiListItemText-secondary': {marginTop: '-4px'}}}
                />
              </div>
            </div>
          </>
      }
    </div>

  )
}

export default MappingDecisionResult;
