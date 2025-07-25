import React from 'react'
import Alert from '@mui/material/Alert';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/Button';
import ListSubheader from '@mui/material/ListSubheader';
import List from '@mui/material/List';
import Button from '@mui/material/Button'
import Skeleton from '@mui/material/Skeleton'

import CloseIcon from '@mui/icons-material/Close';

import find from 'lodash/find'
import filter from 'lodash/filter'

import { highlightTexts } from '../../common/utils';
import SearchResults from '../search/SearchResults';
import Mappings from './Mappings'
import Concept from './Concept'
import IncludeRetired from './IncludeRetired'

const CandidateList = ({candidates, header, rowIndex, orderBy, order, onOrderChange, setShowItem, showItem, setShowHighlights, isSelectedForMap, onMap, onFetchMore, canFetchMore}) => {
  const results = {total: onFetchMore ? candidates.length : 1, results: candidates || []}

  return candidates.length > 0 ? (
    <ul>
      <ListSubheader sx={{position: 'initial', lineHeight: '28px', padding: '2px 8px', background: 'rgba(0, 0, 0, 0.1)', display: 'inline-block', width: '100%', color: '#000', fontSize: '12px'}}>
        <b>{header}</b>
      </ListSubheader>
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
        renderer={props => <Concept {...props} onMap={onMap} isSelectedForMap={isSelectedForMap} setShowHighlights={setShowHighlights} />}
        display='card'
        nested
        results={results}
        resource='concepts'
        noPagination
        noSorting
        noToolbar
        orderBy={orderBy}
        order={order}
        onOrderByChange={onOrderChange}
        resultContainerStyle={{height: 'auto'}}
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
      {
        onFetchMore && canFetchMore &&
          <div className='col-xs-12' style={{textAlign: 'right', margin: '16px 0'}}>
            <Button size='small' variant='text' sx={{textTransform: 'none'}} onClick={onFetchMore}>
            Fetch More
        </Button>
        </div>
      }
    </ul>
  ) : <ul>
        <Skeleton height={60} />
        <Skeleton height={60} />
        <Skeleton height={60} />
        <Skeleton height={60} />
        <Skeleton height={60} />
        <Skeleton height={60} />
  </ul>
}

const Candidates = ({rowIndex, alert, setAlert, candidates, orderBy, order, onOrderChange, setShowItem, showItem, setShowHighlights, isSelectedForMap, onMap, onFetchMore, retired, setRetired}) => {
  const concepts = find(candidates, c => c.row.__index === rowIndex )?.results || []
  const canFetchMore = concepts?.length > 0
  const recommended = filter(concepts, concept => concept?.search_meta?.match_type === 'very_high')
  const available = filter(concepts, concept => concept?.search_meta?.match_type !== 'very_high')
  let props = {
    rowIndex: rowIndex,
    onMap: onMap,
    isSelectedForMap: isSelectedForMap,
    setShowHighlights: setShowHighlights,
    orderBy: orderBy,
    order: order,
    onOrderChange: onOrderChange,
    setShowItem: setShowItem,
    showItem: showItem
  }
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
      <div className='col-xs-12 padding-0'>
        <div className='col-xs-12 padding-0'>
    <IncludeRetired checked={retired} onChange={setRetired} sx={{float: 'right'}} />
    </div>

        <List
          sx={{
            marginTop: '4px',
            width: '100%',
            position: 'relative',
            overflow: 'auto',
            maxHeight: 'calc(100vh - 500px)',
            '& ul': { padding: 0 },
          }}
          subheader={<li />}
        >
          <li>
            <CandidateList {...props} candidates={recommended} header='Recommended Candidates' canFetchMore={canFetchMore && !available?.length} onFetchMore={onFetchMore} />
          </li>
          <li>
            <CandidateList {...props} candidates={available} header='Available Candidates' canFetchMore={canFetchMore} onFetchMore={onFetchMore} />
          </li>
        </List>
      </div>
    </div>

  )
}

export default Candidates
