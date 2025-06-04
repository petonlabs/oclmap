import React from 'react'
import Chip from '@mui/material/Chip'
import Alert from '@mui/material/Alert';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/Button';

import CloseIcon from '@mui/icons-material/Close';

import find from 'lodash/find'

import { highlightTexts } from '../../common/utils';
import SearchResults from '../search/SearchResults';
import { MATCH_TYPES } from './constants'
import Mappings from './Mappings'
import MapButton from './MapButton'

const Candidates = ({rowIndex, alert, setAlert, candidates, orderBy, order, onOrderChange, setShowItem, showItem, setShowHighlights, isSelectedForMap, onMap}) => {
  return (
    <div className='col-xs-12 padding-0'>
      <Collapse in={Boolean(alert?.message)}>
        <Alert
          severity={alert?.severity || 'error'}
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => setAlert(false)}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
          sx={{ mb: 2 }}
        >
          {alert.message}
        </Alert>
      </Collapse>
      <div className='col-xs-12 padding-0' style={{display: 'flex', alignItems: 'center'}}>
        <SearchResults
          id={rowIndex}
          resultSize='small'
          sx={{
            borderRadius: '10px 10px 0 0',
            '.MuiTableCell-root': {
              padding: '6px !important',
            },
            '.MuiTableCell-head': {
              padding: '2px 6px !important',
              whiteSpace: 'normal'
            },
            '.MuiToolbar-root': {
              borderRadius: '10px 10px 0 0',
            }
          }}
          noCardDisplay
          nested
          results={{
            results: find(candidates, c => c.row.__index === rowIndex )?.results || [],
            total: 1
          }}
          resource='concepts'
          noPagination
          noSorting
          noToolbar
          orderBy={orderBy}
          order={order}
          onOrderByChange={onOrderChange}
          resultContainerStyle={{height: 'calc(100vh - 500px)'}}
          onShowItemSelect={item => {
            setShowItem(item)
            setTimeout(() => {
              highlightTexts([item], null, false)
            }, 100)
          }}
          selectedToShow={showItem}
          extraColumns={[
            {
              sortable: false,
              id: 'mappings',
              labelKey: 'mapping.same_as_mappings',
              renderer: item => <Mappings item={item} />,
            },
            {
              sortable: true,
              id: 'search_meta.search_score',
              labelKey: 'search.score',
              renderer: (concept) => {
                return <Chip
                         size='small'
                         {...MATCH_TYPES[concept?.search_meta?.match_type || 'no_match']}
                         label={`${parseFloat(concept?.search_meta?.search_score || 0).toFixed(2)}`}
                         onClick={event => {
                           event.preventDefault()
                           event.stopPropagation()
                           setShowHighlights(concept)
                           return false
                         }}
                         disabled={!concept?.search_meta?.search_score}
                       />
              },
            },
            {
              sortable: false,
              id: 'map-control',
              labelKey: '',
              renderer: concept => (
                <MapButton
                  simple
                  onClick={(event, applied, mapType) => onMap(event, concept, !applied, mapType)}
                  isMapped={isSelectedForMap(concept)}
                />
              )
            },
          ]}
        />
      </div>
    </div>

  )
}

export default Candidates
