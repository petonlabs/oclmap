/*eslint no-process-env: 0*/

import React from 'react'
import { useTranslation } from 'react-i18next';
import Alert from '@mui/material/Alert';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/Button';
import ListSubheader from '@mui/material/ListSubheader';
import List from '@mui/material/List';
import Menu from '@mui/material/Menu';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button'
import Skeleton from '@mui/material/Skeleton'
import Badge from '@mui/material/Badge'

import CloseIcon from '@mui/icons-material/Close';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import SortIcon from '@mui/icons-material/SwapVert';

import find from 'lodash/find'
import get from 'lodash/get'
import isEmpty from 'lodash/isEmpty'
import flatten from 'lodash/flatten'
import values from 'lodash/values'
import startCase from 'lodash/startCase'

import { highlightTexts, hasAuthGroup, getCurrentUser } from '../../common/utils';
import { PRIMARY_COLORS } from '../../common/colors'
import { SCORES_COLOR } from './constants'
import SearchResults from '../search/SearchResults';
import SearchFilters from '../search/SearchFilters'
import NoResults from '../search/NoResults';
import Mappings from './Mappings'
import Concept from './Concept'
import MapButton from './MapButton'
import AICandidatesAnalysis from './AICandidatesAnalysis'
import AIAssistantButton from './AIAssistantButton'

const Sort = ({ selected, onSort, reranker }) => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = React.useState(false)
  const onSortClick = event => setAnchorEl(event.currentTarget)
  const onClick = option => {
    setAnchorEl(false)
    onSort(option)
  }

  return (
    <>
      <Button onClick={onSortClick} variant='outlined' color='info.dark' value='check' size='small' sx={{textTransform: 'none', padding: '5px', '.MuiButton-startIcon': {marginTop: '-2px', marginRight: '4px'}}} startIcon={<SortIcon fontSize='inherit' />}>
        {t('common.sort')}
      </Button>

      <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(false)}
      sx={{'.MuiPaper-root': {backgroundColor: 'surface.n94'}}}
      >
        {
          reranker &&
            <ListItemButton id='sort_by_raw_score' sx={{padding: '4px 10px', '&:hover': {color: 'inherit'}, '&:focus': {outline: 'none', textDecoration: 'none', color: 'inherit'}}} onClick={() => onClick('score')} selected={selected === 'score'}>
              <ListItemText primary={t('map_project.sort_by_raw_score')} />
            </ListItemButton>
        }
        <ListItemButton id='sort_by_id' sx={{padding: '4px 10px', '&:hover': {color: 'inherit'}, '&:focus': {outline: 'none', textDecoration: 'none', color: 'inherit'}}} onClick={() => onClick('id')} selected={selected === 'id'}>
          <ListItemText primary={t('map_project.concept_id')} />
        </ListItemButton>
        <ListItemButton id='sort_by_name' sx={{padding: '4px 10px', '&:hover': {color: 'inherit'}, '&:focus': {outline: 'none', textDecoration: 'none', color: 'inherit'}}} onClick={() => onClick('display_name')} selected={selected === 'display_name'}>
          <ListItemText primary={t('concept.display_name')} />
        </ListItemButton>
    </Menu>
    </>
  )
}

const CandidateList = ({candidates, header, rowIndex, orderBy, order, onOrderChange, setShowItem, showItem, setShowHighlights, isSelectedForMap, onMap, onFetchMore, bgColor, bucketId, display, onDisplayChange, noToolbar, toolbarControl, repoVersion, alignToolbarLeft, rightControl, analysis, showAnalysis, openAnalysis, onCloseAnalysis, AIRecommendedCandidateId, locales, bridge}) => {
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
  const count = candidates.length
  const showHeader = count > 0

  return (
    <ul>
      <SearchResults
        id={rowIndex}
        resultSize='small'
        sx={{
          borderRadius: '10px 10px 0 0',
          '.MuiTableCell-root': {
            padding: '6px !important',
            verticalAlign: 'top',
          },
          '.MuiTableCell-head': {
            padding: '2px 6px !important',
            whiteSpace: 'normal',
            verticalAlign: 'middle',
          },
          '.MuiToolbar-root': {
            borderRadius: '10px 10px 0 0',
          }
        }}
        subheader={
          (showAnalysis && openAnalysis) ? (
            <div className='col-xs-12 padding-0' style={{display: 'inline-flex', flexDirection: 'column'}}>
              <AICandidatesAnalysis analysis={analysis} onClose={onCloseAnalysis} sx={{marginBottom: '4px'}}/>
              {
              showHeader &&
              <ListSubheader sx={{lineHeight: '28px', padding: '2px 8px', background: bgColor || 'rgb(229, 229, 229)', display: 'inline-flex', justifyContent: 'space-between', width: '100%', color: '#000', fontSize: '12px'}}>
                <b>{header}</b>
                <b>{count.toLocaleString()}</b>
              </ListSubheader>
              }
            </div>
          ) :
            (
              showHeader &&
                <ListSubheader sx={{lineHeight: '28px', padding: '2px 8px', background: bgColor || 'rgb(229, 229, 229)', display: 'inline-flex', justifyContent: 'space-between', width: '100%', color: '#000', fontSize: '12px', borderBottom: bridge ? `1px solid ${PRIMARY_COLORS.main}` : undefined}}>
                  <b>{header}</b>
                  <b>{count.toLocaleString()}</b>
                </ListSubheader>
            )
        }
        title=' '
        renderer={props => <Concept {...props} key={`${bucketId}-${props?.concept?.uuid}`} onMap={onMap} isSelectedForMap={isSelectedForMap} setShowHighlights={setShowHighlights} repoVersion={repoVersion} isAIRecommended={AIRecommendedCandidateId === props?.concept?.id} AIRecommendedCandidateId={AIRecommendedCandidateId} locales={locales} bridge={bridge} />}
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
        alignToolbarLeft={alignToolbarLeft}
        rightControl={rightControl}
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
        properties={repoVersion?.meta?.display?.concept_summary_properties}
        propertyFilters={repoVersion?.filters}
        repoDefaultFilters={repoVersion?.meta?.display?.default_filter}
      />
    </ul>
  )
}

