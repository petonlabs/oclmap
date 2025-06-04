import React from 'react'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import forEach from 'lodash/forEach'
import map from 'lodash/map'
import orderBy from 'lodash/orderBy'

const Mappings = item => {
  let same_as_mappings = []
  let other_mappings = {}
  forEach((item.mappings || []), mapping => {
    let mapType = mapping.map_type
    mapType = mapType.replace('_', '').replace('-', '').replace(' ', '').toLowerCase()
    if(mapType === 'sameas')
      same_as_mappings.push(mapping)
    else {
      other_mappings[mapType] = other_mappings[mapType] || []
      other_mappings[mapType].push(mapping)
    }
  })
  same_as_mappings = orderBy(same_as_mappings, ['cascade_target_source_name', 'to_concept_code', 'cascade_target_concept_name'])
  other_mappings = orderBy(other_mappings, ['map_type', 'cascade_target_source_name', 'to_concept_code', 'cascade_target_concept_name'])
  return (
    <List dense sx={{p: 0, listStyleType: 'disc'}}>
      {
        same_as_mappings.length > 1 &&
          <>
            {
              map(same_as_mappings, (mapping, i) => (
                <ListItem disablePadding key={i} sx={{display: 'list-item'}}>
                  <ListItemText
                    primary={
                      <>
                        <Typography component='span' sx={{fontSize: '12px', color: 'rgba(0, 0, 0, 0.7)'}}>
                          {`${mapping.cascade_target_source_name}:${mapping.to_concept_code}`}
                        </Typography>
                        <Typography component='span' sx={{fontSize: '13px', marginLeft: '4px'}}>
                          {mapping.cascade_target_concept_name}
                        </Typography>
                      </>
                    }
                    sx={{
                      marginTop: '2px',
                      marginBottom: '2px',
                    }}
                  />
                </ListItem>
              ))
            }
          </>
      }
      {
        map(other_mappings, (mappings, mapType) => (
          <React.Fragment key={mapType}>
            {
              map(mappings, (mapping, i) => (
                <ListItem disablePadding key={i} sx={{display: 'list-item'}}>
                  <ListItemText
                    primary={
                      <>
                        <Typography component='span' sx={{fontSize: '12px', color: 'rgba(0, 0, 0, 0.7)'}}>
                          {`${mapping.cascade_target_source_name}:${mapping.to_concept_code}`}
                        </Typography>
                        <Typography component='span' sx={{fontSize: '13px', marginLeft: '4px'}}>
                          {mapping.cascade_target_concept_name}
                        </Typography>
                      </>
                    }
                    sx={{
                      marginTop: '2px',
                      marginBottom: '2px',
                    }}
                  />
                </ListItem>
              ))
            }
          </React.Fragment>
        ))
      }
    </List>
  )
}

export default Mappings
