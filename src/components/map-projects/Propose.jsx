import React from 'react'
import times from 'lodash/times'
import get from 'lodash/get'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

const Propose = ({onChange, proposed, onSubmit}) => {
  const [attributes, setAttributes] = React.useState(1)
  return (
    <div className='col-xs-12 padding-0' style={{margin: '12px 0'}}>
      <div className='col-xs-12 padding-0'>
        <TextField id='source' sx={{width: 'calc(50% - 12px)', margin: '4px 6px'}} label='Target Source' value={proposed?.source || ''} onChange={onChange}/>
        <TextField id='id' sx={{width: 'calc(50% - 12px)', margin: '4px 6px'}} label='Concept ID' value={proposed?.id || ''} onChange={onChange}/>
        <TextField id='name' sx={{width: 'calc(50% - 12px)', margin: '4px 6px',}} label='Name' value={proposed?.name || ''} onChange={onChange}/>
        <Typography sx={{fontWeight: 'bold', margin: '10px 10px 4px'}}>Attributes</Typography>
        {
          times(attributes, i => {
            return (
              <div className='col-xs-12 padding-0' key={i}>
                <TextField id={`attributes.${i}.name`} sx={{width: 'calc(50% - 12px)', margin: '4px 6px'}} label='Attribute Name' value={get(proposed, `attributes.${i}.name`) || ''} onChange={onChange}/>
                <TextField id={`attributes.${i}.value`} sx={{width: 'calc(50% - 12px)', margin: '4px 6px'}} label='Attribute Value' value={get(proposed, `attributes.${i}.value`) || ''} onChange={onChange}/>
              </div>
            )
          })
        }
        <Button sx={{marginLeft: '8px', textTransform: 'none'}} size='small' variant='text' onClick={() => setAttributes(attributes + 1)}>
          Add more
        </Button>
      </div>
      <div className='col-xs-12 padding-0' style={{margin: '16px 0'}}>
        <TextField
          fullWidth
          id="note"
          label="Proposal note"
          multiline
          rows={5}
          value={proposed?.note || ''}
          onChange={onChange}
        />
      </div>
      <div className='col-xs-12 padding-0' style={{margin: '16px 0', display: 'flex', alignItems: 'center'}}>
        <Button color='primary' onClick={onSubmit} variant='contained' sx={{textTransform: 'none'}}>
          Propose
        </Button>
      </div>
    </div>
  )
}

export default Propose
