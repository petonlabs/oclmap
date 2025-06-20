import React from 'react'
import Typography from '@mui/material/Typography'
import ListItemText from '@mui/material/ListItemText'
import has from 'lodash/has'
import MapButton from './MapButton'
import { URIToParentParams } from '../../common/utils'
import Score from './Score'

const MappingDecisionResult = ({targetConcept, row, rowIndex, mapTypes, allMapTypes, onMap}) => {
  const parentParams = targetConcept?.url ? URIToParentParams(targetConcept.url) : {}
  const hasClass = has(row, 'Class') || has(row, 'Concept Class')
  const hasDatatype = has(row, 'Datatype') || has(row, 'datatype')
  return (
    <div className='col-xs-12 padding-0' style={{display: 'flex', margin: '8px 0', justifyContent: 'space-between'}}>
      <div style={{maxWidth: '45%'}}>
        <Typography component='span' sx={{color: 'rgba(0, 0, 0, 0.6)', fontSize: '12px'}}>Source Code</Typography>
        <div className='col-xs-12 padding-0'>
          <ListItemText
            primary={row?.Name || row?.name || '-'}
            secondary={
              <span style={{fontSize: '12px'}}>
                {
                hasClass &&
                    <>Class: <i>{row.Class || row['Concept Class']}</i>,</>
                }
                {
                  hasDatatype &&
                    <>Datatype: <i>{row.Datatype}</i></>
                }
              </span>
            }
            sx={{marginTop: 0, '.MuiListItemText-secondary': {marginTop: '-4px'}}}
          />
        </div>
      </div>
      {
        targetConcept?.url &&
          <>
            <div style={{marginLeft: '8px'}}>
              <Typography component='div' sx={{color: 'rgba(0, 0, 0, 0.6)', fontSize: '12px'}}>Relationship</Typography>
              <MapButton options={allMapTypes} selected={mapTypes[rowIndex]} onClick={(event, applied, mapType) => onMap(event, targetConcept, !applied, mapType)} isMapped sx={{marginTop: '6px'}} mapOnly />
            </div>
            <div style={{marginLeft: '24px', maxWidth: '45%'}}>
              <Typography component='span' sx={{color: 'rgba(0, 0, 0, 0.6)', fontSize: '12px'}}>Target Code</Typography>
              <div className='col-xs-12 padding-0'>
                <ListItemText
                  className='searchable'
                  primary={`${parentParams.repo}:${targetConcept.id} ${targetConcept.display_name || ''}`}
                  secondary={
                    <span className='searchable' style={{fontSize: '12px'}}>
                      Class: <i>{targetConcept.concept_class}</i>,
                      Datatype: <i>{targetConcept.datatype}</i>
                    </span>
                  }
                  sx={{marginTop: 0, '.MuiListItemText-secondary': {marginTop: '-4px'}}}
                />
                <Score concept={targetConcept} />
              </div>
            </div>
          </>
      }
    </div>

  )
}

export default MappingDecisionResult;
