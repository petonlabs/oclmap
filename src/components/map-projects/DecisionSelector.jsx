import React from 'react'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import CheckIcon from '@mui/icons-material/CheckCircleOutlineOutlined';

const DecisionSelector = ({selected, onChange, disabledMap, disabledPropsed}) => {
  let width = '25%'
  return (
    <div className='col-xs-12 padding-0' style={{display: 'flex', margin: '8px 0', alignItems: 'center'}}>
      <Typography component='span' sx={{color: 'surface.dark', fontWeight: 600, marginRight: '24px', fontSize: '14px'}}>
        Decision
      </Typography>
      <div style={{display: 'flex', alignItems: 'center', width: 'calc(100% - 80px)'}}>
        <Chip
          sx={{margin: '0 5px', width: width}}
          label='None'
          color='secondary'
          variant={!selected || selected === 'none' ? 'contained' : 'outlined'}
          onClick={event => onChange(event, undefined)}
          icon={!selected || selected === 'none' ? <CheckIcon fontSize='small' /> : undefined}
        />
        <Chip
          sx={{margin: '0 5px', width: width}}
          label='Map'
          color='primary'
          variant={selected === 'map' ? 'contained' : 'outlined'}
          onClick={event => onChange(event, 'map')}
          icon={selected === 'map' ? <CheckIcon fontSize='small' /> : undefined}
          disabled={disabledMap}
        />
        <Chip
          sx={{margin: '0 5px', width: width}}
          label='Propose'
          color='warning'
          variant={selected === 'propose' ? 'contained' : 'outlined'}
          onClick={event => onChange(event, 'propose')}
          icon={selected === 'propose' ? <CheckIcon /> : undefined}
          disabled={disabledPropsed}
        />
        <Chip
          sx={{margin: '0 5px', width: width}}
          label='Exclude'
          color='error'
          variant={selected === 'exclude' ? 'contained' : 'outlined'}
          onClick={event => onChange(event, 'exclude')}
          icon={selected === 'exclude' ? <CheckIcon /> : undefined}
        />
      </div>
    </div>
  )
}

export default DecisionSelector
