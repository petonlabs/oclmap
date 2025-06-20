import React from 'react'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

const ReviewNote = ({value, onChange}) => {
  return (
    <div className='col-xs-12 padding-0' style={{display: 'flex', margin: '8px 0', alignItems: 'center'}}>
      <Typography component='span' sx={{color: 'surface.dark', fontWeight: 600, marginRight: '24px', fontSize: '14px', width: '55px'}}>
        Review
      </Typography>
      <div style={{display: 'flex', alignItems: 'center', width: 'calc(100% - 80px)'}}>
        <TextField
          fullWidth
          multiline
          maxRows={4}
          value={value || ''}
          onChange={onChange}
          sx={{
            '.MuiInputBase-root': {
              fontSize: '14px',
              padding: '4px 8px',
              '.MuiInputBase-inputMultiline': {
                height: '20px'
              }
            }
          }}
        />
      </div>
    </div>
  )
}

export default ReviewNote;
