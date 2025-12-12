import React from 'react';
import { useTranslation, Trans } from 'react-i18next';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button'
import FormHelperText from '@mui/material/FormHelperText';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';

import { PRIMARY_COLORS } from '../../common/colors';
import { toV3URL } from '../../common/utils'

import RepoSearchAutocomplete from '../repos/RepoSearchAutocomplete'

const ImportToCollection = ({ onImport, onClose, open, rowStatuses }) => {
  const { t } = useTranslation()
  const [collection, setCollection] = React.useState(null)
  const [scope, setScope] = React.useState('approved')
  const approvedCount = rowStatuses.reviewed.length
  const proposedCount = rowStatuses.readyForReview.length
  let count = scope === 'all' ? proposedCount + approvedCount : approvedCount

  return (
    <Dialog
      disableEscapeKeyDown
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
      <DialogTitle sx={{padding: '12px 24px', color: 'surface.dark', fontSize: '22px', textAlign: 'left'}}>
        {t('map_project.save_to_collection')}
      </DialogTitle>
      <DialogContent sx={{paddingTop: '8px !important'}}>
        <RepoSearchAutocomplete
          label={t('repo.collection')}
          size='small'
          onChange={(id, item) => setCollection(item)}
          value={collection}
          repoType='collections'
          ownRepo
          autoFocus={!collection?.id}
        />
        <FormControl sx={{marginTop: '12px'}}>
          <RadioGroup
            aria-labelledby="import-radio-buttons-group-label"
            defaultValue="all"
            value={scope}
            name="radio-buttons-group"
            onChange={event => setScope(event.target.value)}
          >
            <FormControlLabel size='small' value='approved' control={<Radio size='small' />} label={t('map_project.approved_target_concepts_only')} />
            <FormControlLabel size='small' value='all' control={<Radio size='small' />} label={t('map_project.all_approved_and_proposed_target_concepts')} />
          </RadioGroup>
        </FormControl>
        {
        collection?.url &&
        <FormHelperText sx={{fontWeight: 'bold', fontSize: '1rem', marginTop: '8px'}}>
          <Trans
            i18nKey='map_project.concepts_will_be_added_to_this_collection'
            components={[
              <a key={collection?.name} className='no-anchor-styles' style={{color: PRIMARY_COLORS.main}} target='_blank' href={toV3URL(collection?.url)} rel="noreferrer">{collection?.name}</a>
            ]}
            values={{
              count: count.toLocaleString(),
              collectionName: collection?.name
            }}
          />
        </FormHelperText>
        }
        </DialogContent>
      <DialogActions sx={{padding: '16px'}}>
        <Button
          color='default'
          variant='contained'
          size='small'
          sx={{textTransform: 'none'}}
          onClick={onClose}
        >
          {t('common.close')}
        </Button>
        <Button
          variant='contained'
          size='small'
          sx={{textTransform: 'none', marginLeft: '12px'}}
          disabled={!collection?.url || !count}
          onClick={() => onImport(collection, scope)}
        >
          {t('common.save')}
        </Button>
        </DialogActions>
    </Dialog>
  )
}

export default ImportToCollection
