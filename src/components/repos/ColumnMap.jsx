import React from 'react';
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import Button from '@mui/material/Button'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import ValidIcon from '@mui/icons-material/CheckCircleOutline';
import InvalidIcon from '@mui/icons-material/CancelOutlined';
import ColumnIcon from '@mui/icons-material/ViewWeekRounded';
import find from 'lodash/find';
import map from 'lodash/map';


const HeaderAutocomplete = ({headers, ...rest}) => {
  return (
    <Autocomplete
      autoHighlight
      autoComplete
      disableClearable
      disablePortal
      freeSolo
      fullWidth
      getOptionLabel={option => option?.label ? option.label : (find(headers, {id: option})?.label || option)}
      isOptionEqualToValue={(option, value) => option?.id === value?.id || option?.id === value || option === value}
      sx={{
        minWidth: '100px',
      }}
      renderInput={(params) => <TextField margin='dense' size='small' {...params} />}
      options={headers}
      {...rest}
    />
  )
}

const ColumnMap = ({open, onClose, validColumns, columns, isValid, onUpdate}) => {
  const [random, setRandom] = React.useState(0)
  const onValChange = (position, value) => {
    onUpdate(position, value)
    setRandom(random + 1)
  }
  return (
    <Dialog disableEscapeKeyDown maxWidth='sm' fullWidth open={open} onClose={onClose}>
      <DialogTitle>
        <span style={{display: 'flex', alignItems: 'center'}}>
          <ColumnIcon sx={{marginRight: '10px'}} />
          Assign Columns
          </span>
      </DialogTitle>
      <DialogContent>
        <Table size='small'>
          <TableHead>
            <TableRow>
              <TableCell><b>Uploaded</b></TableCell>
              <TableCell><b>Mapped</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {
              map(columns, (column, position) => {
                return (
                  <TableRow key={column.original}>
                    <TableCell>
                      <span style={{display: 'flex', alignItems: 'center'}}>
                      {
                        isValid(column.label) ?
                          <ValidIcon sx={{marginRight: '8px'}} fontSize='small' color='success' /> :
                        <InvalidIcon sx={{marginRight: '8px'}} fontSize='small' color='error' />
                      }
                        {column.original}
                        </span>
                    </TableCell>
                    <TableCell>
                      <HeaderAutocomplete
                        headers={validColumns}
                        value={column.label}
                        id={position.toString()}
                        onChange={(event, value) => onValChange(position, value?.label || value)}
                      />
                    </TableCell>
                  </TableRow>
                )
              })
            }
          </TableBody>
        </Table>
      </DialogContent>
      <DialogActions>
        <Button sx={{textTransform: 'none'}} color='primary' variant='contained' onClick={onClose}>Done</Button>
      </DialogActions>
    </Dialog>
  )
}

export default ColumnMap
