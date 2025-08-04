import React from 'react'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Retired from '../common/Retired'
import Score from './Score'
import MapButton from './MapButton'

const getBestSynonym = synonyms => {
  return synonyms
    .map(text => {
      const matches = [...text.matchAll(/<em>(.*?)<\/em>/g)];
      const longestMatch = matches.reduce((a, b) => (b[1].length > a.length ? b[1] : a), "");
      const startsWithMatch = text.indexOf(`<em>${longestMatch}</em>`) === 0;
      return { text, longestMatch, length: longestMatch.length, startsWithMatch };
    })
    .sort((a, b) => {
      if (b.length !== a.length) return b.length - a.length; // longest match first
      if (b.startsWithMatch !== a.startsWithMatch) return b.startsWithMatch ? 1 : -1; // prefer start
      return 0;
    })[0].text; // return best match's text
}

const Concept = ({firstChild, concept, setShowHighlights, isShown, onCardClick, onMap, isSelectedForMap, noScore}) => {
  const id = concept?.version_url || concept?.url || concept?.id
  const isSelectedToShow = isShown(id)

  let synonymPrefix = ''
  const highlights = concept?.search_meta?.search_highlight
  const synonymHighlight = highlights?.synonyms
  const nameHighlight = highlights?.name
  if(!nameHighlight?.length && synonymHighlight?.length) {
    const bestMatch = getBestSynonym(synonymHighlight) || synonymHighlight[0]
    synonymPrefix = bestMatch.replace('<em>', "<b className='searchable'>").replace('</em>', '</b>')
  }

  return (
    <ListItemButton selected={isSelectedToShow} onClick={event => onCardClick(event, id)} sx={{padding: '8px', borderTop: firstChild ? undefined : '1px solid rgba(0, 0, 0, 0.1)'}}>
      <ListItemText
        className='searchable'
        primary={
          <span>
            <span>
              {`${concept.source}:${concept.id}`}
              <span style={{marginLeft: '4px'}}>
                {
                  synonymPrefix &&
                    <span>
                      <span dangerouslySetInnerHTML={{__html: synonymPrefix}} />
                      <span style={{margin: '0 5px'}}>&rarr;</span>
                    </span>
                }
                {concept.display_name}
              </span>
            </span>
          {
            concept.retired &&
              <Retired size='small' style={{margin: '0 12px'}} />
          }
          </span>
        }
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
