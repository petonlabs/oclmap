import React from 'react'
import ListItemButton from '@mui/material/ListItemButton'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import isString from 'lodash/isString'

import Retired from '../common/Retired'
import Score from './Score'
import MapButton from './MapButton'
import ConceptSummaryProperties from '../concepts/ConceptSummaryProperties'

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


const Item = ({concept, setShowHighlights, onMap, isSelectedForMap, noScore, repoVersion, synonymPrefix, isAIRecommended}) => {
  return (
    <>
      <ListItemText
        className='searchable'
        primary={
          <span>
            <span>
              {`${concept.source || concept?.repo?.short_code || concept?.repo?.id}:${concept.id}`}
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
        secondary={<ConceptSummaryProperties concept={concept} repoVersion={repoVersion} />}
        sx={{margin: '2px 0', '.MuiListItemText-primary': {fontSize: '14px'}, '.MuiListItemText-secondary': {fontSize: '12px', overflow: 'scroll'}}}
      />
      <span style={{display: 'flex', alignItems: 'center'}}>
        {
          !noScore &&
            <Score concept={concept} setShowHighlights={setShowHighlights} isAIRecommended={isAIRecommended} />
        }
        {
        isSelectedForMap &&
            <MapButton
              simple
              selected={concept?.search_meta?.map_type}
              onClick={(event, applied, mapType) => onMap(event, concept, !applied, mapType)}
              isMapped={isSelectedForMap(concept)}
              sx={{marginLeft: '8px'}}
            />
        }
      </span>
    </>
  )
}


const Concept = ({firstChild, concept, setShowHighlights, isShown, onCardClick, onMap, isSelectedForMap, noScore, repoVersion, isAIRecommended, sx, notClickable, noSynonymPrefix, locales}) => {
  const id = concept?.version_url || concept?.url || concept?.id
  const isSelectedToShow = isShown ? isShown(id) : false

  let synonymPrefix = ''
  const highlights = concept?.search_meta?.search_highlight
  const synonymHighlight = highlights?.synonyms
  const nameHighlight = highlights?.name
  if(!nameHighlight?.length && synonymHighlight?.length && !noSynonymPrefix) {
    let bestMatch = getBestSynonym(synonymHighlight) || synonymHighlight[0]
    if(locales && bestMatch) {
      let raw = bestMatch.replaceAll("<em>", "").replaceAll("</em>", "")
      let _locales = isString(locales) ? locales.split(',') : locales
      if(_locales?.length > 0 && !_locales.includes(concept.names.find(name => name.name.startsWith(raw))?.locale))
        bestMatch = ''
    }
    synonymPrefix = bestMatch.replaceAll('<em>', "<b className='searchable'>").replaceAll('</em>', '</b>')
  }

  const props = {
    selected: isSelectedToShow,
    sx: {padding: '8px', borderTop: firstChild ? undefined : '1px solid rgba(0, 0, 0, 0.1)', ...sx}
  }

  return notClickable ? (
    <ListItem {...props}>
      <Item concept={concept} repoVersion={repoVersion} synonymPrefix={synonymPrefix} setShowHighlights={setShowHighlights} isAIRecommended={isAIRecommended} isSelectedForMap={isSelectedForMap} onMap={onMap} noScore={noScore} />
    </ListItem>
  ) : (
    <ListItemButton {...props} onClick={onCardClick ? event => onCardClick(event, id) : undefined}>
      <Item concept={concept} repoVersion={repoVersion} synonymPrefix={synonymPrefix} setShowHighlights={setShowHighlights} isAIRecommended={isAIRecommended} isSelectedForMap={isSelectedForMap} onMap={onMap} noScore={noScore} />
      </ListItemButton>
    )
}

export default Concept;
