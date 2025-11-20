import React from 'react'
import { useTranslation } from 'react-i18next';
import { MATCH_TYPES } from './constants'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Tooltip from '@mui/material/Tooltip'
import AssistantIcon from '@mui/icons-material/Assistant';
import isNumber from 'lodash/isNumber'
import isNaN from 'lodash/isNaN'


const Score = ({concept, setShowHighlights, sx, isAIRecommended}) => {
  const { t } = useTranslation();
  let percentile = concept?.search_meta?.search_normalized_score
  if(percentile && !isNumber(percentile))
    percentile = parseFloat(percentile)
  const score = concept?.search_meta?.search_score
  const hasPercentile = isNumber(percentile)
  const { icon, color } = MATCH_TYPES[concept?.search_meta?.match_type || 'no_match']
  return (
    <ListItem disablePadding>
      <ListItemButton
        sx={{color: color, padding: '4px', ...sx}}
        color={color}
        size='small'
        disabled={!score}
        onClick={setShowHighlights ? (event) => {
          event.preventDefault()
          event.stopPropagation()
          setShowHighlights(concept)
          return false
        } : undefined}
      >
        <ListItemIcon sx={{minWidth: 'auto', marginRight: '6px'}}>
          {
            isAIRecommended &&
              <Tooltip title={t('map_project.ai_recommended')}>
            <AssistantIcon color='primary' fontSize='small' sx={{marginRight: '4px'}} />
            </Tooltip>
          }
          {icon}
        </ListItemIcon>
        <ListItemText
          sx={{margin: '4px 0', '.MuiListItemText-primary': {fontSize: '14px'}, '.MuiListItemText-secondary': {fontSize: '12px'}}}
          primary={`${parseFloat(hasPercentile ? percentile : score).toFixed(2)}%`}
          secondary={hasPercentile && !isNaN(score) && score ? `${parseFloat(score).toFixed(2)}` : ''}
        />
      </ListItemButton>
    </ListItem>
  )
}

export default Score
