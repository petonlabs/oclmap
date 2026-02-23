import React from 'react'
import { useTranslation } from 'react-i18next'

import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import FormHelperText from '@mui/material/FormHelperText';
import Button from '@mui/material/Button';
import DoubleArrowIcon from '@mui/icons-material/DoubleArrow';

import CloseIconButton from '../common/CloseIconButton'
import AIAssistantButton from './AIAssistantButton'


const AutoMatchDialog = ({open, onClose, autoMatchUnmappedOnly, setAutoMatchUnmappedOnly, rowStatuses, autoRunAIAnalysis, setAutoRunAIAnalysis, AIModels, AIModel, setAIModel, repo, onSubmit, inAIAssistantGroup}) => {
  const { t } = useTranslation()

  const getHelperTextForAutoMatchUnmapped = () => {
    if (autoMatchUnmappedOnly) {
      const count = rowStatuses.readyForReview.length;
      if (count > 0) {
        return t('map_project.auto_match_unmapped_only_note', {count: count.toLocaleString()});
      }
      return t('map_project.auto_match_unmapped_only_note_no_count');
    }
    const approvedCount = rowStatuses.reviewed.length;
    const proposedCount = rowStatuses.readyForReview.length;
    if (approvedCount > 0 && proposedCount > 0) {
      return t('map_project.auto_match_note', {
        approvedCount: approvedCount.toLocaleString(),
        proposedCount: proposedCount.toLocaleString()
      });
    }
    return t('map_project.auto_match_note_no_counts');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      scroll='paper'
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: '28px',
          minWidth: '312px',
          minHeight: '262px',
          padding: 0
        }
      }}
    >
      <DialogTitle sx={{padding: '12px 24px', color: 'surface.dark', fontSize: '22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <span>{t('map_project.auto_match')}</span>
        <CloseIconButton onClick={onClose} />
      </DialogTitle>
      <DialogContent sx={{paddingTop: '12px !important'}}>
        <FormControlLabel sx={{marginTop: '12px', width: '100%'}} control={<Checkbox checked={autoMatchUnmappedOnly} onChange={event => setAutoMatchUnmappedOnly(event.target.checked)} />} label={t('map_project.unmapped_only')} />
        <FormHelperText sx={{marginTop: '-4px'}}>
          {
            getHelperTextForAutoMatchUnmapped()
          }
        </FormHelperText>
        {
          inAIAssistantGroup &&
            <>
              <FormControlLabel
                sx={{marginTop: '0px', width: '100%'}}
                control={
                  <Checkbox
                    checked={autoRunAIAnalysis}
                    onChange={event => setAutoRunAIAnalysis(event.target.checked)}
                  />
                }
                label={
                  <span style={{display: 'flex', alignItems: 'center'}}>
                    <span>{t('map_project.run_ai_analysis')}</span>
                    <AIAssistantButton
                      models={AIModels}
                      selected={AIModel}
                      onClick={() => {}}
                      sx={{margin: '0 16px'}}
                      onModelChange={setAIModel}
                      popperProps={{
                        sx: {zIndex: 1500}
                      }}
                      disabled={!autoRunAIAnalysis}
                    />
                  </span>
                }
              />
              <FormHelperText sx={{marginTop: '-4px'}}>
                {t('map_project.run_ai_analysis_note')}
              </FormHelperText>
            </>
        }
      </DialogContent>
      <DialogActions sx={{padding: '16px'}}>
        <Button
          variant='contained'
          size='small'
          sx={{textTransform: 'none', marginLeft: '12px'}}
          endIcon={<DoubleArrowIcon />}
          disabled={!repo?.url}
          onClick={onSubmit}
        >
          {t('common.submit')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AutoMatchDialog
