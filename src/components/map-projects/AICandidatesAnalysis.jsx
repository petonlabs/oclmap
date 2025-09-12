import React from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import Button from '@mui/material/Button'
import Skeleton from '@mui/material/Skeleton'
import CloseIcon from '@mui/icons-material/Close'

import get from 'lodash/get'


const AICandidatesAnalysis = ({ analysis, onClose, sx }) => {
  const [openDetails, setOpenDetails] = React.useState(false)

  return (
    <>
    <Card variant='outlined' sx={sx}>
      <CardContent sx={{padding: '8px !important'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '-6px'}}>
          <Typography gutterBottom sx={{ color: 'text.secondary', fontSize: 13, mb: 0 }} component='span'>
            AI Candidates Analysis
            <span>
              <Button disabled={!Boolean(analysis)} variant='text' sx={{textTransform: 'none', fontSize: '12px', padding: 0, marginLeft: '16px', marginTop: '-2px'}} onClick={() => setOpenDetails(!openDetails)}>
                View raw
              </Button>
            </span>
          </Typography>
          <IconButton onClick={onClose} size='small' color='secondary'>
            <CloseIcon fontSize='small' />
          </IconButton>
        </div>
        {
          analysis === undefined ?
            <Skeleton height={75} sx={{'-webkit-transform': 'none', 'transform': 'none'}} /> :
          <Typography gutterBottom component='p' sx={{mb: 0, fontSize: 12, marginTop: '-2px'}}>
            {get(analysis, 'choices.0.message.content.rationale.narrative')}
          </Typography>
        }
      </CardContent>
    </Card>
    <Dialog
    open={openDetails}
    onClose={() => setOpenDetails(false)}
    scroll='paper'
    sx={{
      '& .MuiDialog-paper': {
        backgroundColor: 'surface.n92',
        borderRadius: '28px',
        minWidth: '312px',
        minHeight: '262px',
        padding: 0
      }
    }}
    >

      <DialogTitle sx={{p: 3, color: 'surface.dark', fontSize: '22px', textAlign: 'left'}}>
          AI Candidate Analysis
        </DialogTitle>
        <DialogContent>
          <pre style={{fontSize: '12px', whiteSpace: 'pre-wrap', wordWrap: 'break-word'}}>
            {JSON.stringify(analysis, undefined, 2)}
          </pre>
        </DialogContent>
      <DialogActions sx={{p: 3}}>
        <Button onClick={() => setOpenDetails(false)}>Close</Button>
      </DialogActions>

      </Dialog>

    </>
  )
}

export default AICandidatesAnalysis
