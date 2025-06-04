import React from 'react'
import Typography from '@mui/material/Typography'
import ListItemText from '@mui/material/ListItemText'
import MapButton from './MapButton'
import { URIToParentParams } from '../../common/utils'

const MappingDecisionResult = ({targetConcept, row, rowIndex, mapTypes, allMapTypes, onMap}) => {
  const parentParams = targetConcept?.url ? URIToParentParams(targetConcept.url) : {}
  return (
    <div className='col-xs-12 padding-0' style={{display: 'flex', margin: '8px 0'}}>
        <Typography component='div' sx={{display: 'inline-block', color: 'surface.dark', fontWeight: 600, marginRight: '24px', fontSize: '14px'}}>Mapping</Typography>
      <div>
        <Typography component='span' sx={{color: 'rgba(0, 0, 0, 0.6)', fontSize: '12px'}}>Source Code</Typography>
        <div className='col-xs-12 padding-0'>
          <ListItemText
            primary={row?.Name || row?.name}
            secondary={
              <span style={{fontSize: '12px'}}>
                Class: <i>{row.Class || row['Concept Class']}</i>,
                Datatype: <i>{row.Datatype}</i>
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
              <MapButton options={allMapTypes} selected={mapTypes[rowIndex]} onClick={(event, applied, mapType) => onMap(event, targetConcept, !applied, mapType)} isMapped sx={{marginTop: '6px'}} />
            </div>
            <div style={{marginLeft: '24px'}}>
              <Typography component='span' sx={{color: 'rgba(0, 0, 0, 0.6)', fontSize: '12px'}}>Target Code</Typography>
              <div className='col-xs-12 padding-0'>
                <ListItemText
                  primary={`${parentParams.repo}:${targetConcept.id} ${targetConcept.display_name || ''}`}
                  secondary={
                    <span style={{fontSize: '12px'}}>
                      Class: <i>{targetConcept.concept_class}</i>,
                      Datatype: <i>{targetConcept.datatype}</i>
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
