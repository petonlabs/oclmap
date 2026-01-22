import React from 'react'
import ListItemButton from '@mui/material/ListItemButton'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import isString from 'lodash/isString'
import map from 'lodash/map'

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


const Item = ({concept, setShowHighlights, onMap, isSelectedForMap, noScore, repoVersion, synonymPrefix, isAIRecommended, bridge, mapping, scispacy}) => {
  const isValidBridge = Boolean(bridge && mapping.cascade_target_concept_url)
  let bridgeMappingPrefix = bridge && mapping.cascade_target_concept_code ? `${mapping.cascade_target_source_name}:${mapping.cascade_target_concept_code} ${mapping.cascade_target_concept_name || ''}` : false
  const conceptToMap = isValidBridge ?
        {
          id: mapping.cascade_target_concept_code,
          name: mapping.cascade_target_concept_name,
          display_name: mapping.cascade_target_concept_name,
          url: mapping.cascade_target_concept_url,
          source: mapping.cascade_target_source_name,
          type: 'Concept',
          search_meta: concept.search_meta
        } :
        concept
  const mapTypeToApply = isValidBridge ? mapping?.map_type || concept?.search_meta?.map_type : concept?.search_meta?.map_type
  return (
    <>
      <ListItemText
        primary={
          <span>
            <span>
              <span className='searchable'>{`${concept.source || concept?.repo?.short_code || concept?.repo?.id}:${concept.id}`}</span>
              <span style={{marginLeft: '4px'}} className='searchable'>
                {
                  !bridge && synonymPrefix &&
                    <span className='searchable'>
                      <span dangerouslySetInnerHTML={{__html: synonymPrefix}}/>
                      <span style={{margin: '0 5px'}}>&rarr;</span>
                    </span>
                }
                {concept.display_name}
              </span>
              {
                bridgeMappingPrefix &&
                  <span>
                    <span style={{margin: '0 5px'}}>&rarr;</span>
                    <span>{`[${mapping.map_type}]`}</span>
                    <span style={{margin: '0 5px'}}>&rarr;</span>
                    <span className='searchable'>{bridgeMappingPrefix}</span>
                  </span>
              }
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
              disabled={scispacy || (bridge && !mapping.cascade_target_concept_url)}
              selected={mapTypeToApply}
              onClick={(event, applied, mapType) => onMap(event, conceptToMap, !applied, mapping?.map_type || mapType)}
              isMapped={isSelectedForMap(conceptToMap)}
              sx={{marginLeft: '8px'}}
            />
        }
      </span>
    </>
  )
}


const Concept = ({firstChild, concept, setShowHighlights, isShown, onCardClick, onMap, isSelectedForMap, noScore, repoVersion, isAIRecommended, AIRecommendedCandidateId, sx, notClickable, noSynonymPrefix, locales, bridge, scispacy}) => {
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

  if(bridge) {
    return map(concept?.mappings, (mapping, index) => {
      let _isAIRecommended = !isAIRecommended && AIRecommendedCandidateId === mapping?.cascade_target_concept_code
      return notClickable ? (
        <ListItem {...props} key={index}>
          <Item concept={concept} repoVersion={repoVersion} synonymPrefix={synonymPrefix} setShowHighlights={setShowHighlights} isAIRecommended={_isAIRecommended} isSelectedForMap={isSelectedForMap} onMap={onMap} noScore={noScore} bridge={bridge} mapping={mapping} />
        </ListItem>
      ) : (
        <ListItemButton {...props} key={index} onClick={onCardClick ? event => onCardClick(event, id) : undefined}>
          <Item concept={concept} repoVersion={repoVersion} synonymPrefix={synonymPrefix} setShowHighlights={setShowHighlights} isAIRecommended={_isAIRecommended} isSelectedForMap={isSelectedForMap} onMap={onMap} noScore={noScore} bridge={bridge} mapping={mapping} />
        </ListItemButton>
      )
    })
  }

  return notClickable ? (
    <ListItem {...props}>
      <Item concept={concept} repoVersion={repoVersion} synonymPrefix={synonymPrefix} setShowHighlights={setShowHighlights} isAIRecommended={isAIRecommended} isSelectedForMap={isSelectedForMap} onMap={onMap} noScore={noScore} bridge={bridge} scispacy={scispacy} />
    </ListItem>
  ) : (
    <ListItemButton {...props} onClick={onCardClick ? event => onCardClick(event, id) : undefined}>
      <Item concept={concept} repoVersion={repoVersion} synonymPrefix={synonymPrefix} setShowHighlights={setShowHighlights} isAIRecommended={isAIRecommended} isSelectedForMap={isSelectedForMap} onMap={onMap} noScore={noScore} bridge={bridge} scispacy={scispacy} />
      </ListItemButton>
    )
}

export default Concept;
