import React from 'react'
import moment from 'moment'
import reject from 'lodash/reject'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import ListItemText from '@mui/material/ListItemText'
import AddIcon from '@mui/icons-material/Add'
import FileIcon from '@mui/icons-material/AttachFile';
import APIService from '../../services/APIService'
import { getCurrentUser } from '../../common/utils'
import OwnerIcon from '../common/OwnerIcon'
import MapProjectDeleteConfirmDialog from './MapProjectDeleteConfirmDialog';

const MapProjects = () => {
  const user = getCurrentUser()
  const [projects, setProjects] = React.useState([])
  const [deleteProject, setDeleteProject] = React.useState(null)
  const fetchProjects = () => {
    fetchUserProjects()
    fetchOrgProjects()
  }

  const fetchUserProjects = () => APIService.users(user.username).appendToUrl('map-projects/?verbose=true').get().then(handleProjectsResponse)

  const fetchOrgProjects = () => APIService.users(user.username).appendToUrl('orgs/map-projects/?verbose=true').get().then(handleProjectsResponse)

  const handleProjectsResponse = response => setProjects(prev => [...prev, ...(response?.data || [])])


  React.useEffect(() => {
    fetchProjects()
  }, [])

  const onProjectDelete = success => {
    if(success) {
      setProjects(reject(projects, {id: deleteProject.id}))
    }
    setDeleteProject(null)
  }

  const isSplitView = false
  return (
    <div className='col-xs-12 padding-0' style={{borderRadius: '10px'}}>
      <Paper component="div" className={isSplitView ? 'col-xs-6 split padding-0' : 'col-xs-12 split padding-0'} sx={{boxShadow: 'none', p: 0, backgroundColor: 'white', borderRadius: '10px', border: 'solid 0.3px', borderColor: 'surface.nv80', minHeight: 'calc(100vh - 100px) !important'}}>
        <Paper component="div" className='col-xs-12' sx={{backgroundColor: 'surface.main', boxShadow: 'none', padding: '16px', borderRadius: '10px 10px 0 0'}}>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <Typography component='span' sx={{fontSize: '28px', color: 'surface.dark', fontWeight: 600, display: 'flex', alignItems: 'center'}}>
            Mapping Projects
          </Typography>

            <Button variant='contained' color='primary' startIcon={<AddIcon />} href='#/map-projects/new' sx={{textTransform: 'none'}}>
              New Map Project
            </Button>
          </div>
        </Paper>
        <Paper component="div" className='col-xs-12' sx={{boxShadow: 'none', padding: '16px', borderRadius: '10px 10px 0 0'}}>
          <TableContainer sx={{ maxHeight: 'calc(100% - 250px)' }}>
            <Table stickyHeader sx={{ minWidth: 650 }} size='small'>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Owner</TableCell>
                  <TableCell>Project Name</TableCell>
                  <TableCell>Created By</TableCell>
                  <TableCell>Updated By</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {projects.map(project => (
                  <TableRow key={project.id}>
                    <TableCell>{project.id}</TableCell>
                    <TableCell>
                      <span style={{display: 'flex', alignItems: 'center'}}>
                      <OwnerIcon sx={{fontSize: '1rem', marginRight: '8px'}} noTooltip ownerType={project.owner_type} />
                        {project.owner}
                        </span>
                    </TableCell>
                    <TableCell>
                      <ListItemText
                        primary={project.name}
                        secondary={
                          <a href={project.file_url} rel="noreferrer noopener" target="_blank">
                            <span style={{display: 'flex', alignItems: 'center', marginLeft: '-2px'}}>
                            <FileIcon sx={{fontSize: '14px'}} />
                            {project.input_file_name}
                          </span>
                            </a>
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <ListItemText
                        primary={
                          <span style={{display: 'flex', alignItems: 'center'}}>
                            <OwnerIcon sx={{fontSize: '1rem', marginRight: '8px'}} noTooltip ownerType='user' />
                            {project.created_by}
                          </span>
                        }
                        secondary={moment(project.created_at).fromNow()}
                      />
                    </TableCell>
                    <TableCell>
                      <ListItemText
                        primary={
                          <span style={{display: 'flex', alignItems: 'center'}}>
                            <OwnerIcon sx={{fontSize: '1rem', marginRight: '8px'}} noTooltip ownerType='user' />
                            {project.updated_by}
                          </span>
                        }
                        secondary={moment(project.updated_at).fromNow()}
                      />
                    </TableCell>
                    <TableCell align='right'>
                      <span style={{display: 'flex', alignItems: 'center'}}>
                        <Button size='small' color='primary' variant='contained' sx={{textTransform: 'none'}} href={`#${project.url}`}>
                          Open
                        </Button>
                        <Button size='small' color='error' variant='text' sx={{marginLeft: '8px', textTransform: 'none'}} onClick={() => setDeleteProject(project)}>
                          Delete
                        </Button>
                        </span>
                    </TableCell>
                    </TableRow>
                ))}
              </TableBody>
            </Table>
            </TableContainer>
        </Paper>
      </Paper>
      {
        deleteProject?.id &&
          <MapProjectDeleteConfirmDialog open={Boolean(deleteProject?.id)} onClose={onProjectDelete} project={deleteProject} />
      }
    </div>
  )
}

export default MapProjects;
