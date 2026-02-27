import React from 'react'
import moment from 'moment'
import { useTranslation } from 'react-i18next';
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'
import Skeleton from '@mui/material/Skeleton'
import CloseIcon from '@mui/icons-material/Close'
import DataObjectIcon from '@mui/icons-material/DataObject';

import get from 'lodash/get'


const AICandidatesAnalysis = ({ analysis, onClose, sx, isCoreUser }) => {
  const { t } = useTranslation();
  const [openDetails, setOpenDetails] = React.useState(false)
  let output = analysis?.output || analysis

  const getModelName = () => {
    let model = analysis?.model || 'AI Model'
    let user = analysis?.user || ''
    let timestamp = analysis?.timestamp ? moment(analysis.timestamp).fromNow() : ''
    return model + (user ? ` (${analysis?.user} - ${timestamp})` : '')
  }

  const getRecommendationTitle = () => {
    let recommendation = output?.recommendation
    if(recommendation && output?.primary_candidate?.match_strength){
      recommendation += ` (${output.primary_candidate.match_strength})`
    }
    return recommendation
  }

  return (
    <>
    <Card variant='outlined' sx={sx}>
      <CardContent sx={{padding: '4px !important'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '-4px'}}>
    <Typography gutterBottom sx={{ color: 'text.secondary', fontSize: 13, mb: 0 }} component='span'>
    {t('map_project.ocl_ai_candidates_analysis')}
    </Typography>
    <IconButton onClick={onClose} size='small' color='secondary' sx={{padding: '4px'}}>
      <CloseIcon sx={{fontSize: '1rem'}} />
    </IconButton>
    </div>
    {
      analysis === undefined ?
        <Skeleton height={75} sx={{'-webkit-transform': 'none', 'transform': 'none'}} /> :
      <>
      <Typography gutterBottom component='p' sx={{mb: 0, fontSize: 12, marginTop: '-2px'}}>
      {
        get(output, 'recommendation') &&
          <span style={{fontWeight: 'bold', marginRight: '8px'}}>{getRecommendationTitle()}:</span>
      }
      {get(output, 'rationale.narrative') || get(output, 'rationale')}
      </Typography>
        <Typography gutterBottom sx={{ color: 'text.secondary', fontSize: 13, mb: 0, textAlign: 'right' }}>
          {getModelName()}
          {
            isCoreUser &&
              <Tooltip title={t('map_project.view_raw_json')} placement='right'>
                <span>
                  <IconButton color='primary' size='small' disabled={!analysis} sx={{padding: '4px', marginLeft: '4px', marginTop: '-2px'}} onClick={() => setOpenDetails(!openDetails)}>
                    <DataObjectIcon fontSize='inherit' />
                  </IconButton>
                </span>
              </Tooltip>
          }
      </Typography>

          </>
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
        {t('map_project.ocl_ai_candidates_analysis')}
        </DialogTitle>
        <DialogContent>
          <pre style={{fontSize: '12px', whiteSpace: 'pre-wrap', wordWrap: 'break-word'}}>
            {JSON.stringify(analysis, undefined, 2)}
          </pre>
        </DialogContent>
      <DialogActions sx={{p: 3}}>
        <Button onClick={() => setOpenDetails(false)}>{t('common.close')}</Button>
      </DialogActions>

      </Dialog>

    </>
  )
}

export default AICandidatesAnalysis
