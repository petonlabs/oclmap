import React from 'react'
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import { useTranslation } from 'react-i18next';

const IncludeRetired = ({checked, onChange, sx}) => {
  const { t } = useTranslation();
  return (
    <FormControlLabel
      sx={{margin: '8px 0', ...sx}}
      size='small'
      control={<Switch size='small' checked={checked} onChange={() => onChange(!checked)} color='error' />}
      label={t('map_project.include_retired')}
    />
  )
}

export default IncludeRetired
