import React from 'react'
import { useTranslation } from 'react-i18next';
import { MATCH_TYPES, SCORES_COLOR } from './constants'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Tooltip from '@mui/material/Tooltip'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import AssistantIcon from '@mui/icons-material/Assistant';
import isNumber from 'lodash/isNumber'
import isNaN from 'lodash/isNaN'

import ConceptIcon from '../concepts/ConceptIcon'



const Score = ({concept, setShowHighlights, sx, isAIRecommended, candidatesScore, algoScoreFirst, size}) => {
  const { t } = useTranslation();
  let percentile = concept?.search_meta?.search_normalized_score || ((concept?.search_meta?.search_rerank_score || concept?.search_meta?.search_score) * 100)
  if(percentile && !isNumber(percentile))
    percentile = parseFloat(percentile)
  const score = concept?.search_meta?.search_score
  const hasPercentile = isNumber(percentile)
  const { color } = MATCH_TYPES[concept?.search_meta?.match_type || 'no_match']
  const recommendedScore = candidatesScore?.recommended
  const availableScore = candidatesScore?.available
  let qualityBucket;
  if(hasPercentile) {
    if (percentile >= recommendedScore)
      qualityBucket = 'recommended'
    else if (percentile >= availableScore)
      qualityBucket = 'available'
    else
      qualityBucket = 'low'
  }
  let bucketColor = qualityBucket ? SCORES_COLOR[qualityBucket] : false

  const rerankScore = `${parseFloat(hasPercentile ? percentile : score).toFixed(2)}%`
  const algoScore = `${parseFloat(score).toFixed(2)}`
  return (
    <ListItem disablePadding sx={{display: 'inline-flex', width: 'auto'}}>
      <ListItemButton
        sx={{color: color, padding: '0px', ...sx}}
        color={color}
        size='small'
        disabled={!score && !hasPercentile}
        onClick={setShowHighlights ? (event) => {
          event.preventDefault()
          event.stopPropagation()
          setShowHighlights(concept)
          return false
        } : undefined}
      >
        {
          isAIRecommended &&
            <Tooltip title={t('map_project.ai_recommended')}>
              <ListItemIcon sx={{minWidth: 'auto', marginRight: '6px'}}>
                <AssistantIcon color='primary' fontSize='small' sx={{marginRight: '4px'}} />
              </ListItemIcon>
            </Tooltip>
          }
        <ListItemText
          sx={{margin: 0, '.MuiListItemText-primary': {fontSize: '14px'}, '.MuiListItemText-secondary': {fontSize: '12px'}}}
          primary={
            <Chip
              size={size || 'medium'}
              icon={
                <Box sx={{
                       border: '1px solid',
                       borderColor: '#FFF',
                       borderRadius: '50%',
                       display: 'inline-flex',
                     }}>
                  <ConceptIcon fontSize='small' selected sx={{fill: bucketColor || 'rgba(0, 0, 0, 0.5)', fontSize: '1rem'}} />
                </Box>
              }
              label={
                <span style={{display: 'flex', alignItems: 'center'}}>
                  <span>{algoScoreFirst ? algoScore : rerankScore}</span>
                  {
                    hasPercentile && !isNaN(score) && score ?
                      <span style={{fontSize: '12px', color: 'rgba(0, 0, 0, 0.6)', marginLeft: '4px', fontStyle: 'italic'}}>
                        {`(${algoScoreFirst ? rerankScore : algoScore})`}
                      </span> :
                    ''
                  }
                </span>
              }
            />
          }
        />
      </ListItemButton>
    </ListItem>
  )
}

export default Score
