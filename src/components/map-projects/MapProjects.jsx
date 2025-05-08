import React from 'react'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import AddIcon from '@mui/icons-material/Add'

const MapProjects = () => {
  const isSplitView = false
  return (
    <div className='col-xs-12 padding-0' style={{borderRadius: '10px'}}>
      <Paper component="div" className={isSplitView ? 'col-xs-6 split padding-0' : 'col-xs-12 split padding-0'} sx={{boxShadow: 'none', p: 0, backgroundColor: 'white', borderRadius: '10px', border: 'solid 0.3px', borderColor: 'surface.nv80', minHeight: 'calc(100vh - 100px) !important'}}>
        <Paper component="div" className='col-xs-12' sx={{backgroundColor: 'surface.main', boxShadow: 'none', padding: '16px', borderRadius: '10px 10px 0 0'}}>
          <Button variant='contained' color='primary' startIcon={<AddIcon />} href='#/map-projects/new' sx={{textTransform: 'none'}}>
            New Map Project
          </Button>
        </Paper>
      </Paper>
    </div>
  )
}

export default MapProjects;
