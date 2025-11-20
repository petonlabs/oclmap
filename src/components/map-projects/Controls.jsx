import React from 'react'
import moment from 'moment'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import DownloadIcon from '@mui/icons-material/Download';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTranslation } from 'react-i18next';

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

const Controls = ({project, onDownload, onSave, onDelete, owner, file, isSaving}) => {
  const { t } = useTranslation();
  const lastSavedText = project?.updated_at ? moment(project.updated_at).fromNow() : false
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
    </span>

  )
}

export default Controls
