import React from 'react'
import { useHistory } from 'react-router-dom'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Dialog from '../common/Dialog'
import DialogTitle from '../common/DialogTitle'
import APIService from '../../services/APIService'
import { OperationsContext } from '../app/LayoutContext';
import { useTranslation } from 'react-i18next';


const MapProjectDeleteConfirmDialog = ({ project, open, onClose }) => {
  const { t } = useTranslation();
  const { setAlert } = React.useContext(OperationsContext);
  const history = useHistory()
  const [value, setValue] = React.useState('')

  const onDelete = () => {
    APIService.new().overrideURL(project.url).delete().then(response => {
      if(response.status === 204) {
        onClose(true)
        history.push('/')
        setAlert({severity: 'success', message: t('map_project.successfully_deleted'), duration: 2000})
      }
    })
  }

  return (
    <Dialog open={open} onClose={() => onClose()}>
      <DialogTitle onClose={() => onClose()}>
        {t('map_project.delete_map_project')} - {project.name}
      </DialogTitle>
      <DialogContent sx={{paddingTop: '20px !important'}}>
        {t('map_project.delete_map_project_warning')}
        <br/>
        <br/>
        {t('map_project.delete_map_project_confirm', {name: project.name})}
        <br/>
        <br/>
        {t('map_project.delete_map_project_type_to_confirm', {name: project.name})}
        <br/>
        <br/>

        <TextField
          fullWidth
          id='project-delete'
          value={value}
          onChange={event => setValue(event.target.value || '')}
        />
      </DialogContent>
      <DialogActions>
        <Button sx={{textTransform: 'none'}} variant='contained' color='error' disabled={value !== project.name} onClick={onDelete}>
          {t('common.delete')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default MapProjectDeleteConfirmDialog
