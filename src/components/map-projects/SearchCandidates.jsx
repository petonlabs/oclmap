import React from 'react'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button';

import orderBy from 'lodash/orderBy'

import { highlightTexts } from '../../common/utils';
import SearchResults from '../search/SearchResults';
import Mappings from './Mappings'
import Concept from './Concept'

const SearchCandidates = ({searchStr, setSearchStr, candidates, repo, repoVersion, rowIndex, concepts, setShowItem, showItem, isSelectedForMap, onMap}) => {
  return (
    <div className='col-xs-12 padding-0'>
      <div className='col-xs-12 padding-0' style={{display: 'flex', alignItems: 'center', margin: '16px 0'}}>
        <TextField
          label='Search'
          sx={{width: 'calc(100% - 90px)'}}
          required
          id="search"
          value={searchStr}
          onChange={event => setSearchStr(event.target.value || '')}
          size='small'
        />
        <Button
          color='primary'
          variant="contained"
          sx={{textTransform: 'none', marginLeft: '10px'}}
          disabled={!repo?.id || !repoVersion?.id || !searchStr}
          onClick={candidates}
        >
          Search
        </Button>
      </div>
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
          renderer={props => <Concept {...props} onMap={onMap} isSelectedForMap={isSelectedForMap} noScore />}
          display='card'
          nested
          results={{
            results: orderBy(concepts || [], 'search_meta.search_score', 'desc'),
            total: concepts?.length
          }}
          resource='concepts'
          noPagination
          noSorting
          noToolbar
          resultContainerStyle={{height: 'calc(100vh - 560px)'}}
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
          ]}
        />
      </div>
    </div>

  )
}

export default SearchCandidates
