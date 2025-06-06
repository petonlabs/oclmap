import React from 'react';
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import Switch from '@mui/material/Switch'
import ListItemText from '@mui/material/ListItemText'
import ValidIcon from '@mui/icons-material/CheckCircleOutline';
import InvalidIcon from '@mui/icons-material/CancelOutlined';
import find from 'lodash/find';
import map from 'lodash/map';
import omit from 'lodash/omit';


const HeaderAutocomplete = ({headers, isValid, ...rest}) => {
  return (
    <Autocomplete
      autoHighlight
      autoComplete
      disablePortal
      blurOnSelect
      fullWidth
      getOptionLabel={option => option?.label ? option.label : find(headers, {id: option})?.label || (isValid ? option : '')}
      isOptionEqualToValue={(option, value) => option?.id === value?.id || option?.id === value || option === value}
      sx={{
        minWidth: '100px',
        '.MuiButtonBase-root': {color: '#000'}
      }}
      renderInput={(params) => <TextField margin='dense' size='small' {...params} />}
      options={headers}
      renderOption={
        (props, option) => {
          return (
            <ListItemText
              {...props}
              sx={{...props.sx, flexDirection: 'column', alignItems: 'flex-start !important'}}
              key={option?.id || 'unknown'}
              primary={option?.label || ''}
              secondary={option?.description || ''}
            />
          )
        }
      }
      {...rest}
    />
  )
}

const ColumnMapTable = ({validColumns, columns, isValid, onUpdate, sx, setColumnVisibilityModel, columnVisibilityModel}) => {
  const [random, setRandom] = React.useState(0)
  const onValChange = (position, value) => {
    onUpdate(position, value)
    setRandom(random + 1)
  }
  return (
    <Table size='small' sx={{'.MuiTableCell-root': {padding: '3px 8px'}, ...sx}}>
      <TableHead>
        <TableRow>
          <TableCell><b>Input Column</b></TableCell>
          <TableCell><b>Mapped Field</b></TableCell>
          <TableCell><b>Show</b></TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {
          map(columns, (column, position) => {
            const isValidColumn = isValid(column.label)
            const isHidden = columnVisibilityModel[column.dataKey] === false
            return (
              <TableRow key={column.original}>
                <TableCell>
                  <span style={{display: 'flex', alignItems: 'center'}}>
                    {
                      isValidColumn ?
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
                    isValid={isValidColumn}
                    onChange={(event, value) => onValChange(position, value?.label || value)}
                  />
                </TableCell>
                <TableCell>
                  <Switch size="small" checked={!isHidden} onChange={() => setColumnVisibilityModel(isHidden ? omit(columnVisibilityModel, [column.dataKey]) : {...columnVisibilityModel, [column.dataKey]: false})}/>
                </TableCell>
              </TableRow>
            )
          })
        }
      </TableBody>
    </Table>
  )
}

export default ColumnMapTable
