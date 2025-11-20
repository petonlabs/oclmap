import React from 'react'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableBody from '@mui/material/TableBody'
import map from 'lodash/map'
import isBoolean from 'lodash/isBoolean'
import { useTranslation } from 'react-i18next';

const FilterTable = ({filters, order, sx}) => {
  const { t } = useTranslation();
  const normalizeKey = key => {
    if (key === "concept_class" || key === "properties__concept_class")
      return "concept_class";
    if (key === "datatype" || key === "properties__datatype")
      return "datatype";
    return key;
  }

  const sortedFilters = () => {
    const keys = Object.keys(filters);
    const normalizedOrder = (order || []).map(normalizeKey);

    const orderedMatches = normalizedOrder.flatMap(wantedNorm =>
      keys.filter(k => normalizeKey(k) === wantedNorm)
    );

    const rest = keys.filter(k => !normalizedOrder.includes(normalizeKey(k)));

    const sortedKeys = [...orderedMatches, ...rest];
    return Object.fromEntries(sortedKeys.map(k => [k, filters[k]]));
  }

  const formatValue = value => {
    if(isBoolean(value))
      return value.toString()
    if(value?.includes(','))
      return value.split(',').join(', ')
    return value
  }
  return (
    <Table size='small' sx={{
      '.MuiTableCell-root': {padding: '3px 6px', border: '1px solid rgba(0, 0, 0, 0.1)', fontSize: '13px'},
      '.MuiTableCell-head': {
        fontWeight: 'bold',
        fontSize: '12px'
      },
      ...sx
    }}>
      <TableHead>
        <TableRow>
          <TableCell>{t('map_project.field')}</TableCell>
          <TableCell>{t('map_project.value')}</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {
          map(sortedFilters(), (value, key) => (
            <TableRow key={key}>
              <TableCell>{key}</TableCell>
              <TableCell>{formatValue(value)}</TableCell>
            </TableRow>
          ))
        }
      </TableBody>
    </Table>
  )
}

export default FilterTable
