import React from 'react'
import moment from 'moment'
import { useTranslation } from 'react-i18next';
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'
import CircularProgress from '@mui/material/CircularProgress'
import DownloadIcon from '@mui/icons-material/Download';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import { copyToClipboard } from '../../common/utils'
import RepoIcon from '../repos/RepoIcon'

const IkonButton = ({title, icon, onClick, color, disabled}) => {
  return (
    <Tooltip title={title}>
      <span>
        <IconButton
          color={color}
          size='small'
          sx={{textTransform: 'none', margin: '2px 5px'}}
          onClick={onClick}
          disabled={disabled}
        >
          {icon}
        </IconButton>
      </span>
    </Tooltip>
  )
}

const Controls = ({project, onDownload, onSave, onDelete, owner, file, isSaving, onImport, importResponse, onDownloadImportReport}) => {
  const { t } = useTranslation();
  const lastSavedText = project?.updated_at ? moment(project.updated_at).fromNow() : false
  const isRunningImport = ['STARTED', 'RECEIVED', 'PENDING'].includes(importResponse?.state)
  return (
    <span style={{textAlign: 'right'}}>
      <div>
        <IkonButton
          color='primary'
          onClick={onSave}
          title={t('map_project.save_this_project')}
          disabled={!owner || !file?.name || isSaving}
          icon={<SaveIcon />}
        />
        <IkonButton
          color='secondary'
          onClick={onDownload}
          title={t('map_project.download_this_project_as_csv')}
          icon={<DownloadIcon />}
        />
        {
        onImport &&
            <IkonButton
              color='secondary'
              onClick={onImport}
              disabled={isRunningImport}
              title={t('map_project.save_this_project_to_collection')}
              icon={isRunningImport ? <CircularProgress size={20} /> : <RepoIcon noTooltip selected />}
            />
        }
        {
          project?.id &&
            <IkonButton
              color='error'
              disabled={isSaving}
              onClick={onDelete}
              title={t('map_project.delete_this_project')}
              icon={<DeleteIcon />}
            />
        }
      </div>
      {
        (lastSavedText || isSaving) &&
          <div style={{fontSize: '11px', color: 'rgba(0, 0, 0, 0.6)', textAlign: 'right', marginTop: '-4px'}}>
            {
              isSaving ? t('map_project.saving') :
                t('map_project.last_saved', {time: lastSavedText})
            }
          </div>
      }
      {
        (importResponse?.state) &&
          <div style={{fontSize: '11px', color: 'rgba(0, 0, 0, 0.6)', textAlign: 'right', marginTop: '2px'}}>
            {`Import (${importResponse.state.toLowerCase()})`}:
            <Tooltip title={importResponse.id}>
              <span onClick={() => copyToClipboard(importResponse.id)}>{`${importResponse.id.slice(0,8)}..${importResponse.id.slice(importResponse.id.length - 4, importResponse.id.length)}`}</span>
            </Tooltip>
            {
              importResponse?.state === 'SUCCESS' ?
                <Tooltip title={t('map_project.click_to_download_import_report')}>
                  <Button size='small' variant='text' sx={{textTransform: 'none', fontSize: '11px', minWidth: 'auto', '.MuiButton-endIcon': {marginLeft: '2px', marginRight: 0}}} onClick={() => onDownloadImportReport(importResponse.id)} endIcon={<DownloadIcon sx={{fontSize: '12px !important'}} />}>
                    {t('common.report')}
                  </Button>
                </Tooltip> :
              <>
                <br/>
                {importResponse?.message}
              </>
            }
          </div>
      }
    </span>

  )
}

export default Controls
