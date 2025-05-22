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


const MapProjectDeleteConfirmDialog = ({ project, open, onClose }) => {
  const { setAlert } = React.useContext(OperationsContext);
  const history = useHistory()
  const [value, setValue] = React.useState('')

  const onDelete = () => {
    APIService.new().overrideURL(project.url).delete().then(response => {
      if(response.status === 204) {
        onClose(true)
        history.push('/')
        setAlert({severity: 'success', message: 'Successfully Deleted.', duration: 2000})
      }
    })
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle onClose={onClose}>
        Delete Map Project - {project.name}
      </DialogTitle>
      <DialogContent sx={{paddingTop: '20px !important'}}>
        This will delete the map project and its decisions and uploaded file.
        Are you sure want to permanently delete this map project <b>{project.name}</b>?
        <br/>
        <br/>
        Please type in <b>{project.name}</b> to confirm
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
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default MapProjectDeleteConfirmDialog
