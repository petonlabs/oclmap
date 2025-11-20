import React from 'react';
import DownIcon from '@mui/icons-material/SouthRounded';
import UpIcon from '@mui/icons-material/NorthRounded';
import SortIcon from '@mui/icons-material/SwapVertRounded';
import ButtonGroup from '@mui/material/ButtonGroup'
import Button from '@mui/material/Button'
import Badge from '@mui/material/Badge'
import { SCORES_COLOR } from './constants'
import { useTranslation } from 'react-i18next';

const BucketButton = ({id, selected, onClick, count}) => {
  const { t } = useTranslation();
  const isSelected = selected === id && count
  return <Badge badgeContent={count} color='primary' max={999} sx={{'.MuiBadge-badge': {backgroundColor: SCORES_COLOR[id]}}}>
  <Button
           onClick={() => onClick(id)}
           disabled={!count}
           sx={{
             textTransform: 'none',
             color: isSelected ? 'primary' : '#000',
             backgroundColor: isSelected ? SCORES_COLOR[id] : undefined,
             borderBottom: count ? `2px solid ${SCORES_COLOR[id]} !important` : undefined,
           }}>
           {t('map_project.' + id)}
  </Button>
  </Badge>
}

const ScoreBucketButton = ({onClick, onSort, sortBy, selected, recommended, available, unranked}) => {
  const getSortIcon = () => {
    if(sortBy === 'desc')
      return <DownIcon fontSize='inherit' />
    if(sortBy === 'asc')
      return <UpIcon fontSize='inherit' />
    return <SortIcon />
  }
  const disabled = !recommended && !available && !unranked
  const selectedCount = selected === 'recommended' ? recommended : (selected === 'available' ? available : unranked)
  return (
    <ButtonGroup size='small' variant='text' sx={{marginRight: '8px', marginLeft: '12px'}}>
      <BucketButton id='recommended' selected={selected} count={recommended} onClick={onClick} />
      <BucketButton id='available' selected={selected} count={available} onClick={onClick} />
      <BucketButton id='unranked' selected={selected} count={unranked} onClick={onClick} />
      {
        !disabled && selected && selectedCount > 1 &&
          <Button onClick={onSort}>{getSortIcon()}</Button>
      }
    </ButtonGroup>
  )
}

export default ScoreBucketButton;
