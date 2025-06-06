import React from 'react'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import FormHelperText from '@mui/material/FormHelperText'
import Button from '@mui/material/Button'
import Menu from '@mui/material/Menu';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton'

import { styled } from '@mui/material/styles';

import JoinRightIcon from '@mui/icons-material/JoinRight';
import UploadIcon from '@mui/icons-material/Upload';
import DownIcon from '@mui/icons-material/ArrowDropDown';
import MatchingIcon from '@mui/icons-material/DeviceHub';
import SettingsIcon from '@mui/icons-material/Settings';
import SaveIcon from '@mui/icons-material/Save';

import NamespaceDropdown from '../common/NamespaceDropdown'
import RepoSearchAutocomplete from '../repos/RepoSearchAutocomplete'
import RepoVersionSearchAutocomplete from '../repos/RepoVersionSearchAutocomplete'
import CloseIconButton from '../common/CloseIconButton';
import ColumnMapTable from './ColumnMapTable'

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});


const ConfigurationForm = ({ project, handleFileUpload, file, owner, setOwner, name, setName, description, setDescription, repo, onRepoChange, repoVersion, setRepoVersion, versions, algo, onAlgoSelect, sx, algos, validColumns, columns, isValidColumnValue, updateColumn, configure, setConfigure, columnVisibilityModel, setColumnVisibilityModel, onSave }) => {
  const [algoMenuAnchorEl, setAlgoMenuAnchorEl] = React.useState(null)

  const onAlgoButtonClick = event => setAlgoMenuAnchorEl(algoMenuAnchorEl ? null : event.currentTarget)
  const onAlgoChange = id => {
    setAlgoMenuAnchorEl(null)
    onAlgoSelect(id)
  }
  return (
    <div className='col-xs-12' style={{padding: '8px 0', ...sx}}>
      <div className='col-xs-12 padding-0' style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px'}}>
        <Typography component='span' sx={{fontSize: '22px', color: 'surface.dark', fontWeight: 600, display: 'flex', alignItems: 'center'}}>
          Configure Mapping Project
          <IconButton sx={{marginLeft: '8px'}} color={configure ? 'primary' : 'secondary'} onClick={() => file?.name ? setConfigure(!configure) : null}>
            <SettingsIcon fontSize='inherit' />
          </IconButton>
        </Typography>
        {
          file?.name &&
            <CloseIconButton color='secondary' onClick={() => setConfigure(false)} />
        }
        </div>
      <Typography component="div" sx={{fontSize: '16px', fontWeight: 'bold', marginTop: '45px'}}>
        Project Ownership and Name
      </Typography>
      <NamespaceDropdown
        required
        id='owner'
        owner={owner}
        label='Project Owner'
        size='small'
        onChange={(event, item) => setOwner(item?.url || '')}
        asOwner
        sx={{marginTop: '12px'}}
      />
      <TextField
        required
        fullWidth
        sx={{marginTop: '12px'}}
        label='Name'
        value={name}
        onChange={event => setName(event.target.value || '')}
      />
      <TextField
        fullWidth
        sx={{marginTop: '12px'}}
        label='Description'
        value={description}
        onChange={event => setDescription(event.target.value || '')}
        multiline
        rows={3}
      />

      <Typography component="div" sx={{fontSize: '16px', fontWeight: 'bold', marginTop: '20px'}}>
        Input Data
      </Typography>
      <FormHelperText sx={{marginTop: 0}}>
        Upload a spreadsheet (.csv, .xls, .xlsx) that contains the input data to be mapped.
      </FormHelperText>

      <Button
        component="label"
        role={undefined}
        variant="outlined"
        tabIndex={-1}
        sx={{textTransform: 'none', marginTop: '12px', width: '100%'}}
        startIcon={<JoinRightIcon />}
        endIcon={<UploadIcon />}
        disabled={Boolean(project?.id && project.input_file_name)}
      >
        {
          file?.name ? file.name : "Upload file"
        }
        <VisuallyHiddenInput
          type="file"
          accept=".xlsx, .xls, .csv"
          onChange={handleFileUpload}
        />
      </Button>

      <Typography component="div" sx={{fontSize: '16px', fontWeight: 'bold', marginTop: '20px'}}>
        Target Repository
      </Typography>
      <FormHelperText sx={{marginTop: 0}}>
        Select the repository that you want to map your input data to.
      </FormHelperText>

      <RepoSearchAutocomplete label='Repository' size='small' onChange={(id, item) => onRepoChange(item)} value={repo}  sx={{marginTop: '12px'}}/>
      <RepoVersionSearchAutocomplete versions={versions} label='Version' size='small' onChange={(id, item) => setRepoVersion(item)} value={repoVersion} sx={{marginTop: '12px'}} />

      <Typography component="div" sx={{fontSize: '16px', fontWeight: 'bold', marginTop: '20px'}}>
        Matching Algorithm
      </Typography>
      <FormHelperText sx={{marginTop: 0}}>
        Select a matching algorithm. Learn more
      </FormHelperText>
      <Button
        component="label"
        role={undefined}
        variant="outlined"
        tabIndex={-1}
        sx={{textTransform: 'none', margin: '0 0 10px 0', padding: '6.5px 15px', width: '100%', marginTop: '12px'}}
        startIcon={<MatchingIcon />}
        endIcon={<DownIcon />}
        onClick={onAlgoButtonClick}
      >
        {algos.find(_algo => _algo.id === algo).label}
      </Button>
      <Menu
        id="matching-algo"
        anchorEl={algoMenuAnchorEl}
        open={Boolean(algoMenuAnchorEl)}
        onClose={onAlgoButtonClick}
        MenuListProps={{
          'aria-labelledby': 'matching-algo',
          role: 'listbox',
        }}
      >
        {algos.map(_algo => (
          <ListItemButton
            key={_algo.id}
            disabled={_algo.disabled}
            selected={_algo.id === algo}
            onClick={() => onAlgoChange(_algo.id)}
          >
            <ListItemText primary={_algo.label} secondary={_algo.description} />
          </ListItemButton>
        ))}
      </Menu>

      {
        file?.name &&
          <>
            <Typography component="div" sx={{fontSize: '16px', fontWeight: 'bold', marginTop: '20px'}}>
              Field Configuration
            </Typography>
            <FormHelperText sx={{marginTop: 0}}>
              Associate fields in the input data to fields that the matching algorithms are able to understand. Assign input fields that contain concept codes or mappings to specific repositories. Learn more
            </FormHelperText>
            <ColumnMapTable
              sx={{marginTop: '12px'}}
              validColumns={validColumns}
              columns={columns}
              isValid={isValidColumnValue}
              onUpdate={updateColumn}
              columnVisibilityModel={columnVisibilityModel}
              setColumnVisibilityModel={setColumnVisibilityModel}
            />
          </>
      }
      <div className='col-xs-12 padding-0' style={{textAlign: 'right'}}>
      <Button
        variant='contained'
        color='primary'
        size='small'
        sx={{textTransform: 'none', margin: '20px 5px 5px 0px'}}
        startIcon={<SaveIcon />}
        onClick={onSave}
        disabled={!name || !file?.name || !owner}
      >
        Save & Close
      </Button>
        </div>
    </div>
  )
}

export default ConfigurationForm;
