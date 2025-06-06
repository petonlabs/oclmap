import React from 'react'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Score from './Score'
import MapButton from './MapButton'

const Concept = ({firstChild, concept, setShowHighlights, isShown, onCardClick, onMap, isSelectedForMap, noScore}) => {
  const id = concept?.version_url || concept?.url || concept?.id
  const isSelectedToShow = isShown(id)
  return (
    <ListItemButton selected={isSelectedToShow} onClick={event => onCardClick(event, id)} sx={{padding: '8px', borderTop: firstChild ? undefined : '1px solid rgba(0, 0, 0, 0.1)'}}>
      <ListItemText
        className='searchable'
        primary={`${concept.source}:${concept.id} ${concept.display_name}`}
        secondary={
          <>
            <i style={{marginRight: '2px'}}>Class:</i> {concept.concept_class} <i style={{marginLeft: '6px', marginRight: '2px'}}>Datatype:</i> {concept.datatype}
          </>
        }
        sx={{margin: '2px 0', '.MuiListItemText-primary': {fontSize: '14px'}, '.MuiListItemText-secondary': {fontSize: '12px'}}}
      />
      <span style={{display: 'flex', alignItems: 'center'}}>
        {
          !noScore &&
            <Score concept={concept} setShowHighlights={setShowHighlights} />
        }
        <MapButton
          simple
          onClick={(event, applied, mapType) => onMap(event, concept, !applied, mapType)}
          isMapped={isSelectedForMap(concept)}
          sx={{marginLeft: '8px'}}
        />
      </span>
    </ListItemButton>
  )
}

export default Concept;
