import React from 'react'
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';

const IncludeRetired = ({checked, onChange, sx}) => {
  return (
    <FormControlLabel
      sx={{margin: '8px 0', ...sx}}
      size='small'
      control={<Switch size='small' checked={checked} onChange={() => onChange(!checked)} color='error' />}
      label="Include Retired"
    />
  )
}

export default IncludeRetired
