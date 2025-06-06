import React from 'react'
import Chip from '@mui/material/Chip'
import { MATCH_TYPES } from './constants'

const Score = ({concept, setShowHighlights}) => {
  return (
    <Chip
      size='small'
      {...MATCH_TYPES[concept?.search_meta?.match_type || 'no_match']}
      label={`${parseFloat(concept?.search_meta?.search_score || 0).toFixed(2)}`}
      onClick={setShowHighlights ? (event) => {
        event.preventDefault()
        event.stopPropagation()
        setShowHighlights(concept)
        return false
      } : undefined}
      disabled={!concept?.search_meta?.search_score}
      variant='outlined'
    />
  )
}

export default Score
