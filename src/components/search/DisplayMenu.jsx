import React from 'react';
import { useTranslation } from 'react-i18next';
import ButtonGroup from '@mui/material/ButtonGroup';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableIcon from '@mui/icons-material/TableChart';
import CardIcon from '@mui/icons-material/DensityMedium';

const DisplayMenu = ({onSelect, selected, disabled, sx}) => {
  const { t } = useTranslation();

  return (
    <ButtonGroup color='info.dark' variant='outlined' size='small' disabled={disabled} sx={sx}>
      <Tooltip title={t('search.list_view')}>
        <Button onClick={() => onSelect('card')} color={selected === 'card' ? 'primary' : 'info.dark'}>
          <CardIcon color='info.dark' />
        </Button>
      </Tooltip>
      <Tooltip title={t('search.table_view')}>
        <Button onClick={() => onSelect('table')} color={selected === 'table' ? 'primary' : 'info.dark'}>
          <TableIcon color='info.dark' />
        </Button>
      </Tooltip>
    </ButtonGroup>
  )
}

export default DisplayMenu;