const Candidates = ({rowIndex, alert, setAlert, candidates, orderBy, order, onOrderChange, setShowItem, showItem, setShowHighlights, isSelectedForMap, onMap, onFetchMore, isLoading, candidatesScore, repoVersion, analysis, onFetchRecommendation, appliedFacets, setAppliedFacets, filters, facets, columns, defaultFilters, locales, bridgeCandidates, models, selectedModel, onModelChange, reranker, onRefreshClick}) => {
  const { t } = useTranslation();
  const [sortBy, setSortBy] = React.useState(false)
  /*eslint no-undef: 0*/
  const AI_ASSISTANT_API_URL = window.AI_ASSISTANT_API_URL || process.env.AI_ASSISTANT_API_URL
  const inAIAssistantGroup = Boolean(hasAuthGroup(getCurrentUser(), 'mapper_ai_assistant') && AI_ASSISTANT_API_URL)
  const [openFilters, setOpenFilters] = React.useState(false)
  const [display, setDisplay] = React.useState('card')
  const [openAIAnalysis, setOpenAIAnalysis] = React.useState(undefined)
  const recommendedScore = candidatesScore?.recommended
  const availableScore = candidatesScore?.available
  const results = find(candidates, c => c.row?.__index === rowIndex )?.results
  const bridgeResults = find(bridgeCandidates, c => c.row?.__index === rowIndex )?.results || []
  const isNoneLoaded = results === null || results === undefined
  const concepts = results || []
  const canFetchMore = concepts?.length > 0
  let recommended = []
  let available = []
  let lowRanked = []
  let AIRecommendedCandidateId = get(analysis, 'primary_candidate.concept_id')
  const noCandidatesFound = !isLoading && !isNoneLoaded && results?.length === 0

  concepts.forEach(concept => {
    let score = concept?.search_meta?.search_normalized_score || 0
    if(sortBy)
      recommended.push(concept)
    else {
      if (score >= recommendedScore)
        recommended.push(concept)
      else if (score >= availableScore)
        available.push(concept)
      else
        lowRanked.push(concept)
    }
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
    repoVersion: repoVersion,
    AIRecommendedCandidateId: AIRecommendedCandidateId,
    locales: locales
  }

  const onSort = option => {
    let newOption = option
    if(option === sortBy) {
      setSortBy(false)
      newOption = 'search_meta.search_normalized_score'
    } else if(option === 'score') {
      newOption = 'search_meta.search_score'
      setSortBy(option)
    } else {
      setSortBy(option)
    }

    onOrderChange(newOption, option === 'score' ? 'desc' : 'asc')
  }

  const onRecommend = () => {
    setOpenAIAnalysis(true)
    onFetchRecommendation()
  }

  const getRightControls = () => {
      return (
        <span style={{display: 'flex'}}>
          {
            !noCandidatesFound &&
              <Button onClick={onRefreshClick} color='info.dark' variant='outlined' size='small' sx={{margin: '0 8px', padding: '5px', textTransform: 'none', '.MuiButton-startIcon': {marginTop: '-2px', marginRight: '4px'}}} startIcon={<RefreshIcon fontSize='inherit' />}>
                {startCase(t('common.refresh'))}
              </Button>
          }
          {
            !noCandidatesFound &&
              <Sort
                onSort={onSort}
                selected={sortBy}
                reranker={reranker}
              />
          }
          {
            inAIAssistantGroup &&
              <AIAssistantButton
                models={models}
                selected={selectedModel}
                onClick={onRecommend}
                sx={{margin: '0 8px'}}
                onModelChange={onModelChange}
              />
          }
        </span>
      )

  }

  React.useEffect(() => {
    setOpenAIAnalysis(isEmpty(analysis) ? false : (openAIAnalysis !== false))
  }, [rowIndex])


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
    <div className='col-xs-12 padding-0' style={{display: 'flex'}}>
      {
        !isEmpty(facets) &&
          <div className='col-xs-4 padding-0' style={openFilters ? {borderRight: '1px solid lightgray'} : {width: 0, display: 'none'}}>
            <SearchFilters
              open={openFilters}
              resource='concepts'
              filters={facets}
              appliedFilters={appliedFacets || {}}
              onChange={setAppliedFacets}
              repoDefaultFilters={filters}
              defaultFilters={defaultFilters}
              properties={repoVersion?.meta?.display?.concept_summary_properties}
              propertyFilters={repoVersion?.filters}
              heightToSubtract={523}
              columns={columns}
            />
          </div>
      }
      <div className={openFilters ? 'col-xs-8' : 'col-xs-12'} style={{padding: 0, paddingLeft: openFilters ? '8px' : 0}}>
        {
          noCandidatesFound &&
            <NoResults text='We could not find any candidates for this row.' height='300px' />
        }
        <List
          sx={{
            marginTop: '4px',
            width: '100%',
            position: 'relative',
            overflow: 'auto',
            maxHeight: 'calc(100vh - 522px)',
            '& ul': { padding: 0 },
          }}
          subheader={<li />}
          id='candidates-list'
        >
          <li>
            {
              (isLoading && isNoneLoaded) ?
                <Skeleton height={60} /> :
              <CandidateList
                {...props}
                candidates={recommended}
                header={sortBy ? t('map_project.available_candidates') : t('map_project.recommended_candidates')}
                onFetchMore={onFetchMore}
                bgColor={sortBy ? SCORES_COLOR.available : SCORES_COLOR.recommended}
                bucketId={`${rowIndex}-recommended`}
                noToolbar={false}
                onDisplayChange={setDisplay}
                toolbarControl={
                  <IconButton color={(isEmpty(appliedFacets) && !openFilters) ? undefined : 'primary'} sx={{minWidth: 'auto'}} onClick={() => setOpenFilters(!openFilters)} disabled={isEmpty(facets)}>
                    <Badge badgeContent={flatten(values(appliedFacets).map(v => values(v))).length} color='primary'>
                      <FilterListIcon sx={{color: (isEmpty(appliedFacets) && !openFilters) ? '#000': 'primary'}} />
                    </Badge>
                  </IconButton>
                }
                alignToolbarLeft={inAIAssistantGroup}
                rightControl={getRightControls()}
                analysis={analysis}
                showAnalysis
                openAnalysis={Boolean(openAIAnalysis)}
                onCloseAnalysis={() => setOpenAIAnalysis(false)}
              />
            }
          </li>
          <li>
            {
              (isLoading && isNoneLoaded) ?
                <Skeleton height={60} /> :
              <CandidateList
                {...props}
                candidates={available}
                header={t('map_project.available_candidates')}
                onFetchMore={onFetchMore}
                bgColor={SCORES_COLOR.available}
                bucketId={`${rowIndex}-available`}
                noToolbar />
            }
          </li>
          <li>
            {
              (isLoading && isNoneLoaded) ?
                <Skeleton height={60} /> :
              <CandidateList {...props} candidates={lowRanked} header={t('map_project.low_ranked_candidates')} onFetchMore={onFetchMore} bgColor={SCORES_COLOR.low_ranked} bucketId={`${rowIndex}-low-ranked`} noToolbar />
            }
          </li>
          <li>
            {
              (isLoading && isNoneLoaded) ?
                <Skeleton height={60} /> :
              <CandidateList {...props} candidates={bridgeResults} header={t('map_project.ciel_bridge_terminology_candidates')} onFetchMore={onFetchMore} bucketId={`${rowIndex}-bridge`} noToolbar bridge />
            }
          </li>
        </List>
        {
          onFetchMore && canFetchMore &&
            <div className='col-xs-12' style={{textAlign: 'right', marginTop: '4px'}}>
              <Button disabled={isLoading} size='small' variant='text' sx={{textTransform: 'none'}} onClick={onFetchMore}>
                {isLoading ? t('map_project.fetching') : t('map_project.fetch_more')}
              </Button>
            </div>
        }
      </div>
    </div>
    </div>

  )
}

export default Candidates
