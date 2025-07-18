import React from 'react'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button';
import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';
import FilterListIcon from '@mui/icons-material/FilterList';
import max from 'lodash/max'
import isEmpty from 'lodash/isEmpty'
import values from 'lodash/values'
import flatten from 'lodash/flatten'

import { highlightTexts } from '../../common/utils';
import SearchResults from '../search/SearchResults';
import SearchFilters from '../search/SearchFilters'
import Mappings from './Mappings'
import Concept from './Concept'

const SearchCandidates = ({searchStr, setSearchStr, candidates, repo, repoVersion, rowIndex, concepts, setShowItem, showItem, isSelectedForMap, onMap, response, onSearch, facets, appliedFacets, setAppliedFacets}) => {
  const [openFilters, setOpenFilters] = React.useState(openFilters)
  let total = parseInt(response?.headers?.num_found) || concepts?.length || 0
  const results = {total: total, pageSize: max([parseInt(response?.headers?.num_returned), 5]), page: parseInt(response?.headers?.page_number), pages: parseInt(response?.headers?.pages), results: response?.data || []}

  const onKeyPress = event => {
    if(event.key === 'Enter') {
      if(searchStr)
        candidates(event)
    }
  }

  return (
    <div className='col-xs-12 padding-0'>
      <div className='col-xs-12 padding-0' style={{display: 'flex', alignItems: 'center', margin: '16px 0'}}>
        <IconButton color={(isEmpty(appliedFacets) && !openFilters) ? undefined : 'primary'} style={{marginRight: '4px'}} onClick={() => setOpenFilters(!openFilters)} disabled={isEmpty(facets)}>
          <Badge badgeContent={flatten(values(appliedFacets).map(v => values(v))).length} color='primary'>
    <FilterListIcon sx={{color: (isEmpty(appliedFacets) && !openFilters) ? '#000': 'primary'}} />
    </Badge>
        </IconButton>
        <TextField
          autoFocus
          label='Search'
          sx={{width: 'calc(100% - 90px)'}}
          required
          id="search"
          value={searchStr}
          onChange={event => setSearchStr(event.target.value || '')}
          size='small'
          onKeyDown={onKeyPress}
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
      <div className='col-xs-12 padding-0' style={{display: 'flex'}}>
        {
          !isEmpty(facets) &&
            <div className='col-xs-5 padding-0' style={openFilters ? {borderRight: '1px solid lightgray', height: 'calc(100vh - 585px)', overflow: 'auto'} : {width: 0, display: 'none'}}>
          <SearchFilters
            resource='concepts'
            filters={facets}
            appliedFilters={appliedFacets || {}}
            onChange={setAppliedFacets}
            />
          </div>
        }
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
          results={results}
          resource='concepts'
          noSorting
          noToolbar
          rowsPerPageOptions={[]}
          resultContainerStyle={{height: 'calc(100vh - 630px)'}}
          onShowItemSelect={item => {
            setShowItem(item)
            setTimeout(() => {
              highlightTexts([item], null, false)
            }, 100)
          }}
          selectedToShow={showItem}
          onPageChange={(page, pageSize) => onSearch(null, page, pageSize)}
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
