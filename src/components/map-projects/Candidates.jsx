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

import { highlightTexts } from '../../common/utils';
import { SCORES_COLOR } from './constants'
import SearchResults from '../search/SearchResults';
import Mappings from './Mappings'
import Concept from './Concept'
import IncludeRetired from './IncludeRetired'
import MapButton from './MapButton'

const CandidateList = ({candidates, header, rowIndex, orderBy, order, onOrderChange, setShowItem, showItem, setShowHighlights, isSelectedForMap, onMap, onFetchMore, bgColor, bucketId, display, onDisplayChange, noToolbar, toolbarControl}) => {
  const results = {total: onFetchMore ? candidates?.length : 1, results: candidates || []}

  const getExtraColumns = () => {
    let cols = [
      {
        sortable: false,
        id: 'mappings',
        labelKey: 'common.action',
        align: 'center',
        renderer: item => {
          return (
            <MapButton
              simple
              selected={item?.search_meta?.map_type}
              onClick={(event, applied, mapType) => onMap(event, item, !applied, mapType)}
              isMapped={isSelectedForMap(item)}
              sx={{marginLeft: '8px'}}
            />
          )
        },
      },
    ]
    if(display === 'card')
      cols = [
        {
          sortable: false,
          id: 'mappings',
          labelKey: 'mapping.same_as_mappings',
          renderer: item => <Mappings item={item} />,
        },
        ...cols
      ]
    return cols
  }

  return candidates.length > 0 ? (
      <ul>
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
          subheader={
              <ListSubheader sx={{lineHeight: '28px', padding: '2px 8px', background: bgColor || 'rgba(0, 0, 0, 0.1)', display: 'inline-block', width: '100%', color: '#000', fontSize: '12px'}}>
                <b>{header}</b>
              </ListSubheader>
          }
          title=' '
          renderer={props => <Concept {...props} key={`${bucketId}-${props?.concept?.uuid}`} onMap={onMap} isSelectedForMap={isSelectedForMap} setShowHighlights={setShowHighlights} />}
          display={display}
          onDisplayChange={onDisplayChange}
          nested
          results={results}
          resource='concepts'
          noPagination
          noSorting
          noHeader={noToolbar}
          noToolbar={noToolbar}
          toolbarControl={toolbarControl}
          orderBy={orderBy}
          order={order}
          onOrderByChange={onOrderChange}
          resultContainerStyle={{height: 'auto', '.MuiTable-root': {tableLayout: 'fixed'}}}
          onShowItemSelect={item => {
            setShowItem(item)
            setTimeout(() => {
              highlightTexts([item], null, false)
            }, 100)
          }}
          selectedToShow={showItem}
          extraColumns={getExtraColumns()}
        />
      </ul>
  ): null
}

const Candidates = ({rowIndex, alert, setAlert, candidates, orderBy, order, onOrderChange, setShowItem, showItem, setShowHighlights, isSelectedForMap, onMap, onFetchMore, retired, setRetired, isLoading, candidatesScore}) => {
  const [display, setDisplay] = React.useState('card')
  const recommendedScore = candidatesScore?.recommended
  const availableScore = candidatesScore?.available
  const concepts = find(candidates, c => c.row?.__index === rowIndex )?.results || []
  const canFetchMore = concepts?.length > 0
  let recommended = []
  let available = []
  let unranked = []
  concepts.forEach(concept => {
    let score = concept?.search_meta?.search_normalized_score || 0
    if (score >= recommendedScore)
      recommended.push(concept)
    else if (score >= availableScore)
      available.push(concept)
    else
      unranked.push(concept)
  })
  let props = {
    rowIndex: rowIndex,
    onMap: onMap,
    isSelectedForMap: isSelectedForMap,
    setShowHighlights: setShowHighlights,
    orderBy: orderBy,
    order: order,
    onOrderChange: onOrderChange,
    setShowItem: setShowItem,
    showItem: showItem,
    isLoading: isLoading,
    display: display,
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
        <List
          sx={{
            marginTop: '4px',
            width: '100%',
            position: 'relative',
            overflow: 'auto',
            maxHeight: 'calc(100vh - 524px)',
            '& ul': { padding: 0 },
          }}
          subheader={<li />}
          id='candidates-list'
        >
          <li>
            {
              (isLoading && !candidates?.length) ?
                <Skeleton height={60} /> :
              <CandidateList {...props} candidates={recommended} header='Recommended Candidates' onFetchMore={onFetchMore} bgColor={SCORES_COLOR.recommended} bucketId={`${rowIndex}-recommended`} noToolbar={false} onDisplayChange={setDisplay} toolbarControl={<IncludeRetired checked={retired} onChange={setRetired} sx={{margin: '3px 0 0px 8px', float: 'right', '.MuiTypography-root': {fontSize: '12px'}}} />} />
            }
          </li>
          <li>
            {
              (isLoading && !candidates?.length) ?
                <Skeleton height={60} /> :
              <CandidateList {...props} candidates={available} header='Available Candidates' onFetchMore={onFetchMore} bgColor={SCORES_COLOR.available} bucketId={`${rowIndex}-available`} noToolbar />
            }
          </li>
          <li>
            {
              (isLoading && !candidates?.length) ?
                <Skeleton height={60} /> :
              <CandidateList {...props} candidates={unranked} header='Unranked Candidates' onFetchMore={onFetchMore} bgColor={SCORES_COLOR.unranked} bucketId={`${rowIndex}-unranked`} noToolbar />
            }
          </li>
        </List>
        {
          onFetchMore && canFetchMore &&
            <div className='col-xs-12' style={{textAlign: 'right', marginTop: '6px'}}>
              <Button disabled={isLoading} size='small' variant='text' sx={{textTransform: 'none'}} onClick={onFetchMore}>
                {isLoading ? 'Fetching...' : 'Fetch More'}
              </Button>
            </div>
        }
      </div>
    </div>

  )
}

export default Candidates
