/*eslint no-process-env: 0*/

import React from 'react'
import { useTranslation } from 'react-i18next';
import * as XLSX from 'xlsx';
import moment from 'moment'
import Split from 'react-split';
import BridgeMatch from '../../services/LazyLoader'

import { useParams, useHistory } from 'react-router-dom'

import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton'
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Switch from '@mui/material/Switch';
import Tooltip from '@mui/material/Tooltip';
import Alert from '@mui/material/Alert';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import Badge from '@mui/material/Badge';
import { DataGrid } from '@mui/x-data-grid';


import DownIcon from '@mui/icons-material/ArrowDropDown';
import MatchingIcon from '@mui/icons-material/DeviceHub';
import DoubleArrowIcon from '@mui/icons-material/DoubleArrow';
import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';
import SettingsIcon from '@mui/icons-material/Settings';
import AutoMatchIcon from '@mui/icons-material/MotionPhotosAutoOutlined';
import ClearIcon from '@mui/icons-material/Clear';
import AssistantIcon from '@mui/icons-material/Assistant';
import PendingIcon from '@mui/icons-material/HourglassBottom';

import orderBy from 'lodash/orderBy'
import filter from 'lodash/filter'
import map from 'lodash/map'
import forEach from 'lodash/forEach'
import snakeCase from 'lodash/snakeCase'
import startCase from 'lodash/startCase'
import values from 'lodash/values'
import find from 'lodash/find'
import without from 'lodash/without'
import has from 'lodash/has'
import chunk from 'lodash/chunk'
import get from 'lodash/get'
import countBy from 'lodash/countBy'
import sum from 'lodash/sum'
import omit from 'lodash/omit'
import omitBy from 'lodash/omitBy'
import reject from 'lodash/reject'
import uniq from 'lodash/uniq'
import compact from 'lodash/compact'
import flatten from 'lodash/flatten'
import debounce from 'lodash/debounce'
import keys from 'lodash/keys'
import pickBy from 'lodash/pickBy'
import every from 'lodash/every'
import isEmpty from 'lodash/isEmpty'
import findIndex from 'lodash/findIndex'
import isString from 'lodash/isString'
import isNaN from 'lodash/isNaN'
import isArray from 'lodash/isArray'
import isBoolean from 'lodash/isBoolean'
import isNumber from 'lodash/isNumber'
import times from 'lodash/times'

import { OperationsContext } from '../app/LayoutContext';

import APIService from '../../services/APIService';
import { highlightTexts, dropVersion, getCurrentUser, URIToParentParams, hasAuthGroup, downloadObject, isNumeric } from '../../common/utils';
import { WHITE, SURFACE_COLORS } from '../../common/colors';

import { useDoubleClick } from '../common/useDoubleClick'
import CloseIconButton from '../common/CloseIconButton';
import SearchHighlightsDialog from '../search/SearchHighlightsDialog'
import ConceptHome from '../concepts/ConceptHome'
import RepoSearchAutocomplete from '../repos/RepoSearchAutocomplete'
import RepoVersionSearchAutocomplete from '../repos/RepoVersionSearchAutocomplete'
import DraggablePaperComponent from '../common/DraggablePaperComponent'
import LoaderDialog from '../common/LoaderDialog'
import Error403 from '../errors/Error403'
import { HEADERS, SEMANTIC_SEARCH_HEADERS, ROW_STATES, VIEWS, DECISION_TABS, SEMANTIC_BATCH_SIZE, ES_BATCH_SIZE } from './constants'
import MapProjectDeleteConfirmDialog from './MapProjectDeleteConfirmDialog';
import ConfigurationForm from './ConfigurationForm'
import Controls from './Controls'
import MatchSummaryCard from './MatchSummaryCard'
import SearchField from './SearchField'
import MappingDecisionResult from './MappingDecisionResult'
import DecisionSelector from './DecisionSelector'
import ReviewNote from './ReviewNote'
import Propose from './Propose'
import Candidates from './Candidates'
import Search from './Search'
import Discuss from './Discuss'
import ScoreBucketButton from './ScoreBucketButton'
import Concept from './Concept'
import AIAssistantButton from './AIAssistantButton'
import ImportToCollection from './ImportToCollection'
import ProjectLogs from './ProjectLogs';

import './MapProject.scss'
import '../common/ResizablePanel.scss'


// const LOG = {
//   action: '',
//   user: '',
//   description: '',
//   extras: {},
//   created_at: ''
// }

const MapProject = () => {
  const { t } = useTranslation();
  const { toggles, setAlert: baseSetAlert } = React.useContext(OperationsContext);
  const user = getCurrentUser()
  const params = useParams()
  const history = useHistory()
  const bridgeRef = React.useRef()

  // project state
  const [project, setProject] = React.useState(null)
  const [name, setName] = React.useState('')
  const [owner, setOwner] = React.useState(user?.url)
  const [description, setDescription] = React.useState('')
  const [file, setFile] = React.useState(false)
  const [data, setData] = React.useState(false)
  const [columns, setColumns] = React.useState([])
  const [rowStatuses, setRowStatuses] = React.useState({reviewed: [], readyForReview: [], unmapped: []})
  const [decisions, setDecisions] = React.useState({})
  const [decisionFilters, setDecisionFilters] = React.useState([])
  const [matchTypes, setMatchTypes] = React.useState({very_high: 0, high: 0, medium: 0, low: 0, no_match: 0})
  const [matchedConcepts, setMatchedConcepts] = React.useState([]);
  const [otherMatchedConcepts, setOtherMatchedConcepts] = React.useState([]);
  const [bridgeCandidates, setBridgeCandidates] = React.useState([]);
  const [scispacyCandidates, setScispacyCandidates] = React.useState([]);
  const [candidatesToSave, setCandidatesToSave] = React.useState([]);
  const [searchedConcepts, setSearchedConcepts] = React.useState({});
  const [facets, setFacets] = React.useState({});
  const [appliedFacets, setAppliedFacets] = React.useState({});
  const [searchResponse, setSearchResponse] = React.useState({});
  const [algo, setAlgo] = React.useState('llm')
  const [notes, setNotes] = React.useState({})
  const [mapTypes, setMapTypes] = React.useState({})
  const [proposed, setProposed] = React.useState({})
  const [mapSelected, setMapSelected] = React.useState({})
  const [startMatchingAt, setStartMatchingAt] = React.useState(false)
  const [endMatchingAt, setEndMatchingAt] = React.useState(false)
  const [bulkAIAnalysisStartedAt, setBulkAIAnalysisStartedAt] = React.useState(false)
  const [bulkAIAnalysisEndedAt, setBulkAIAnalysisEndedAt] = React.useState(false)
  const [bridgeCandidatesStartedAt, setBridgeCandidatesStartedAt] = React.useState(false)
  const [bridgeCandidatesEndedAt, setBridgeCandidatesEndedAt] = React.useState(false)
  const [scispacyCandidatesStartedAt, setScispacyCandidatesStartedAt] = React.useState(false)
  const [scispacyCandidatesEndedAt, setScispacyCandidatesEndedAt] = React.useState(false)
  const [searchStr, setSearchStr] = React.useState('') // concept search
  const [candidatesOrder, setCandidatesOrder] = React.useState('desc')
  const [candidatesOrderBy, setCandidatesOrderBy] = React.useState('search_meta.search_normalized_score')
  const [matchAPI, setMatchAPI] = React.useState('')
  const [matchAPIToken, setMatchAPIToken] = React.useState('')
  const [semanticBatchSize, setSemanticBatchSize] = React.useState(SEMANTIC_BATCH_SIZE)
  const [reranker, setReranker] = React.useState(false)
  const [bridgeEnabled, setBridgeEnabled] = React.useState(false)
  const [scispacyEnabled, setScispacyEnabled] = React.useState(false)
  const [candidatesScore, setCandidatesScore] = React.useState({recommended: 99, available: 70})
  const [filters, setFilters] = React.useState({})
  const [AIModel, setAIModel] = React.useState('')

  const abortRef = React.useRef(false);

  const [row, setRow] = React.useState(false)
  const [loadingMatches, setLoadingMatches] = React.useState(false)
  const [isLoadingInDecisionView, setIsLoadingInDecisionView] = React.useState(false)
  const [edit, setEdit] = React.useState([]);
  const [configure, setConfigure] = React.useState(!params.projectId);
  const [selectedRowStatus, setSelectedRowStatus] = React.useState('all')
  const [selectedMatchBucket, setSelectedMatchBucket] = React.useState(false)
  const [decisionTab, setDecisionTab] = React.useState('candidates')
  const [algoMenuAnchorEl, setAlgoMenuAnchorEl] = React.useState(null)
  const [searchText, setSearchText] = React.useState('')  // csv row search
  const [selectedCandidatesScoreBucket, setSelectedCandidatesScoreBucket] = React.useState(false)
  const [scoreBucketSortBy, setScoreBucketSortBy] = React.useState('desc')

  const [matchDialog, setMatchDialog] = React.useState(false)
  const [showHighlights, setShowHighlights] = React.useState(false)
  const [showItem, setShowItem] = React.useState(false)
  const [autoMatchUnmappedOnly, setAutoMatchUnmappedOnly] = React.useState(true)
  const [autoRunAIAnalysis, setAutoRunAIAnalysis] = React.useState(false)
  const [alert, setAlert] = React.useState(false)
  const [columnVisibilityModel, setColumnVisibilityModel] = React.useState({})
  const [columnWidth, setColumnWidth] = React.useState({})
  const [logs, setLogs] = React.useState({})
  const [projectLogs, setProjectLogs] = React.useState([])
  const [filterModel, setFilterModel] = React.useState({ items: [] });
  const [retired, setRetired] = React.useState(false)
  const [showProjectLogs, setShowProjectLogs] = React.useState(false)

  // repo state
  const [repo, setRepo] = React.useState(false)
  const [repoVersion, setRepoVersion] = React.useState(false)
  const [mappedSources, setMappedSources] = React.useState([])
  const [locales, setLocales] = React.useState([])
  const [isLoadingLocales, setIsLoadingLocales] = React.useState(false)
  const [versions, setVersions] = React.useState([])
  const [conceptCache, setConceptCache] = React.useState({})
  const [allMapTypes, setAllMapTypes] = React.useState([])
  const [random, setRandom] = React.useState(0)
  const [deleteProject, setDeleteProject] = React.useState(false)
  const [loadingProject, setLoadingProject] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  const [includeDefaultFilter, setIncludeDefaultFilter] = React.useState(true)
  const [analysis, setAnalysis] = React.useState({})
  const [AIModels, setAIModels] = React.useState([])

  // import
  const [openImportToCollection, setOpenImportToCollection] = React.useState(false)
  const [imports, setImports] = React.useState([])

  const [permissionDenied, setPermissionDenied] = React.useState(false)

  /*eslint no-undef: 0*/
  const AI_ASSISTANT_API_URL = window.AI_ASSISTANT_API_URL || process.env.AI_ASSISTANT_API_URL
  const SCISPACY_API_URL = window.SCISPACY_LOINC_API_URL || process.env.SCISPACY_LOINC_API_URL
  const inAIAssistantGroup = Boolean(hasAuthGroup(user, 'mapper_ai_assistant') && AI_ASSISTANT_API_URL)
  const CANDIDATES_LIMIT = reranker ? 30 : 10
  const canBridge = bridgeRef?.current?.canBridge()
  const canScispacy = Boolean(canBridge && SCISPACY_API_URL && toggles.SCISPACY_LOINC_TOGGLE === true)


  // algos - computed based on current language
  const baseAlgos = React.useMemo(() => [
    {id: 'es', label: t('map_project.algorithm_es_label'), description: t('map_project.algorithm_es_description')},
    {id: 'llm', label: t('map_project.algorithm_llm_label'), description: t('map_project.algorithm_llm_description'), disabled: !toggles?.SEMANTIC_SEARCH_TOGGLE},
    {id: 'custom', label: t('map_project.algorithm_custom_label'), description: t('map_project.algorithm_custom_description')}
  ], [t, toggles?.SEMANTIC_SEARCH_TOGGLE])

  const [algos, setAlgos] = React.useState(baseAlgos)

  React.useEffect(() => {
    setAlgos(baseAlgos)
  }, [baseAlgos])


  const [targetSourcesFromRows, setTargetSourcesFromRows] = React.useState({}) //{dataKey: [source1_original_name, source2_original_name]}

  let headers = ['llm', 'custom'].includes(algo) ? SEMANTIC_SEARCH_HEADERS : HEADERS
  if(repoVersion?.properties)
    headers = [...headers, ...compact(repoVersion?.filters?.map(_filter => {
      if(_filter?.code && !['concept_class', 'datatype'].includes(_filter.code))
        return {id: `property__${_filter.code}`, label: `Property: ${_filter.code}`, description: _filter.description || ''}
    }))]

  React.useEffect(() => {
    if(!isEmpty(decisions)) {
      window.addEventListener("beforeunload", alertUser);
      return () => window.removeEventListener("beforeunload", alertUser);
    }
  }, [decisions]);

  React.useEffect(() => {
    fetchMapTypes()
    if(params.projectId && params.owner) {
      fetchAndSetProject()
    }
    fetchAIModels()
  }, [])

  React.useEffect(() => {
    setPermissionDenied(false)
  }, [params.projectId])

  React.useEffect(() => {
    const isDefaultApplied = isRepoDefaultFilterApplied(repoVersion)
    if(project?.id)
      setIncludeDefaultFilter(Boolean(isDefaultApplied))
    else if(!isDefaultApplied && !isEmpty(repoVersion?.meta?.display?.default_filter || {})) {
      setProject({...project, filters: repoVersion?.meta?.display?.default_filter})
      setIncludeDefaultFilter(true)
    }
  }, [repoVersion, project])

  const fetchAndSetProject = () => {
    setLoadingProject(true)
    let url = ['', params.ownerType, params.owner, 'map-projects', params.projectId, ''].join('/')
    APIService.new().overrideURL(url).get().then(response => {
      if(response?.detail) {
        setPermissionDenied(true)
        baseSetAlert({message: response.detail, severity: 'error'})
        setLoadingProject(false)
        return
      }
      setFilters(response.data?.filters || {})
      if(response.data.url) {
        APIService.new().overrideURL(response.data.url).appendToUrl('logs/').get().then(response => {
          setLogs(response.data.logs?.row_logs || [])
          setProjectLogs(response.data.logs?.project_logs || [])
          projectLog({action: 'Opened'})
        })
      }
      if(response.data?.file_url) {
        fetch(response.data.file_url).then(res => res.text()).then(csvText => {
          const workbook = XLSX.read(csvText, { type: "string", raw: true });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const data = XLSX.utils.sheet_to_json(sheet, { raw: false, defval: '' })
          setProjectFromData(data, response.data)
          setAlgo(response?.data?.matching_algorithm || algo)
          if (response?.data.columns?.length > 0) {
            const _columns = response.data.columns.map(col => ({...omit(col, ['hidden'])}))
            setColumns(_columns)
            setTargetSourcesFromRows(getTargetSourcesFromRows(_columns, data))
            let colVisibility = {}
            let colWidth = {}
            response.data.columns.forEach(col => {
              if(col.hidden)
                colVisibility[col.dataKey] = false
              if(col.width) {
                if(isString(col.width)) {
                  let _width = parseInt(col.width.replace('px'))
                  if(!isNaN(_width))
                    col.width = _width
                }
                colWidth[col.dataKey] = col.width
              }
            })
            setColumnVisibilityModel(colVisibility)
            setColumnWidth(colWidth)
          }
          setTimeout(() => {
            let _file = getFileObjectFromRows(response.data.input_file_name)
            setFile(_file)
            setName(response.data?.name || name || file?.name || '')
          }, 500)
          setLoadingProject(false)
        })
      } else {
        setLoadingProject(false)
      }
      setOtherMatchedConcepts(response?.data?.candidates || [])
      setCandidatesToSave(response?.data?.candidates || [])
      setName(response.data?.name || '')
      setDescription(response.data?.description || '')
      setOwner(response.data?.owner_url)
      setRetired(Boolean(response.data?.include_retired))
      setMatchAPI(response.data?.match_api_url)
      setMatchAPIToken(response.data?.match_api_token)
      setReranker(Boolean(response.data?.reranker))
      setBridgeEnabled(Boolean(response.data?.bridge_enabled))
      setScispacyEnabled(Boolean(response.data?.scispacy_enabled))
      if(response.data?.match_api_url)
        setSemanticBatchSize(response.data?.batch_size || SEMANTIC_BATCH_SIZE)
      setCandidatesScore(response.data?.score_configuration)
      setProject(response.data)
      setConfigure(false)
    })
  }

  const isRepoDefaultFilterApplied = version => {
    const defaultFilter = version?.meta?.display?.default_filter || {};
    return !isEmpty(defaultFilter) && Object.keys(defaultFilter).every(key => has((project?.filters || {}), key));
  }

  const fetchMapTypes = () => APIService.orgs('OCL').sources('MapTypes').appendToUrl('concepts/lookup/').get().then(response => setAllMapTypes(response.data?.map(d => d.id)))

  const alertUser = (e) => {
    e.preventDefault();
    e.returnValue = "";
  };

  const rowIndex = row?.__index

  const getColumns = row => {
    let _columns = []
    if(row) {
      _columns = map(row, (value, key) => {
        let width;
        if(['id', 'code'].includes(key.toLowerCase()))
          width = '60px'
        if(['changed by', 'creator'].includes(key.toLowerCase()))
          width = '75px'
        else if(['class', 'concept class', 'datatype'].includes(key.toLowerCase()))
          width = '100px'
        return {label: key, dataKey: key, width: width, original: key }
      })
    }
    return _columns
  }

  const getColumnsForTable = () => {
    let cols = []
    forEach(columns, (column, idx) => {
      const isValidColumn = isValidColumnValue(column.label)
      let headerClass = 'header-valid'
      if(!isValidColumn)
        headerClass = 'header-invalid'
      let widthParams = {}
      if(columns.length < 2)
        widthParams.flex = 1
      if (columnWidth[column.dataKey])
        widthParams.width = columnWidth[column.dataKey]
      else if(column.label.toLowerCase().includes('name') || column.label.toLowerCase().includes('description') || column.label.toLowerCase().includes('synonyms'))
        widthParams.width = 300
      else if(column.label.toLowerCase().includes('uuid') || column.label.toLowerCase().includes('external'))
        widthParams.width = 300
      else
        widthParams.width = 150
      cols.push({
        field: column.dataKey,
        headerName: column.label || column.original,
        headerClassName: headerClass,
        renderHeader: () => {
          if(isValidColumn) {
            const isFiltered = filterModel.items.some((item) => item.field === column.dataKey && item.value);
            return <div>
                     <div>
                       <span style={{ flexGrow: 1 }}>{column.original}</span>
                       {
                       isFiltered &&
                           <Tooltip title={t('map_project.clear_filter')}>
                             <IconButton
                               size="small"
                               onClick={(e) => {
                                 e.stopPropagation(); // prevent sorting on click
                                 const updatedItems = filterModel.items.filter((item) => item.field !== column.dataKey);
                                 setFilterModel({ ...filterModel, items: updatedItems });
                               }}
                             >
                               <ClearIcon fontSize="small" />
                             </IconButton>
                           </Tooltip>
                       }
                     </div>
                     <div><Chip color='warning' variant='outlined' size='small' label={column.label} sx={{fontSize: '12px', margin: '2px 0'}} /></div>
                   </div>
          }
        },
        renderCell: (params) => {
          if(parseInt(idx) === 0) {
            let val = has(params.row, column.dataKey + '__updated') ? params?.row[column.dataKey + '__updated'] : params.value
            const _state = VIEWS[getStateFromIndex(params.row.__index)]
            return <span style={{display: 'flex'}}>
                     <Tooltip title={_state.label}>
                       <Typography component='span' sx={{marginRight: '8px', color: _state.color + '.main'}}>
                         {_state.icon}
                       </Typography>
                     </Tooltip>
                     <span>{val}</span>
                   </span>
          }
        },
        valueGetter: (value, _row) => has(_row, column.dataKey + '__updated') ? _row[column.dataKey + '__updated'] : value,
        ...widthParams
      })
    })
    cols.push({
      field: '_targetCode_',
      headerName: t('map_project.target_code'),
      width: columnWidth['_targetCode_'] || 300,
      renderCell: params => {
        const targetConcept = mapSelected[params.row.__index]
        if(targetConcept?.url) {
          return <Concept key={`${params.row.__index}-${targetConcept.url}`} sx={{padding: 0}} repoVersion={repoVersion} notClickable firstChild concept={targetConcept} noScore onCardClick={false} noSynonymPrefix />
        }
      }
    })
    return cols
  }

  const getTargetSourcesFromRows = (cols, _data) => {
    let sources = {};
    let __data = _data || data
    filter(cols, {label: 'Mapping: List'})?.forEach(col => {
      let values = map(__data, row => row[col.dataKey].split(',').map(source => get(source?.trim()?.split(':'), '0')))
      sources[col.dataKey] = uniq(compact(flatten(values)))
    })
    filter(cols, {label: 'Mapping: Code'})?.forEach(col => {
      sources[col.dataKey] = col.dataKey.toLowerCase().replace('_code', '')
    })
    return sources
  }

  const getMapConfigs = () => {
    let configs = []
    forEach(filter(columns, col => ['Mapping: Code', 'Mapping: List'].includes(col?.label)), col => {
      const isList = col.label === 'Mapping: List'
      let config = {
        type: isList ? 'mapping-list' : 'mapping-code',
        input_column: col.dataKey,
      }
      if(isList)
        config.target_urls = col.targetSource
      else
        config.target_source_url = get(values(col.targetSource), '0')
      if((isList && !isEmpty(config.target_urls)) || (!isList && config.target_source_url))
        configs.push(config)
    })
    return configs
  }

  const updateColumn = (position, newValue, key) => {
    let cols = {...columns}
    cols[position][key || 'label'] = newValue || ''
    setColumns(cols)
    if(key !== 'targetSource')
      setTargetSourcesFromRows(getTargetSourcesFromRows(cols))
  }

  const resetState = () => {
    setRowStatuses({reviewed: [], readyForReview: [], unmapped: []})
    setDecisions({})
    setDecisionFilters([])
    setMatchTypes({very_high: 0, high: 0, medium: 0, low: 0, no_match: 0})
    setMatchedConcepts([])
    setOtherMatchedConcepts([])
    setSearchedConcepts({})
    setFacets({})
    setSearchResponse({})
    setNotes({})
    setMapTypes({})
    setProposed({})
    setMapSelected({})
    setStartMatchingAt(false)
    setEndMatchingAt(false)
    setBulkAIAnalysisStartedAt(false)
    setBulkAIAnalysisEndedAt(false)
    setBridgeCandidatesStartedAt(false)
    setBridgeCandidatesEndedAt(false)
    setScispacyCandidatesStartedAt(false)
    setScispacyCandidatesEndedAt(false)
    setSearchStr('')
    setRow(false)
    setLoadingMatches(false)
    setEdit([])
    setSelectedRowStatus('all')
    setDecisionTab('candidates')
    setAlgoMenuAnchorEl(null)
    setSearchText('')
    setShowItem(false)
    setAutoMatchUnmappedOnly(true)
    setAlert(false)
    setSelectedCandidatesScoreBucket(false)
    setScoreBucketSortBy('desc')
  }

  const handleFileUpload = event => {
    resetState()
    const file = event.target.files[0];
    setFile(file)
    if(!name)
      setName(file?.name || '')
    const reader = new FileReader();
    reader.onload = (e) => {
      const workbook = XLSX.read(e.target.result, { type: 'binary', raw: true, cellText: true, codepage: 65001 });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      setProjectFromData(XLSX.utils.sheet_to_json(sheet, { raw: false, defval: '' }))
    };
    reader.readAsBinaryString(file);
  };

  const setProjectFromData = (jsonData, projectData) => {
    let _data = []

    const reservedKeys = ['__Concept ID__', '__Concept URL__', '__Match Score__', '__Match Type__', '__Decision__', '__Note__', '__State__', '__Proposed__', '__Repo Version__', '__Repo ID__', '__Repo URL__', '__Map Type__']
    const optionalReservedKeys = ['__Concept Name__']
    let columns = keys(jsonData[0])
    let isResuming = params?.projectId || every(reservedKeys, key => columns.includes(key))
    let _decisions = {}
    let _mapSelected = {}
    let _notes = {}
    let _mapTypes = {}
    let _proposed = {}
    let _repo = null
    let _states = {...rowStatuses}
    forEach(jsonData, (data, index) => {
      data.__index = index
      if(isResuming) {
        let repo = {id: data['__Repo ID__'], version: data['__Repo Version__'], url: dropVersion(data['__Repo URL__']), version_url: data['__Repo URL__']}
        let concept = {id: data['__Concept ID__'], display_name: data['__Concept Name__'], url: data['__Concept URL__'], search_meta: {search_normalized_score: data['__Match Score__'], match_type: snakeCase(data['__Match Type__'])}, repo: repo}
        if(concept?.id) {
          _mapSelected[index] = concept
          _repo = repo
        }
        let rowStateLabel = data['__State__']
        let state = keys(pickBy(VIEWS, info => info.label === rowStateLabel))[0]
        _states[state] = _states[state] || []
        _states[state].push(index)
        _decisions[index] = data['__Decision__'] === t('map_project.none') ? undefined : data['__Decision__']
        _notes[index] = data['__Note__']
        _mapTypes[index] = data['__Map Type__']
        _proposed[index] = data['__Proposed__'] ? JSON.parse(data['__Proposed__']) : undefined
        data = omit(data, [...reservedKeys, ...optionalReservedKeys])
      }
      _data.push(data)
    })
    if(isResuming) {
      setNotes(_notes)
      setMapTypes(_mapTypes)
      setDecisions(_decisions)
      setMapSelected(_mapSelected)
      setRowStatuses(_states)
      setProposed(_proposed)

      let repoURL = projectData?.target_repo_url || _repo?.url
      let repoVersion = projectData?.target_repo_url ? URIToParentParams(projectData?.target_repo_url, true)?.repoVersion || 'HEAD' : _repo?.version
      if(repoURL) {
        fetchRepo(repoURL, _repo)
        fetchVersions(repoURL, repoVersion)
      }
    }

    setData(_data);
    if(!isResuming)
      setRowStatuses(prev => {
        prev.unmapped = map(_data, '__index')
        return prev
      })

    let cols = getColumns(omit(_data[0], ['__index']))
    setColumns(cols)
  }

  const getReferencesForImport = (collection, scope, cascadeMethod, transformReferences) => {
    const approvedOnly = scope === 'approved'
    return map(mapSelected, (data, index) => {
      if(approvedOnly && !rowStatuses.reviewed.includes(parseInt(index)))
        return null
      let url = data?.url

      if(data?.repo?.version_url)
        url = data.repo.version_url + 'concepts/' + data.id + '/'
      else if(data?.repo?.url)
        url = data.repo.url + 'concepts/' + data.id + '/'
      const payload = {
        collection_url: collection.url,
        type: 'Reference',
        data: {expressions: [url]}
      }
      if(transformReferences)
        payload.__transform = 'extensional'
      if(['sourcemappings', 'sourcetoconcepts'].includes(cascadeMethod))
        payload.__cascade = cascadeMethod
      else if(cascadeMethod === 'OpenMRSCascade')
        payload.__cascade = {
          "method": "sourcetoconcepts",
          "cascade_levels": "*",
          "map_types": "Q-AND-A,CONCEPT-SET",
          "return_map_types": "*"
        }
      return payload
    })
  }

  const onImport = (collection, scope, cascadeMethod, transformReferences) => {
    setOpenImportToCollection(false)
    const references = compact(getReferencesForImport(collection, scope, cascadeMethod, transformReferences))
    if(references.length > 0) {
      const payload = {data: references}
      APIService.new().overrideURL('/importers/bulk-import/').post(payload).then(response => {
        if(response.status === 202) {
          setAlert({message: t('map_project.import_accepted'), duration: 5, severity: 'success'})
          const id = response.data.id
          if(['STARTED', 'PENDING', 'RECEIVED'].includes(response.data.state)) {
            response.data.interval = setInterval(() => updateImportStatus(id), 1000)
          }
          setImports([...imports, response.data])
          projectLog({
            action: 'saved_to_collection',
            extras: {collection_url: collection.url, id: collection.id, task_id: id}
          })
        } else {
          setAlert({message: t('map_project.import_failed'), duration: 2, severity: 'error'})
        }
      })
    }
  }

  const updateImportStatus = importId => {
    if(!importId)
      return
    APIService.new().overrideURL(`/importers/bulk-import/?task=${importId}`).get().then(response => {
      setImports(prev => {
        let index = findIndex(prev, {id: importId})
        let oldResponse = prev[index]
        if(oldResponse.interval && !['STARTED', 'PENDING', 'RECEIVED'].includes(response?.data?.state))
          clearInterval(oldResponse.interval)
        const updated = [...prev];
        updated[index] = {...response.data, interval: oldResponse.interval}
        return updated
      })
    })
  }

  const downloadImportReport = importId => {
    if(!importId)
      return
    APIService.new().overrideURL('/importers/bulk-import/').get(null, null, {task: importId, result: 'json'}).then(res => {
      if(get(res, 'data')) {
        downloadObject(JSON.stringify(res.data, undefined, 2), 'application/json', `${importId}.json`)
      }
    })
  }

  const onSave = () => {
    setIsSaving(true)
    const f = getFileObjectFromRows()
    const selected = map(mapSelected, (data, i) => {
      return {
        url: data?.url,
        repoURL: data?.repo?.version_url || data?.repo?.url,
        mapType: mapTypes[i],
        state: VIEWS[getStateFromIndex(parseInt(i))].label,
        decision: decisions[i] || 'None',
        note: notes[i] || undefined,
        proposed: isEmpty(proposed[i]) ? undefined : JSON.stringify(proposed[i]),
        rowIndex: i
      }
    })
    const candidates = []
    forEach(candidatesToSave, _candidates => {
      if(_candidates?.results?.length) {
        candidates.push({..._candidates, results: _candidates.results.slice(0, 10)})
      }
    })
    const formData = new FormData();
    formData.append('file', f);
    formData.append('candidates', JSON.stringify(candidates))
    formData.append('matches', JSON.stringify(selected))
    formData.append('name', name || f.name)
    formData.append('description', description)
    formData.append('columns', JSON.stringify(map(columns, col => ({...col, hidden: columnVisibilityModel[col.dataKey] === false, width: columnWidth[col.dataKey] || undefined}))))
    if(repoVersion?.version_url)
      formData.append('target_repo_url', repoVersion.version_url)
    formData.append('matching_algorithm', algo)
    formData.append('score_configuration', JSON.stringify(candidatesScore))
    formData.append('include_retired', retired)
    if(matchAPI && algo === 'custom') {
      formData.append('match_api_url', matchAPI)
      formData.append('match_api_token', matchAPIToken)
      formData.append('batch_size', semanticBatchSize)
    } else {
      formData.append('match_api_url', '')
      formData.append('match_api_token', '')
    }
    formData.append('filters', JSON.stringify(getFilters()))
    formData.append('reranker', reranker)
    formData.append('bridge_enabled', bridgeEnabled)
    formData.append('scispacy_enabled', scispacyEnabled)
    const isUpdate = Boolean(project?.id)
    let service = APIService.new().overrideURL(owner).appendToUrl('map-projects/')
    if(isUpdate)
      service = service.appendToUrl(project.id + '/').put(formData, null, {"Content-Type": "multipart/form-data"})
    else
      service = service.post(formData, null, {"Content-Type": "multipart/form-data"})

    service.then(response => {
      setIsSaving(false)
      if(response?.data?.id) {
        projectLog({action: isUpdate ? 'Updated' : 'Created'})
        setConfigure(false)
        setProject(response.data)
        if(response.data.url)
          history.push(response.data.url)
        baseSetAlert({severity: 'success', message: t('map_project.successfully_saved'), duration: 2000})

        APIService.new().overrideURL(response.data.url).appendToUrl('logs/').post({logs: {row_logs: logs, project_logs: projectLogs}}).then(() => {})
      }
    })
  }

  const log = (data, index) => {
    let idx = index === undefined ? rowIndex : index
    setLogs(prev => ({...prev, [idx]: [{...data, created_at: moment().toDate(), user: user.username || user.id}, ...(prev[idx] || [])]}))
  }

  const projectLog = data => {
    const newLog = {...data, created_at: moment().toDate(), user: user.username || user.id}
    const newLogs = [newLog, ...projectLogs]
    setProjectLogs(prev => [newLog, ...prev])
    if(project?.url)
      APIService.new().overrideURL(project.url).appendToUrl('logs/').post({logs: {row_logs: logs, project_logs: newLogs}}).then(() => {})
  }

  const fetchRepo = (url, _repo) => APIService.new().overrideURL(url).get().then(response => setRepo(response.data?.id ? response.data : _repo))

  const fetchMappedSources = url => {
    let limit = 25

    const recurse = (offset, page, fetchedSoFar, accumulated) => {
      _fetchMappedSources(url, limit, offset, page, response => {
        const data = response?.data || []
        const updated = [...accumulated, ...data]

        setMappedSources(updated)

        const fetched = fetchedSoFar + data.length
        const numFound = parseInt(response?.headers?.num_found || 0)

        if (fetched < numFound) {
          recurse(offset + limit, page + 1, fetched, updated)
        }
      })
    }

    recurse(0, 1, 0, [])
  }

  const fetchLocaleDistribution = url => {
    if(!url)
      return
    setIsLoadingLocales(true)
    APIService.new().overrideURL(url).appendToUrl('summary/').get(null, null, {verbose: true, distribution: 'name_locale_list'}).then(response => {
      setLocales(response?.data?.distribution?.name_locale_list || [])
      setIsLoadingLocales(false)
    })
  }

  const _fetchMappedSources = (
    url, limit, offset, page, callback
  ) => {
    APIService.new().overrideURL(url).appendToUrl('mapped-sources/').get(null, null, {excludeSelf: false, brief: true, limit: limit || 25, offset: offset || 0, page: page || 1}).then(callback)
  }

  const onRepoVersionChange = version => {
    setRepoVersion(version)
    if(version?.version_url) {
      fetchLocaleDistribution(version.version_url)
      fetchMappedSources(version.version_url)
      updateAlgosByRepoVersion(version)
    }
  }

  const updateAlgosByRepoVersion = version => {
    const newAlgos = [...algos]
    const isLLMAlgoAllowed = version?.match_algorithms?.includes('llm')
    newAlgos[1].disabled = !isLLMAlgoAllowed
    setAlgos(newAlgos)
    if(!isLLMAlgoAllowed && algo === 'llm') {
      onAlgoSelect('es')
    }
  }

  const onAlgoButtonClick = event => setAlgoMenuAnchorEl(algoMenuAnchorEl ? null : event.currentTarget)

  const onAlgoSelect = newAlgo => {
    setAlgo(newAlgo)
    setAlgoMenuAnchorEl(null)
  }

  const getFilters = () => {
    let defaultFilters = (repoVersion?.meta?.display?.default_filter || {})
    let allFilters = {...defaultFilters, ...omitBy(filters, value => !value)}
    return includeDefaultFilter ? allFilters : omit(allFilters, Object.keys(defaultFilters))
  }

  const getPayloadForMatching = (rows, _repo, _filters) => {
    return {
      rows: map(rows, row => prepareRow(row)),
      target_repo_url: repoVersion?.version_url || _repo.version_url || _repo.url,
      target_repo: {
        'owner': _repo.owner,
        'owner_type': _repo.owner_type,
        'source_version': repoVersion?.id || _repo.version || _repo.id,
        'source': _repo.short_code || _repo.id
      },
      map_config: getMapConfigs(),
      filter: rows.length > 1 ? getFilters() : getFacetQueryParam(isEmpty(_filters) ? appliedFacets[rows[0].__index] : _filters)
    }
  }

  const getMatchAPIService = () => {
    let service;
    if(matchAPI && algo === 'custom') {
      service = APIService.new()
      service.URL = matchAPI
    } else {
      service = APIService.concepts().appendToUrl('$match/')
    }
    return service
  }

  const getRowsResults = async (rows) => {
    abortRef.current = false;

    const CHUNK_SIZE = ['llm', 'custom'].includes(algo) ? semanticBatchSize : ES_BATCH_SIZE; // Number of rows per batch
    const MAX_CONCURRENT_REQUESTS = 2; // Number of parallel API requests allowed
    if(autoMatchUnmappedOnly)
      rows = filter(rows, row => rowStatuses.unmapped.includes(row.__index))
    else
      rows = filter(rows, row => !rowStatuses.reviewed.includes(row.__index))
    const rowChunks = chunk(rows, CHUNK_SIZE);

    // Function to process a single batch
    const processBatch = async (_repo, rowBatch) => {
      if (abortRef.current) return [];

      const payload = getPayloadForMatching(rowBatch, _repo)
      payload.rows = filter(payload.rows, row => values(omit(row, '__index')).length > 0)
      if(!payload.rows.length) {
        setAlert({message: t('map_project.no_valid_columns_for_matching')})
        setTimeout(() => setAlert(false), 6000)
        return []
      }

      let extraParams = {
        limit: CANDIDATES_LIMIT,
        verbose: true,
        includeMappings: true,
        mappingBrief: true,
        mapTypes: 'SAME-AS,SAME AS,SAME_AS',
        reranker: reranker
      }

      try {
        const service = getMatchAPIService()
        const response = await service.post(
          payload,
          (algo === 'custom' && matchAPI && matchAPIToken) ? matchAPIToken : null,
          null,
          {
            includeSearchMeta: true,
            semantic: ['llm', 'custom'].includes(algo),
            ...extraParams
         }
        );

        return response.data || [];
      } catch {
        return [];
      }
    };

    // Function to handle concurrency
    const processWithConcurrency = async (_repo) => {
      const queue = rowChunks.slice(); // Copy of all chunks to be processed
      const activeRequests = new Set();

      while (queue.length > 0 || activeRequests.size > 0) {
        // Fill activeRequests up to MAX_CONCURRENT_REQUESTS
        while (queue.length > 0 && activeRequests.size < MAX_CONCURRENT_REQUESTS) {
          if (abortRef.current) return;
          const rowBatch = queue.shift();
          const promise = processBatch(_repo, rowBatch).then((data) => {
            let matchTypes = map(data, 'results.0.search_meta.match_type')
            let counts = countBy(matchTypes)
            setMatchTypes(prev => ({
              very_high: prev.very_high + (counts?.very_high || 0),
              high: prev.high + (counts?.high || 0),
              medium: prev.medium + (counts?.medium || 0),
              low: prev.low + (counts?.low || 0),
              no_match: prev.no_match + (sum(values(omit(counts, ['very_high', 'high', 'medium', 'low']))) || 0)
            }));
            setRowStatuses(prev => {
              forEach(data, concept => {
                if(get(concept, 'results.0.search_meta.match_type') === 'very_high') {
                  let _concept = {...concept.results[0], repo: {..._repo, version: repoVersion?.id || _repo.version, version_url: repoVersion?.version_url || _repo.version_url}}
                  setMapSelected(_prev => {
                    _prev[concept.row.__index] = _concept
                    return _prev
                  })
                  const mapType = get(concept, 'results.0.search_meta.map_type') || 'SAME-AS'
                  prev.readyForReview = uniq([...prev.readyForReview, concept.row.__index])
                  setDecisions(prev => ({...prev, [concept.row.__index]: 'map'}))
                  setMapTypes(prev => ({...prev, [concept.row.__index]: mapType}))
                  log({action: 'auto-matched', extras: {repoVersion: repoVersion?.version_url || _repo.version_url, name: getConceptLabel(_concept), map_type: mapType}}, concept.row.__index)
                } else
                  prev.unmapped = uniq([...prev.unmapped, concept.row.__index])
              })
              return prev
            })
            forEach(data, concept => {
              setOtherMatchedConcepts(prev => {
                return [...reject(prev, c => c.row.__index === concept.row.__index), concept]
              })
              setCandidatesToSave(prev => {
                return [...reject(prev, c => c.row.__index === concept.row.__index), concept]
              })
            })
            setMatchedConcepts(prev => [...prev, ...data]);
            activeRequests.delete(promise); // Remove from active set after completion
          });
          activeRequests.add(promise);
        }

        // Wait for at least one request to complete before continuing
        await Promise.race(activeRequests);
      }
    };

    let action = 'auto_matched'
    let subActions = []
    if(autoMatchUnmappedOnly)
      subActions.push('unmatched_only')
    if(reranker)
      subActions.push('with_reranker')
    if(bridgeEnabled)
      subActions.push('with_bridge_candidates')
    if(scispacyEnabled)
      subActions.push('with_scispacy_candidates')
    if(inAIAssistantGroup && autoRunAIAnalysis)
      subActions.push('with_ai_analysis')

    setRowStatuses(prev => {
      prev.unmapped = []
      if(!autoMatchUnmappedOnly)
        prev.readyForReview = []
      return prev
    })
    await processWithConcurrency(repo);

    setTimeout(() => {
      if(bridgeEnabled)
        fetchBulkBridgeCandidates(rows)
      else if(scispacyEnabled)
        fetchBulkScispacyCandidates(rows)
      else if(inAIAssistantGroup && autoRunAIAnalysis)
        setTimeout(() => runBulkAIAnalysis(rows), 1000)
      else {
        setLoadingMatches(false)
        setEndMatchingAt(moment())
      }
    }, 1000)
    projectLog({action: action, extras: {sub_actions: subActions}})
  };

  const otherMatchedConceptsRef = React.useRef([]);
  const bridgeCandidatesRef = React.useRef([]);
  const scispacyCandidatesRef = React.useRef([]);

  React.useEffect(() => {
    otherMatchedConceptsRef.current = otherMatchedConcepts;
  }, [otherMatchedConcepts]);

  React.useEffect(() => {
    if(bridgeEnabled && canBridge === false)
      setBridgeEnabled(false)
    if(scispacyEnabled && canBridge === false && !canScispacy)
      setScispacyEnabled(false)
  }, [canBridge, bridgeEnabled, canScispacy, scispacyEnabled])

  React.useEffect(() => {
    bridgeCandidatesRef.current = bridgeCandidates;
  }, [bridgeCandidates]);

  React.useEffect(() => {
    scispacyCandidatesRef.current = scispacyCandidates;
  }, [scispacyCandidates]);

  const runBulkAIAnalysis = async (_rows) => {
    setLoadingMatches(true)
    setBulkAIAnalysisStartedAt(moment())
    for (let index = 0; index < _rows.length; index++) {
      if (abortRef.current) break;

      await fetchRecommendation(_rows[index]); // wait for completion
      if(index !== _rows.length -1)
        await new Promise(resolve => setTimeout(resolve, 10000)); // 10s delay
    }
    const now = moment()
    setBulkAIAnalysisEndedAt(now)
    setEndMatchingAt(now)
    setLoadingMatches(false)
  }

  const fetchBulkBridgeCandidates = async (_rows) => {
    setLoadingMatches(true)
    setBridgeCandidatesStartedAt(moment())
    for (let index = 0; index < _rows.length; index++) {
      if (abortRef.current) break;

      await fetchBridgeCandidates(_rows[index]); // wait for completion
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1s delay
    }
    const now = moment()
    setBridgeCandidatesEndedAt(now)
    if(scispacyEnabled) {
      fetchBulkScispacyCandidates(_rows)
    }
    else if(inAIAssistantGroup && autoRunAIAnalysis)
      setTimeout(() => runBulkAIAnalysis(_rows), 1000)
    else {
      setEndMatchingAt(now)
      setLoadingMatches(false)
    }
  }

  const fetchBulkScispacyCandidates = async (_rows) => {
    setLoadingMatches(true)
    setScispacyCandidatesStartedAt(moment())
    for (let index = 0; index < _rows.length; index++) {
      if (abortRef.current) break;

      await fetchScispacyCandidates(_rows[index]); // wait for completion
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1s delay
    }
    const now = moment()
    setScispacyCandidatesEndedAt(now)
    if(inAIAssistantGroup && autoRunAIAnalysis)
      setTimeout(() => runBulkAIAnalysis(_rows), 1000)
    else {
      setEndMatchingAt(now)
      setLoadingMatches(false)
    }
  }

  const isRunningBulkAnalysis = bulkAIAnalysisEndedAt ? moment().isBetween(bulkAIAnalysisStartedAt, bulkAIAnalysisEndedAt) : Boolean(bulkAIAnalysisStartedAt)
  const isRunningBulkBridgeCandidates = bridgeCandidatesEndedAt ? moment().isBetween(bridgeCandidatesStartedAt, bridgeCandidatesEndedAt) : Boolean(bridgeCandidatesStartedAt)
  const isRunningBulkScispacyCandidates = scispacyCandidatesStartedAt ? moment().isBetween(scispacyCandidatesStartedAt, scispacyCandidatesEndedAt) : Boolean(scispacyCandidatesStartedAt)

  const fetchVersions = (url, _selectedVersion) => {
    APIService.new().overrideURL(dropVersion(url)).appendToUrl('versions/?verbose=true').get().then(response => {
      let _versions = response.data
      setVersions(_versions)
      if(_selectedVersion) {
        const _version = find(_versions, {id: _selectedVersion})
        onRepoVersionChange(_version)
      }
      else if(_versions?.length === 1)
        onRepoVersionChange(_versions[0])
      else {
        let releasedVersion = find(_versions, {released: true})
        if(releasedVersion)
          onRepoVersionChange(releasedVersion)
      }
    })
  }

  const onRepoChange = (newRepo) => {
    setRepo(newRepo)
    if(newRepo?.url) {
      fetchVersions(newRepo.url)
    } else {
      setVersions([])
      setRepoVersion(false)
      setMappedSources([])
    }
  }

  const prepareRow = (csvRow, additional=false) => {
    let row = {}
    let metadata = {}
    forEach(csvRow,  (value, key) => {
      if((value === 0 || value) && !has(csvRow, key + '__updated')) {
        const column = find(columns, {original: key.replace('__updated', '')}) || find(columns, {dataKey: key.replace('__updated', '')})
        key = column?.label || key
        const dataKey = column?.dataKey || key
        if(columnVisibilityModel[dataKey] !== false && (dataKey === '__index' || isValidColumnValue(column?.label))) {
          let newValue = value
          let newKey = key === '__index' ? key : snakeCase(key.toLowerCase())
          let isList = key === '__index' ? false : newValue.includes('\n')
          if(['Mapping: Code', 'Mapping: List'].includes(column?.label))
            newKey = column.dataKey

          if(isList)
            newValue = newValue.split('\n')
          if(key.includes('__updated'))
            newKey = key.replace('__updated', '')
          if(newKey.includes('class'))
            newKey = 'concept_class'
          if(newKey.includes('datatype'))
            newKey = 'datatype'
          if(newKey === 'set_members')
            newKey = 'other_map_codes'
          if(newKey === 'same_as')
            newKey = 'same_as_map_codes'
          if(newKey.startsWith('property_'))
            newKey = newKey.replace('property_', 'properties__')
          if(isList)
            row[newKey] = [...(row[newKey] || []), ...newValue]
          else
            row[newKey] = newValue
        } else if(additional && !key?.startsWith('__')) {
          metadata[key] = value
        }
      }
    })
    if(row.name) {
      row.synonyms = compact(flatten([row.synonyms]))
      if(!row.synonyms.includes(row.name))
        row.synonyms = [...row.synonyms, row.name]
      if(row.name.includes('%') && !row.properties__property && !row.properties__PROPERTY && repoVersion.url === '/orgs/Regenstrief/sources/LOINC/')
        row.properties__PROPERTY = 'NFr'
    }
    return additional ? {row: row, metadata: metadata} : row
  }

  const isAnyValidColumn = () => Boolean(find(columns, column => isValidColumnValue(column.label)))

  const isValidColumnValue = value => {
    if(!value)
      return false
    if(value.toLowerCase().includes('class'))
      return true
    if(find(headers, val => val.label.toLowerCase() === value.toLowerCase()))
      return true
    return false
  }

  const getValidColumns = () => filter(columns, column => isValidColumnValue(column.label))

  const onGetCandidates = event => {
    event.stopPropagation()
    event.preventDefault()
    setMatchDialog(true)
  }

  const onGetCandidatesSubmit = event => {
    event.stopPropagation()
    event.preventDefault()
    setAlert(false)
    if(isAnyValidColumn()){
      setStartMatchingAt(moment())
      setBulkAIAnalysisStartedAt(null)
      setBulkAIAnalysisEndedAt(null)
      setBridgeCandidatesStartedAt(null)
      setBridgeCandidatesEndedAt(null)
      setScispacyCandidatesStartedAt(null)
      setScispacyCandidatesEndedAt(null)
      setLoadingMatches(true)
      getRowsResults(data)
    } else {
      setAlert({message: t('map_project.no_valid_columns_for_matching')})
      setTimeout(() => setAlert(false), 10000)
    }
    setMatchDialog(false)
  }

  const showMatchSummary = Boolean(data?.length && (loadingMatches || matchedConcepts?.length))
  const getMatchingDuration = (start, end) => {
    if(!end)
      end = moment()
    if(!start)
      return false
    return `${moment.duration(end.diff(start)).as('minutes').toFixed(2)} mins`;
  }

  const getCandidatesButtonLabel = () => {
    const matchingDuration = getMatchingDuration(startMatchingAt, endMatchingAt)
    if(loadingMatches || matchedConcepts?.length)
      return `${t('map_project.auto_match')} (${matchingDuration})`
    return t('map_project.auto_match')
  }

  const getBulkBridgeCandidatesButtonLabel = () => {
    const matchingDuration = getMatchingDuration(bridgeCandidatesStartedAt, bridgeCandidatesEndedAt)
    if(loadingMatches || bridgeCandidates?.length)
      return `${t('map_project.bridge_candidates')} (${matchingDuration})`
    return t('map_project.bridge_candidates')
  }

  const getBulkScispacyCandidatesButtonLabel = () => {
    const matchingDuration = getMatchingDuration(scispacyCandidatesStartedAt, scispacyCandidatesEndedAt)
    if(loadingMatches || scispacyCandidates?.length)
      return `${t('map_project.scispacy_candidates')} (${matchingDuration})`
    return t('map_project.scispacy_candidates')
  }

  const getBulkAIAnalysisButtonLabel = () => {
    const matchingDuration = getMatchingDuration(bulkAIAnalysisStartedAt, bulkAIAnalysisEndedAt)
    if(loadingMatches || !isEmpty(analysis))
      return `${t('map_project.ai_analysis')} (${matchingDuration})`
    return t('map_project.ai_analysis')
  }

  const onMatchTypeChange = bucket => setSelectedMatchBucket(prev => prev === bucket ? false : bucket)

  const getRows = () => {
    let rows = data?.length ? [...data] : []
    if(selectedRowStatus !== 'all')
      rows = filter(rows, r => rowStatuses[selectedRowStatus].includes(r.__index))
    if(selectedMatchBucket) {
      let getIndex = concept => {
        if(selectedMatchBucket === 'no_match')
          return (!concept?.results?.length || !['very_high', 'high', 'medium', 'low'].includes(concept.results[0].search_meta.match_type)) ? concept.row.__index : null
        return (concept?.results?.length && concept.results[0].search_meta.match_type === selectedMatchBucket) ? concept.row.__index : null
      }
      const rowIndexes = map(matchedConcepts, getIndex)
      rows = filter(rows, r => rowIndexes.includes(r.__index))
    }
    if(searchText)
      rows = filter(rows, row =>
        find(values(row), v =>
          v?.toString().toLowerCase().includes(searchText.trim().toLowerCase())
        )
      )
    if(decisionFilters?.length > 0) {
      const hasNone = decisionFilters.includes('none')
      let indexes = keys(pickBy(decisions, value => (hasNone && !value) || decisionFilters.includes(value)))
      rows = filter(rows, row => indexes.includes(row.__index.toString()))
    }
    if(selectedCandidatesScoreBucket) {
      let minScore = 0
      let maxScore = 100.1
      let noScore = false
      let rowIndexes = []
      if(selectedCandidatesScoreBucket === 'low_ranked' ) {
        minScore = -0.1
        maxScore = candidatesScore.available
        noScore = true
      }
      else if(selectedCandidatesScoreBucket === 'available') {
        minScore = candidatesScore.available
        maxScore = candidatesScore.recommended
      }
      else if(selectedCandidatesScoreBucket === 'recommended') {
        minScore = candidatesScore.recommended
      }
      if(minScore) {
        rowIndexes = Object.entries(mapSelected)
          .filter(([, v]) => {
            let score = parseFloat(v?.search_meta?.search_normalized_score || 0)
            return isNumber(score) ? score >= minScore && score < maxScore : noScore
          })
          .sort((a, b) => {
            let aScore = parseFloat(a[1].search_meta.search_normalized_score || 0)
            let bScore = parseFloat(b[1].search_meta.search_normalized_score || 0)
            if(noScore) {
              aScore = aScore || 0
              bScore = bScore || 0
            }

            return scoreBucketSortBy === 'asc' ? aScore - bScore : bScore - aScore
          })
          .map(([k]) => k);
      }
      if(rowIndexes?.length) {
        const orderMap = Object.fromEntries(rowIndexes.map((idx, pos) => [idx, pos]));
        rows = rows.filter(row => rowIndexes.includes(row.__index.toString()))
        rows = rows.sort(
          (a, b) => orderMap[a.__index] - orderMap[b.__index]
        );
      }

    }
    return rows
  }

  const lowRankedCount = filter(mapSelected, target => !target?.search_meta?.search_normalized_score || target?.search_meta?.search_normalized_score < candidatesScore.available)?.length
  const availableCount = filter(mapSelected, target => target?.search_meta?.search_normalized_score >= candidatesScore.available && target?.search_meta?.search_normalized_score < candidatesScore.recommended)?.length
  const recommendedCount = filter(mapSelected, target => target?.search_meta?.search_normalized_score >= candidatesScore.recommended)?.length

  const getStateFromIndex = index => {
    if(rowStatuses.reviewed.includes(index))
      return 'reviewed'
    if(rowStatuses.readyForReview.includes(index))
      return 'readyForReview'
    return 'unmapped'
  }

  const onDownloadClick = () => {
    const workbook = getWorkbook()
    XLSX.writeFile(workbook, `${name || t('map_project.matched')}.${moment().format('YYYYMMDDHHmmss')}.csv`, { compression: true });
    projectLog({action: 'Downloaded'})
  }

  const getFileObjectFromRows = name => {
    const workbook = getWorkbook()
    const wbout = XLSX.write(workbook, {
      bookType: 'csv',  // or 'xlsx' if needed
      type: 'array',    // get it as an ArrayBuffer
      compression: true
    });
    const blob = new Blob([wbout], { type: 'text/csv;charset=utf-8;' });
    return new File([blob], name || file.name, {type: 'text/csv'})
  }

  const getWorkbook = () => {
    const worksheet = XLSX.utils.json_to_sheet(getRowsForDownload());
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, t('map_project.dates'));
    return workbook
  }

  const getTop10RowCandidates = (index, removeNull=false) => {
    let _candidates = find(otherMatchedConcepts, c => c.row?.__index === index)?.results || []
    let _bridgeCandidates = find(bridgeCandidates, c => c.row?.__index === index)?.results || []
    let _scispacyCandidates = find(scispacyCandidates, c => c.row?.__index === index)?.results || []
    let __all = [...times(10, i => _candidates[i]), ...times(10, i => _bridgeCandidates[i]), ...times(10, i => _scispacyCandidates[i])]
    return removeNull ? compact(__all) : __all
  }

  const getTop10RowCandidatesForDownload = index => {
    let _candidatesTop10 = {};
    let _bridgeCandidatesTop10 = {};
    let _scispacyCandidatesTop10 = {};
    forEach(getTop10RowCandidates(index), (candidate, i) => {
      if(i < 10)
        _candidatesTop10[`__Candidate_Top_${i + 1}__`] = candidate?.id ? compact([`${candidate.id}:${candidate.display_name}`, `Score: ${candidate?.search_meta?.search_normalized_score}`]).join('\n') : null
      else if(bridgeEnabled) {
        _bridgeCandidatesTop10[`__BridgeCandidate_Top_${i - 9}__`] = candidate ? bridgeRef.current?.getCandidateLabelForDownload(candidate) : null
      } else if(scispacyEnabled) {
        _scispacyCandidatesTop10[`__ScispacyCandidate_Top_${i - 9}__`] = candidate?.id ? compact([`${candidate.id}:${candidate.display_name}`, `Score: ${candidate?.search_meta?.search_normalized_score}`]).join('\n') : null
      }
    })
    return {..._candidatesTop10, ..._bridgeCandidatesTop10, ..._scispacyCandidatesTop10}
  }

  const getRowsForDownload = () => {
    return map(data, row => {
      const index = row.__index
      const rowState = getStateFromIndex(index)
      const rowStateLabel = VIEWS[rowState].label
      let concept = mapSelected[index]
      let _repo = concept?.repo
      const aiRecommendation = get(analysis, index)
      const aiCandidate = get(aiRecommendation, 'primary_candidate')
      const aiCandidateID = aiCandidate?.concept_id
      const aiScore = compact([aiCandidate?.confidence_level, aiCandidate?.match_strength]).join(':')
      let  candidates = getTop10RowCandidatesForDownload(index)
      const getOutOfScopeSuggestions = () => {
        let suggestions = get(aiRecommendation, 'out_of_scope_suggestions') || []
        return map(suggestions, sugg => {
          return [`Suggested: ${sugg.suggested_concept}`, `Rationale: ${sugg.rationale}`].join('\n')
        }).join('\n\n\n')
      }
      let newRow = {
        ...row,
        '__Concept ID__': concept?.id,
        '__Concept Name__': concept?.display_name,
        '__Concept URL__': concept?.url,
        '__Map Type__': mapTypes[index],
        '__Match Score__': concept?.search_meta?.search_normalized_score,
        '__Match Type__': concept?.search_meta?.match_type ? startCase(concept.search_meta.match_type) : null,
        '__AI Recommendation__': get(aiRecommendation, 'recommendation') || null,
        '__AI Recommendation Candidate__': aiCandidateID || null,
        '__AI Recommendation Candidate Name__': get(aiCandidate, 'name') || null,
        '__AI Recommendation Score__': aiScore || null,
        '__AI Recommendation Rationale__': get(aiRecommendation, 'rationale') || null,
        '__AI Recommendation Alternative Candidates__': map(get(aiRecommendation, 'alternative_candidates', []), 'concept_id').join('\n') || null,
        '__AI Recommendation Out Of Scope Suggestions__': getOutOfScopeSuggestions() || null,
        '__Decision__': decisions[index] || 'None',
        '__Note__': notes[index] || null,
        '__State__': rowStateLabel,
        '__Proposed__': isEmpty(proposed[index]) ? null : JSON.stringify(proposed[index]),
        '__Repo Version__': _repo?.version || _repo?.id,
        '__Repo ID__': _repo?.short_code || _repo?.id,
        '__Repo URL__': _repo?.version_url || _repo?.url,
        ...candidates,
      }
      delete newRow.__index
      return newRow
    })
  }

  const onCSVRowSelect = csvRow => {
    if(edit?.length > 0)
      return

    const matched = get(find(matchedConcepts, concept => concept.row.__index === csvRow.__index), 'results.0') || mapSelected[csvRow.__index]
    let url = matched?.url
    if(url && !conceptCache[url])
      APIService
      .new()
      .overrideURL(url)
      .get(null, null, {includeMappings: true, mappingBrief: true, mapTypes: 'SAME-AS,SAME AS,SAME_AS', verbose: true})
      .then(response => {
        const res = {...response?.data, search_meta: {...matched.search_meta}, repo: {...matched.repo}}
        setConceptCache({...conceptCache, [url]: res})
      })
    setRow(csvRow)
    setSearchStr(getRowNameValue(csvRow) || '')


    if(repo?.id) {
      const _filters = getFilters()
      if(!appliedFacets[csvRow.__index] && !isEmpty(_filters) && _filters) {
        setAppliedFacets({...appliedFacets, [csvRow.__index]: getAppliedFacetFromQueryParam(_filters)})
      }
      fetchOtherCandidates(csvRow, 0, undefined, undefined, getAppliedFacetFromQueryParam(_filters))
      if(isEmpty(facets[csvRow.__index]))
        getFacets(true, csvRow.__index)

    }

    const el = document.querySelector(`div[data-id="${csvRow.__index}"]`)
    if(el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }

  const onRefreshClick = () => {
    setOtherMatchedConcepts(prev => {
      let newConcepts = {...prev}
      let result = find(newConcepts, c => c.row.__index === rowIndex)
      result.results = null
      return newConcepts
    })
    fetchOtherCandidates(row, 0, undefined, undefined, undefined, true)
  }

  const onCloseDecisions = () => {
    setRow(false)
    setShowHighlights(false)
    setSearchStr('')
  }

  const onMap = (event, concept, unmap=false, mapType='SAME-AS', closeConcept=false) => {
    event.preventDefault()
    event.stopPropagation()
    _onMap(concept, unmap, mapType)
    setRowStatuses(prev => {
      prev.reviewed = without(prev.reviewed, rowIndex)
      if(unmap) {
        prev.readyForReview = without(prev.readyForReview, rowIndex)
        prev.unmapped = uniq([...prev.unmapped, rowIndex])
      } else {
        prev.readyForReview = uniq([...prev.readyForReview, rowIndex])
        prev.unmapped = without(prev.unmapped, rowIndex)
        setMapTypes({...mapTypes, [rowIndex]: mapType})
        setTimeout(() => highlightTexts([concept], null, false), 100)
      }
      updateMatchTypeCounts(null, prev)
      if(closeConcept)
        setShowItem(false)
      return prev
    })
    return false
  }

  const _onMap = (concept, unmap=false, mapType='SAME-AS') => {
    setMapSelected(prev => ({...prev, [rowIndex]: unmap ? null : {...concept, repo: {...repo, version: repoVersion?.id || repo.version, version_url: repoVersion?.version_url || repo.version_url}}}))
    setDecisions(prev => ({...prev, [rowIndex]: unmap ? null : 'map'}))
    if(concept?.url)
      log({action: unmap ? 'unmapped' : 'mapped', extras: {object_url: concept?.url, map_type: mapType, name: getConceptLabel(concept)}})

  }

  const onReviewDone = (next = false) => {
    const newRowStatuses = {...rowStatuses, reviewed: uniq([...rowStatuses.reviewed, rowIndex]), readyForReview: without(rowStatuses.readyForReview, rowIndex), unmapped: without(rowStatuses.unmapped, rowIndex)}
    setRowStatuses(newRowStatuses)
    updateMatchTypeCounts('reviewed', newRowStatuses)
    log({'action': 'approved'})
    if(next){
      const nextRow = data[selectedRowStatus === 'all' ? rowIndex + 1 : find(rowStatuses[selectedRowStatus], idx => idx > rowIndex)]
      if(nextRow !== undefined)
        setTimeout(() => onCSVRowSelect(nextRow), 300)
    }
  }

  const getConceptLabel = concept => `${concept?.repo?.short_code || repo?.short_code || repo?.id}:${concept.repo?.version || concept.repo?.id || repo?.version || repo?.id}:${concept.id} ${concept.display_name || ''}`

  const isSelectedForMap = (concept, index) => (mapSelected[index || rowIndex]?.url == concept.url) && concept.url

  const onStateTabChange = newValue => {
    setSelectedRowStatus(newValue)
    updateMatchTypeCounts(newValue)
    setDecisionFilters([])
    if(newValue === 'unmapped')
      setSelectedMatchBucket(false)
  }

  const updateMatchTypeCounts = (newRowStatus, newRowStatuses) => {
    let rowStatus = newRowStatus || selectedRowStatus
    let rows = rowStatus === 'all' ? matchedConcepts : filter(matchedConcepts, concept => (newRowStatuses || rowStatuses)[rowStatus].includes(concept.row.__index));
    let matchTypes = map(rows, 'results.0.search_meta.match_type')
    let counts = countBy(matchTypes)
    setMatchTypes({
      very_high: (counts?.very_high || 0),
      high: (counts?.high || 0),
      medium: (counts?.medium || 0),
      low: (counts?.low || 0),
      no_match: sum(values(omit(counts, ['very_high', 'high', 'medium', 'low']))) || 0
    });
  }

  const onDecisionTabChange = (event, newValue) => {
    setShowItem(false)
    setDecisionTab(newValue)
    if(newValue === 'candidates' && repo?.id && !find(otherMatchedConcepts, c => c.row.__index === rowIndex)?.results?.length) {
      fetchOtherCandidates()
    }
    if(['candidates', 'search'].includes(newValue) && isEmpty(facets[rowIndex]))
      getFacets(true)
  }

  const onDecisionChange = (event, newValue) => {
    let logged = false
    if(newValue === 'rejected') {
      let selected = mapSelected[rowIndex]
      selected = getConcept(selected) || selected
      if(selected?.id) {
        let conceptLabel = getConceptLabel(selected)
        let comment = `${t('map_project.rejected')} ${conceptLabel}`
        if(notes[rowIndex])
          comment = notes[rowIndex] + '\n' + comment
        setNotes({...notes, [rowIndex]: comment})
        log({action: newValue, description: comment, extras: {object_url: selected?.url, name: conceptLabel, mapType: mapTypes[rowIndex] || undefined}})
        logged = true
      } else {
        log({action: newValue})
        logged = true
      }
    }
    if(newValue !== 'map')
      _onMap(null, true)
    if(newValue != 'propose')
      setProposed(prev => ({...prev, [rowIndex]: undefined}))

    setDecisions(prev => ({...prev, [rowIndex]: newValue || undefined}))
    if(newValue === 'propose') {
      setAlert({message: t('map_project.proposed_successfully'), duration: 2, severity: 'success'})
      log({action: 'proposed'})
        logged = true
    }

    setRowStatuses(prev => {
      prev.reviewed = without(prev.reviewed, rowIndex)
      if(newValue && newValue !== 'rejected') { // map or exclude or propose
        prev.readyForReview = uniq([...prev.readyForReview, rowIndex])
        prev.unmapped = without(prev.unmapped, rowIndex)
      } else {
        prev.readyForReview = without(prev.readyForReview, rowIndex)
        prev.unmapped = uniq([...prev.unmapped, rowIndex])
      }
      updateMatchTypeCounts(null, prev)
      return prev
    })
    if(newValue !== 'map' && !logged)
      log({action: newValue || 'decision_changed', description: t('map_project.decision_changed_to_none'), extras: newValue ? {} : {decision: t('map_project.none')}})
  }

  const fetchOtherCandidates = (_row, offset=0, _retired, scrollToBottom, _filters, forceReload=false) => {
    setAlert(false)
    if(isAnyValidColumn()) {
      let __row = isEmpty(_row) ? row : _row
      const payload = getPayloadForMatching([__row], repo, _filters)

      if(!values(omit(payload.rows[0], '__index')).length){
        setAlert({message: t('map_project.no_valid_columns_for_matching')})
        setTimeout(() => setAlert(false), 6000)
        return
      }

      const existingCandidates = find(otherMatchedConcepts, c => c.row.__index === __row.__index)?.results

      if(!forceReload && offset === 0 && !_retired && existingCandidates?.length> 0) {
        setTimeout(() => highlightTexts(existingCandidates, null, false), 100)
        return
      }
      setIsLoadingInDecisionView(true)

      const service = getMatchAPIService()
      service.post(
        payload,
        (algo === 'custom' && matchAPI && matchAPIToken) ? matchAPIToken : null,
        null,
        {
          includeSearchMeta: true,
          includeRetired: isBoolean(_retired) ? _retired : retired,
          includeMappings: true,
          mappingBrief: true,
          mapTypes: 'SAME-AS,SAME AS,SAME_AS',
          verbose: true,
          reranker: reranker,
          limit: CANDIDATES_LIMIT,
          offset: offset || 0,
          semantic: ['llm', 'custom'].includes(algo)
        }).then(response => {
          if(response?.detail) {
            setAlert({message: response.detail, severity: 'error'})
            return
          }
          if(offset === 0)
            setOtherMatchedConcepts([...reject(otherMatchedConcepts, c => c.row.__index == __row.__index), ...(response?.data || [])])
          else {
            const newMatches = [...otherMatchedConcepts]
            const index = findIndex(newMatches, match => match.row.__index === __row.__index)
            newMatches[index].results = [...newMatches[index].results, ...(response?.data[0]?.results || [])]
            setOtherMatchedConcepts(newMatches)
          }
          setIsLoadingInDecisionView(false)
          let items = get(response?.data, '0.results') || []
          if(items.length > 0){
            const synonyms = get(payload, 'rows.0.synonyms')
            setTimeout(() => highlightTexts(items, null, false, compact([get(payload, 'rows.0.name'), ...(isArray(synonyms) ? synonyms : [synonyms])])), 100)
          }
          fetchBridgeCandidates(__row, offset, _retired, scrollToBottom, _filters, forceReload)
          fetchScispacyCandidates(__row, scrollToBottom, forceReload)
          if(scrollToBottom) {
            setTimeout(() => {
              const el = document.getElementById('candidates-list')
              if(el)
                el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
            }, 100)
          }
        });
    } else {
      setAlert({message: t('map_project.no_valid_columns_for_matching')})
      setTimeout(() => setAlert(false), 6000)
    }
  }

  const fetchScispacyCandidates = (_row, scrollToBottom, forceReload=false) => {
    let __row = isEmpty(_row) ? row : _row
    const existingCandidates = find(scispacyCandidates, c => c.row.__index === __row.__index)?.results
    if(!forceReload && existingCandidates?.length> 0) {
      setTimeout(() => highlightTexts(existingCandidates, null, false), 100)
      return
    }
    if(!scispacyEnabled)
      return
    let inputRow = prepareRow(__row)
    if(!inputRow.name) {
      return
    }
    setIsLoadingInDecisionView(true)
    const payload = {rows: [{label: inputRow.name, itemid: __row.__index}]}
    const service = APIService.new()
    service.URL = SCISPACY_API_URL
    service.appendToUrl('/match/recommend/').post(payload).then(response => {
      if(!isEmpty(response?.data)) {
        let candidates = [{row: __row, results: fromScispacyResultsToConcepts(get(response.data, __row.__index) || [])}]
        setScispacyCandidates(prev => [...reject(prev, c => c.row.__index == __row.__index), ...(candidates || [])])
        setTimeout(() => highlightTexts([], null, false, compact([get(payload, 'rows.0.label')])), 100)
      }
      setIsLoadingInDecisionView(false)
    })
  }

  const fromScispacyResultsToConcepts = results => {
    let formatted = []
    forEach(results, (result) => {
      if(result?.LOINC_NUM)
        formatted.push({id: result.LOINC_NUM, display_name: result.LONG_COMMON_NAME, search_meta: {search_normalized_score: result.composite_score * 100}, extras: result, source: 'LOINC'})
    })
    return formatted
  }

  // const getAllCandidatesForReranking = () => {
  //   if(rowIndex) {
  //     let candidates = find(otherMatchedConcepts, c => c.row.__index === rowIndex)?.results || []
  //     let _bridgeCandidates = find(bridgeCandidates, c => c.row.__index === rowIndex)?.results || []
  //     let _scispacyCandidates = find(scispacyCandidates, c => c.row.__index === rowIndex)?.results || []
  //     return [
  //       ...(candidates.map(candidate => ({...candidate, search_meta: {...candidate.search_meta, algo: '$match'}}))),
  //       ...(_bridgeCandidates.map(candidate => ({...candidate, search_meta: {...candidate.search_meta, algo: '$bridge-match'}}))),
  //       ...(_scispacyCandidates.map(candidate => ({...candidate, search_meta: {...candidate.search_meta, algo: '$scispacy-loinc'}}))),
  //     ]
  //   }
  //   return []
  // }

  const fetchBridgeCandidates = (_row, offset=0, _retired, scrollToBottom, _filters, forceReload=false) => {
    let __row = isEmpty(_row) ? row : _row
    const existingCandidates = find(bridgeCandidates, c => c.row.__index === __row.__index)?.results
    if(!forceReload && offset === 0 && !_retired && existingCandidates?.length> 0) {
      setTimeout(() => highlightTexts(existingCandidates, null, false), 100)
      return
    }
    if(!bridgeEnabled)
      return
    setIsLoadingInDecisionView(true)
    const payload = getPayloadForMatching([__row], repo)
    let __offset = offset || 0
    bridgeRef.current?.fetchBridgeCandidates(
      payload,
      __offset,
      isBoolean(_retired) ? _retired : retired,
      (candidates) => {
        if(__offset === 0)
          setBridgeCandidates(prev => [...reject(prev, c => c.row.__index == __row.__index), ...(candidates || [])])
        else {
          setBridgeCandidates(prev => {
            const newMatches = [...prev]
            let index = findIndex(newMatches, match => match.row.__index === __row.__index)
            if(index < 0) {
              newMatches[candidates[0].row.__index] = candidates[0]
            } else {
              newMatches[index].results = [...newMatches[index].results, ...(candidates[0]?.results || [])]
            }
            return newMatches
          })
          let items = get(candidates, '0.results') || []
          if(items.length > 0){
            const synonyms = get(payload, 'rows.0.synonyms')
            setTimeout(() => highlightTexts(items, null, false, compact([get(payload, 'rows.0.name'), ...(isArray(synonyms) ? synonyms : [synonyms])])), 100)
          }
          if(scrollToBottom) {
            setTimeout(() => {
              const el = document.getElementById('candidates-list')
              if(el)
                el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
            }, 100)
          }
        }
        setIsLoadingInDecisionView(false)
      },
      (response, errorMsg) => {
        setAlert({message: response?.detail || errorMsg, severity: 'error'})
        setIsLoadingInDecisionView(false)
      }
    );
  }

  const onFetchMoreCandidates = () => {
    const currentResults = find(otherMatchedConcepts, matched => matched.row.__index === rowIndex)?.results?.length || 0
    fetchOtherCandidates(null, currentResults, undefined, true)
  }

  const search = (event, page, pageSize, includeRetired, appliedFilters) => {
    if(!searchStr)
      return
    setIsLoadingInDecisionView(true)
    APIService.new().overrideURL(repoVersion.version_url).appendToUrl('concepts/').get(null, null, {
      includeSearchMeta: true,
      includeMappings: true,
      mappingBrief: true,
      mapTypes: 'SAME-AS,SAME AS,SAME_AS',
      verbose: true,
      limit: pageSize || 25,
      q: searchStr,
      page: page || 1,
      includeRetired: includeRetired === undefined ? retired : includeRetired,
      ...getFacetQueryParam(appliedFilters || appliedFacets[rowIndex]),
    }).then(response => {
      let items = response.data
      setSearchedConcepts({...searchedConcepts, [row.__index]: items})
      setSearchResponse(response)
      setIsLoadingInDecisionView(false)
      const el = document.getElementById('search-results')
      if(el)
        el.scrollTo({ top: 0, behavior: 'smooth' });

      if(!page || page == 1)
        getFacets()
      if(items.length > 0)
        setTimeout(() => highlightTexts(items, null, false), 100)
    });
  }

  const getFacets = (firstLoad, rowIndex) => {
    APIService.new().overrideURL(repoVersion.version_url).appendToUrl('concepts/').get(null, null, {
      q: firstLoad ? '' : searchStr,
      includeRetired: retired,
      facetsOnly: true
    }).then(response => {
      setFacets({...facets, [isNumber(rowIndex) ? rowIndex : row.__index]: response?.data?.facets?.fields || {}})
    })
  }

  const getFacetQueryParam = filters => {
    const queryParam = {}
    forEach(
      filters, (value, field) => {
        queryParam[field] = keys(pickBy(value, Boolean)).join(',')
      }
    )

    if(queryParam?.retired === 'true,false' || queryParam?.retired === 'false,true')
      queryParam['includeRetired'] = true

    return queryParam
  }

  const getAppliedFacetFromQueryParam = filters => {
    const applied = {}
    forEach(filters, (value, field) => {
      applied[field] = {}
      if(isBoolean(value)) {
        applied[field][value.toString()] = true
      } else
        forEach(value.split(','), val => applied[field][val] = true)
    })
    return applied
  }
  const equalSplitView = Boolean(rowIndex !== undefined) || (configure && file?.name)
  const isSplitView = equalSplitView || (project?.id && showProjectLogs)
  const rows = getRows()

  const getConcept = concept => concept?.url ? conceptCache[concept.url] || concept : concept

  const onProposedUpdate = proposedState => setProposed(prev => ({...prev, [rowIndex]: {...proposedState}}))

  const onCandidatesOrderChange = (property, order) => {
    setCandidatesOrderBy(property)
    setCandidatesOrder(order)
    let candidates = find(otherMatchedConcepts, c => c.row.__index === rowIndex)?.results || []
    let _bridgeCandidates = find(bridgeCandidates, c => c.row.__index === rowIndex)?.results || []
    let _scispacyCandidates = find(scispacyCandidates, c => c.row.__index === rowIndex)?.results || []
    if(candidates.length) {
      const newCandidates = [...otherMatchedConcepts]
      const newBridgeCandidates = [...bridgeCandidates]
      const newScispacyCandidates = [...scispacyCandidates]
      const index = findIndex(otherMatchedConcepts, c => c.row.__index === rowIndex)
      const bridgeIndex = findIndex(bridgeCandidates, c => c.row.__index === rowIndex)
      const scispacyIndex = findIndex(scispacyCandidates, c => c.row.__index === rowIndex)
      if(property === 'id' && every(candidates, c => isNumeric(c.id))) {
        newCandidates[index].results = orderBy(candidates, candidate => parseFloat(candidate.id), order)
        if(bridgeIndex > -1)
          newBridgeCandidates[bridgeIndex].results = orderBy(_bridgeCandidates, candidate => parseFloat(candidate.id), order)
        if(scispacyIndex > -1)
          newScispacyCandidates[scispacyIndex].results = orderBy(_scispacyCandidates, candidate => parseFloat(candidate.id), order)
      } else if (property === 'display_name') {
        newCandidates[index].results = orderBy(candidates, candidate => candidate.display_name.toLowerCase(), order)
        if(bridgeIndex > -1)
          newBridgeCandidates[bridgeIndex].results = orderBy(_bridgeCandidates, candidate => candidate.display_name.toLowerCase(), order)
        if(scispacyIndex > -1)
          newScispacyCandidates[scispacyIndex].results = orderBy(_scispacyCandidates, candidate => candidate.display_name.toLowerCase(), order)
      } else {
        newCandidates[index].results = orderBy(candidates, property, order)
        if(bridgeIndex > -1)
          newBridgeCandidates[bridgeIndex].results = orderBy(_bridgeCandidates, property, order)
        if(scispacyIndex > -1)
          newScispacyCandidates[scispacyIndex].results = orderBy(_scispacyCandidates, property, order)
      }
      setOtherMatchedConcepts(newCandidates)
      setBridgeCandidates(newBridgeCandidates)
      setScispacyCandidates(newScispacyCandidates)
    }
  }

  const doubleClickCallback = useDoubleClick(onCSVRowSelect, () => {});

  const isConfigureInSplitView = configure && file?.name
  const columnsForTable = getColumnsForTable()
  let targetConcept = mapSelected[rowIndex] ? getConcept(mapSelected[rowIndex]) : false
  const targetConceptFromCandidate = find(otherMatchedConcepts[rowIndex]?.results, {url: targetConcept?.url})
  if(targetConceptFromCandidate)
    targetConcept.search_meta = targetConceptFromCandidate.search_meta
  else if(!targetConcept?.search_meta?.search_normalized_score) {
    let meta = find(searchedConcepts[rowIndex], {url: targetConcept?.url})?.search_meta
    if(meta?.search_normalized_score)
      targetConcept.search_meta = meta
  }

  const labelDisplayedRows = ({ from, to, count }) => {
    return `${from.toLocaleString()}–${to.toLocaleString()} of ${count?.toLocaleString()}`;
  };

  const getCandidateBucket = score => {
    if(score >= candidatesScore.recommended)
      return 'recommended'
    if(score >= candidatesScore.available)
      return 'available'
    return 'low_ranked'
  }


  const fetchAIModels = () => {
    if(!AIModels.length) {
      if(!AI_ASSISTANT_API_URL) {
        return
      }
      const service = APIService.new()
      service.URL = AI_ASSISTANT_API_URL
      service.appendToUrl('/match/models/').get().then(response => {
        if(response?.detail) {
          return
        }
        setAIModels(response.data)
        fetchAIPromptTemplate(response.data)
      })
    }
  }

  const fetchAIPromptTemplate = models => {
    if(AIModel || !AI_ASSISTANT_API_URL) {
      return
    }
    const service = APIService.new()
    service.URL = AI_ASSISTANT_API_URL

    let _models = models?.length ? models : AIModels
    const defaultModel = find(_models, {default: true})
    service.appendToUrl('/prompts/match-recommend/').get().then(response => {
      if(response?.detail || !response?.data?.default_model) {
        setAIModel(defaultModel?.id)
        return
      }
      setAIModel(find(_models, {id: response.data.default_model})?.id || defaultModel?.id)
    })
  }

  const fetchRecommendation = _row => {
    if(!AI_ASSISTANT_API_URL) {
      console.error('AI ASSISTANT is not enabled for you.')
      return
    }
    let __row = row;
    let __index = rowIndex;
    if(isNumber(_row?.__index)){
      __row = _row
      __index = _row.__index
    }
    let _candidates = find(otherMatchedConceptsRef.current, c => c.row?.__index === __index)?.results || []
    let _bridgeCandidates = find(bridgeCandidatesRef.current, c => c.row?.__index === __index)?.results || []
    let _scispacyCandidates = find(scispacyCandidatesRef.current, c => c.row?.__index === __index)?.results || []
    if(isNumber(__index) && repoVersion && project.url && !analysis[rowIndex] && _candidates?.length > 0) {
      let rowData = prepareRow(__row, true)
      let cols = filter(map(columns, col => ({...col, hidden: columnVisibilityModel[col.dataKey] === false, width: columnWidth[col.dataKey] || undefined})), col => {
        return !has(col, 'hidden') || col['hidden'] === false && col?.label
      })
      cols = compact(map(cols, col => {
        if(['id', 'description', 'mapping: list', 'mapping: code', 'concept_class', 'class', 'datatype', 'name', 'synonyms'].includes(col.label.toLowerCase()) || col.label.toLowerCase().startsWith('property:'))
          return col.label
      }))
      const payload = {
        project: {
          ...project,
          name: name,
          description: description,
          filters: filters,
          fields_mapped: cols,
          score_configuration: candidatesScore,
          target_repo: repo
        },
        row: rowData.row,
        metadata: rowData.metadata,
        candidates: _candidates,
        bridgeCandidates: _bridgeCandidates,
        scispacyCandidates: _scispacyCandidates,
        model: AIModel,
      }
      const service = APIService.new()
      service.URL = AI_ASSISTANT_API_URL
      service.appendToUrl('/match/recommend/').post(payload).then(response => {
        if(response?.detail) {
          setAlert({message: response.detail, severity: 'error'})
          return
        }
        if(get(response.data, 'rationale'))
          log({action: 'AIRecommendation', description: get(response.data, 'rationale'), extras: {...response.data, model: find(AIModels, {id: AIModel})}}, __index)
        setAnalysis(prev => ({...prev, [__index]: {...response.data, model: AIModel}}))
      })
    }
  }

  const getRowNameValue = _row => get(_row, find(columns, {label: 'Name'})?.dataKey)

  const getHelperTextForAutoMatchUnmapped = () => {
    if (autoMatchUnmappedOnly) {
      const count = rowStatuses.readyForReview.length;
      if (count > 0) {
        return t('map_project.auto_match_unmapped_only_note', {count: count.toLocaleString()});
      }
      return t('map_project.auto_match_unmapped_only_note_no_count');
    }
    const approvedCount = rowStatuses.reviewed.length;
    const proposedCount = rowStatuses.readyForReview.length;
    if (approvedCount > 0 && proposedCount > 0) {
      return t('map_project.auto_match_note', {
        approvedCount: approvedCount.toLocaleString(),
        proposedCount: proposedCount.toLocaleString()
      });
    }
    return t('map_project.auto_match_note_no_counts');
  };

  const getSplitWidths = () => {
    if(!isSplitView)
      return [100, 0]
    if(equalSplitView)
      return [50, 50]
    return [70, 30]
  }

  return permissionDenied ? <Error403/> : (
    <div className='col-xs-12 padding-0' style={{borderRadius: '10px', width: 'calc(100vw - 32px)'}}>
      {
        Boolean(repoVersion?.url) &&
          <BridgeMatch
            service={getMatchAPIService()}
            repo={repoVersion}
            bridgeRepoURL='/orgs/CIEL/sources/CIEL/'
            token={(algo === 'custom' && matchAPI && matchAPIToken) ? matchAPIToken : null}
            limit={CANDIDATES_LIMIT}
            user={user}
            ref={bridgeRef}
          />
      }
      {
        loadingProject &&
          <LoaderDialog open message={t('map_project.loading_project')}/>
      }
      <Split
        sizes={getSplitWidths()}
        minSize={isSplitView ? 200 : 1000}
        expandToMin={false}
        gutterSize={isSplitView ? 6 : 0}
        snapOffset={0}
        direction="horizontal"
        cursor="col-resize"
        style={{ display: 'flex', height: 'calc(100vh - 100px)' }}
        gutter={() => {
        const gutter = document.createElement('div');
        gutter.className = 'gutter';
        return gutter;
      }}
      >
        <Paper component="div" className={isSplitView ? 'col-xs-6 split padding-0' : 'col-xs-12 split padding-0'} sx={{boxShadow: 'none', p: 0, backgroundColor: 'white', borderRadius: '10px', border: 'solid 0.3px', borderColor: 'surface.nv80', minHeight: 'calc(100vh - 100px) !important', overflow: 'auto'}}>
          <Paper component="div" className='col-xs-12' sx={{backgroundColor: 'surface.main', boxShadow: 'none', padding: '4px 16px 8px 16px', borderRadius: '10px 10px 0 0', minWidth: '665px', ...((isConfigureInSplitView || !configure) ? {} : {height: 'calc(100vh - 125px) !important', overflow: 'auto'})}}>
            {
              configure && !file?.name &&
                <div className='col-xs-8 padding-0'>
                  <ConfigurationForm
                    project={project}
                    handleFileUpload={handleFileUpload}
                    file={file}
                    owner={owner}
                    setOwner={setOwner}
                    name={name}
                    setName={setName}
                    description={description}
                    setDescription={setDescription}
                    repo={repo}
                    onRepoChange={onRepoChange}
                    repoVersion={repoVersion}
                    setRepoVersion={onRepoVersionChange}
                    mappedSources={mappedSources}
                    targetSourcesFromRows={targetSourcesFromRows}
                    versions={versions}
                    algo={algo}
                    onAlgoSelect={onAlgoSelect}
                    algos={algos}
                    validColumns={headers}
                    columns={columns}
                    isValidColumnValue={isValidColumnValue}
                    updateColumn={updateColumn}
                    configure={configure}
                    setConfigure={setConfigure}
                    columnVisibilityModel={columnVisibilityModel}
                    setColumnVisibilityModel={setColumnVisibilityModel}
                    onSave={onSave}
                    isSaving={isSaving}
                    matchAPI={matchAPI}
                    setMatchAPI={setMatchAPI}
                    matchAPIToken={matchAPIToken}
                    setMatchAPIToken={setMatchAPIToken}
                    semanticBatchSize={semanticBatchSize}
                    setSemanticBatchSize={setSemanticBatchSize}
                    candidatesScore={candidatesScore}
                    onScoreChange={setCandidatesScore}
                    includeDefaultFilter={includeDefaultFilter}
                    setIncludeDefaultFilter={setIncludeDefaultFilter}
                    filters={filters}
                    setFilters={setFilters}
                    locales={locales}
                    isLoadingLocales={isLoadingLocales}
                    reranker={reranker}
                    setReranker={setReranker}
                    bridgeEnabled={bridgeEnabled}
                    setBridgeEnabled={setBridgeEnabled}
                    canBridge={canBridge}
                    canScispacy={canScispacy}
                    scispacyEnabled={scispacyEnabled}
                    setScispacyEnabled={setScispacyEnabled}
                  />
                </div>
          }
            <div className='col-xs-12 padding-0' style={{backgroundColor: SURFACE_COLORS.main, marginLeft: '-5px', paddingBottom: '0px', paddingLeft: '0px', paddingTop: '0px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
            {
              !(configure && !file?.name) &&
                <span style={{display: 'flex', alignItems: 'center'}}>
                  {
                    name &&
                      <span style={{fontWeight: 'bold', fontSize: '18px', maxWidth: isSplitView ? '300px' : '500px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', marginRight: '8px'}}>
                        {name}
                      </span>
                  }
                  <Tooltip title={t('map_project.configure_mapping_project_tooltip')}>
                    <IconButton color={configure ? 'primary' : 'secondary'} onClick={() => setConfigure(!configure)} sx={{textTransform: 'none', margin: '5px 5px 5px 0'}}>
                      <SettingsIcon fontSize='inherit' />
                    </IconButton>
                  </Tooltip>
                  <Button
                    variant='contained'
                    size='small'
                    sx={{textTransform: 'none', margin: '5px'}}
                    endIcon={<DoubleArrowIcon />}
                    startIcon={<AutoMatchIcon />}
                    disabled={!file}
                    onClick={onGetCandidates}
                    loading={loadingMatches}
                    loadingPosition="start"
                  >
                    {getCandidatesButtonLabel()}
                  </Button>
                  {
                    scispacyCandidatesStartedAt &&
                      <Button
                        variant='outlined'
                        size='small'
                        sx={{textTransform: 'none', margin: '5px', pointerEvents: 'none', display: 'none'}}
                        endIcon={isRunningBulkScispacyCandidates ? <PendingIcon color='warning' /> : <DoneIcon color='primary' />}
                        loading={isRunningBulkScispacyCandidates || isRunningBulkAnalysis}
                        loadingPosition="start"
                      >
                        {getBulkScispacyCandidatesButtonLabel()}
                      </Button>
                  }
                  {
                    bridgeCandidatesStartedAt &&
                      <Button
                        variant='outlined'
                        size='small'
                        sx={{textTransform: 'none', margin: '5px', pointerEvents: 'none', display: 'none'}}
                        endIcon={isRunningBulkBridgeCandidates ? <PendingIcon color='warning' /> : <DoneIcon color='primary' />}
                        loading={isRunningBulkBridgeCandidates || isRunningBulkAnalysis}
                        loadingPosition="start"
                      >
                        {getBulkBridgeCandidatesButtonLabel()}
                      </Button>
                  }
                  {
                    bulkAIAnalysisStartedAt &&
                      <Button
                        variant='outlined'
                        size='small'
                        sx={{textTransform: 'none', margin: '5px', pointerEvents: 'none', display: 'none'}}
                        startIcon={<AssistantIcon />}
                        endIcon={isRunningBulkAnalysis ? <PendingIcon color='warning' /> : <DoneIcon color='primary' />}
                        loading={isRunningBulkAnalysis}
                        loadingPosition="start"
                      >
                        {getBulkAIAnalysisButtonLabel()}
                      </Button>
                  }
                  {
                    (loadingMatches || isRunningBulkAnalysis || isRunningBulkBridgeCandidates || isRunningBulkScispacyCandidates) &&
                      <Button
                        variant='text'
                        size='small'
                        color='error'
                        sx={{textTransform: 'none', margin: '5px'}}
                        onClick={() => {
                          abortRef.current = true
                          setRandom(random + 1)
                        }}
                        disabled={abortRef.current}
                      >
                        {abortRef.current ? t('map_project.stopping_gracefully') : t('map_project.stop_processing')}
                      </Button>
                  }
                </span>
            }
            {
              rows?.length > 0 && !loadingMatches &&
                <Controls
                  project={project}
                  onDownload={onDownloadClick}
                  onSave={onSave}
                  onDelete={() => setDeleteProject(true)}
                  owner={owner}
                  file={file}
                  isSaving={isSaving}
                  onImport={isEmpty(mapSelected) ? false : () => setOpenImportToCollection(true)}
                  importResponse={imports[0]}
                  onDownloadImportReport={downloadImportReport}
                  onProjectLogsClick={() => setShowProjectLogs(!showProjectLogs)}
                  isProjectsLogOpen={showProjectLogs}
                />
            }
          </div>
        </Paper>
        {
          (Boolean(rows?.length) || selectedMatchBucket || ROW_STATES.includes(selectedRowStatus) || searchText) &&
            <div className='col-xs-12' style={{padding: '0', width: '100%', height: 'calc(100vh - 170px)', minWidth: '665px'}}>
              <div className='col-xs-12' style={{padding: '0 12px', display: 'flex', backgroundColor: SURFACE_COLORS.main, overflowX: 'auto'}}>
                {
                  map(VIEWS, (state, view) => {
                    const count = view === 'all' ? data.length : rowStatuses[view].length
                    const isLast = view === 'reviewed'
                    const getDividerBgColor = () => {
                      if(!selectedRowStatus || selectedRowStatus === 'all')
                        return undefined
                      if(selectedRowStatus === 'unmapped' && ['all'].includes(view))
                        return 'primary.main'
                      if(selectedRowStatus === 'readyForReview' && ['all', 'unmapped'].includes(view))
                        return 'primary.main'
                      if(selectedRowStatus === 'reviewed')
                        return 'primary.main'
                    }
                    return (
                      <MatchSummaryCard
                        size='large'
                        key={view}
                        id={view}
                        count={count.toLocaleString()}
                        loading={loadingMatches}
                        selected={selectedRowStatus}
                        onClick={() => onStateTabChange(view)}
                        {...VIEWS[view]}
                        isLast={isLast}
                        dividerBgColor={getDividerBgColor()}
                      />
                    )
                  })
                }
              </div>
              <div className='col-xs-12' style={{padding: '12px 14px 8px 14px', display: 'flex', alignItems: 'center', backgroundColor: SURFACE_COLORS.main}}>
                <FormControl sx={{minWidth: '16px'}}>
                  <SearchField onChange={debounce(val => setSearchText(val || ''))} />
                </FormControl>
                <Badge badgeContent={matchTypes.very_high || 0} max={999} color='primary'>
                <FormControlLabel
                  sx={{
                    marginLeft: '4px',
                    marginRight: '8px',
                    '.MuiFormControlLabel-label': {fontSize: '0.8125rem'}
                  }}
                  control={<Switch disabled={!showMatchSummary || selectedRowStatus === 'unmapped'} size="small" checked={selectedMatchBucket === 'very_high'} onChange={() => onMatchTypeChange('very_high')} />}
                  label={t('map_project.auto_match')}
                />
                  </Badge>
                <ScoreBucketButton
                  selected={selectedCandidatesScoreBucket}
                  onSort={() => setScoreBucketSortBy(scoreBucketSortBy === 'desc' ? 'asc' : 'desc')}
                  sortBy={scoreBucketSortBy}
                  onClick={bucket => setSelectedCandidatesScoreBucket(selectedCandidatesScoreBucket === bucket ? false : bucket)}
                  recommended={recommendedCount}
                  available={availableCount}
                  low_ranked={lowRankedCount}
                />
                <div style={{display: 'inline-block'}}>
                {
                  selectedRowStatus === 'unmapped' &&
                    <Chip
                      label={`${t('map_project.rejected')} (${keys(pickBy(decisions, value => value === 'rejected')).length})`}
                      color='error'
                      size='small'
                      variant={decisionFilters.includes('rejected') ? 'contained' : 'outlined'}
                      icon={
                        decisionFilters.includes('rejected') ?
                          <CloseIcon fontSize='inherit' /> :
                          <DoneIcon fontSize='inherit' />
                      }
                      onClick={
                        () => setDecisionFilters(
                          decisionFilters.includes('rejected') ?
                            without(decisionFilters, 'rejected') :
                            [...decisionFilters, 'rejected']
                        )
                      }
                      sx={{margin: '4px'}}
                    />

                }
                {
                  ['reviewed', 'readyForReview'].includes(selectedRowStatus) &&
                    <React.Fragment>
                      {
                        ['map', 'exclude', 'none', 'propose'].map(_decision => {
                          const isApplied = decisionFilters.includes(_decision)
                          const isExclude = _decision == 'exclude'
                          const isNone = _decision == 'none'
                          const isPropose = _decision == 'propose'
                          const count = filter(keys(pickBy(decisions, value => isNone ? !value : value === _decision)), index => rowStatuses[selectedRowStatus].includes(parseInt(index))).length
                          return (
                            <Chip
                              key={_decision}
                              disabled={!count}
                              label={`${t(`map_project.decision_${_decision}`) || startCase(_decision)} (${count})`}
                              color={isExclude ? 'error' : (isNone ? 'secondary' : (isPropose ? 'warning' : 'primary'))}
                              size='small'
                              variant={isApplied ? 'contained' : 'outlined'}
                              icon={
                                isApplied ?
                                  <CloseIcon fontSize='inherit' /> :
                                  <DoneIcon fontSize='inherit' />
                              }
                              onClick={
                                () => setDecisionFilters(
                                  isApplied ?
                                    without(decisionFilters, _decision) :
                                    [...decisionFilters, _decision]
                                )
                              }
                              sx={{margin: '4px'}}
                            />
                          )
                        })
                      }
                    </React.Fragment>
                }
                  </div>
              </div>
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
              <div style={{ width: '100%', height: project?.id ? 'calc(100vh - 260px)' : 'calc(100vh - 250px)' }}>
                <DataGrid
                  onFilterModelChange={(model) => setFilterModel(model)}
                  filterModel={filterModel}
                  resizeThrottleMs={100}
                  onCellClick={doubleClickCallback}
                  sx={{
                    borderRadius: '0 0 10px 10px',
                    '.MuiDataGrid-columnHeader': {
                      borderRadius: 0,
                      borderTopLeftRadius: '0 !important',
                      '.MuiButtonBase-root': {
                        color: 'rgba(0, 0, 0, 0.5)',
                        '.MuiSvgIcon-root': {opacity: '1 !important'},
                      }
                    },
                    '.MuiDataGrid-row .MuiDataGrid-cell': {
                      whiteSpace: 'pre-line',
                      padding: '4px 10px'
                    },
                    [`.MuiDataGrid-row[data-id="${rowIndex}"]`]: {
                      backgroundColor: 'primary.90'
                    },
                    '.MuiDataGrid-footerContainer': {
                      minHeight: '40px',
                      '.MuiToolbar-root': {
                        height: '40px',
                        minHeight: '40px'
                      }
                    }
                  }}
                  columnHeaderHeight={64}
                  onColumnWidthChange={(params) => params?.colDef?.field ? setColumnWidth({...columnWidth, [params?.colDef?.field]: params.width}) : null}
                  getRowHeight={() => 'auto'}
                  getRowId={row => row.__index}
                  rows={rows}
                  columns={columnsForTable}
                  pageSizeOptions={[100]}
                  initialState={{
                    pagination: {
                      paginationModel: {
                        pageSize: 100,
                      },
                    },
                  }}
                  localeText={{
                    MuiTablePagination: {
                      labelDisplayedRows,
                    },
                  }}
                  columnVisibilityModel={columnVisibilityModel}
                  onColumnVisibilityModelChange={setColumnVisibilityModel}
                  getRowClassName={params => {
                    const index = params?.row?.__index
                    const targetConcept = mapSelected[index]
                    if(targetConcept) {
                      const score = targetConcept?.search_meta?.search_normalized_score
                      return getCandidateBucket(score) + '-row'
                    } else
                      return 'unmatched-row'
                  }}
                />
              </div>
            </div>
        }
        <Dialog
          disableEscapeKeyDown
          open={matchDialog}
          onClose={() => setMatchDialog(false)}
          scroll='paper'
          sx={{
            '& .MuiDialog-paper': {
              borderRadius: '28px',
              minWidth: '312px',
              minHeight: '262px',
              padding: 0
            }
          }}
        >
          <DialogTitle sx={{padding: '12px 24px', color: 'surface.dark', fontSize: '22px', textAlign: 'left'}}>
            {t('map_project.auto_match')}
          </DialogTitle>
          <DialogContent sx={{paddingTop: '12px !important'}}>
            <Button
              component="label"
              role={undefined}
              variant="outlined"
              tabIndex={-1}
              sx={{textTransform: 'none', margin: '0 0 10px 0', padding: '6.5px 15px', minWidth: '300px'}}
              startIcon={<MatchingIcon />}
              endIcon={<DownIcon />}
              onClick={onAlgoButtonClick}
            >
              {algos.find(_algo => _algo.id === algo).label}
            </Button>
            <RepoSearchAutocomplete label={t('map_project.map_target')} size='small' onChange={(id, item) => onRepoChange(item)} value={repo} />
            <RepoVersionSearchAutocomplete versions={versions} label={t('common.version')} size='small' onChange={(id, item) => onRepoVersionChange(item)} value={repoVersion} sx={{marginTop: '10px'}} />
            <FormControlLabel sx={{marginTop: '12px', width: '100%'}} control={<Checkbox checked={autoMatchUnmappedOnly} onChange={event => setAutoMatchUnmappedOnly(event.target.checked)} />} label={t('map_project.unmapped_only')} />
            <FormHelperText sx={{marginTop: '-4px'}}>
              {
                getHelperTextForAutoMatchUnmapped()
              }
            </FormHelperText>
            <FormControlLabel sx={{width: '100%'}} control={<Checkbox checked={reranker} onChange={event => setReranker(event.target.checked)} />} label={t('map_project.enable_reranker')} />
            {
              inAIAssistantGroup &&
                <>
                  <FormControlLabel
                    sx={{marginTop: '0px', width: '100%'}}
                    control={
                      <Checkbox
                        checked={autoRunAIAnalysis}
                        onChange={event => setAutoRunAIAnalysis(event.target.checked)}
                      />
                    }
                    label={
                      <span style={{display: 'flex', alignItems: 'center'}}>
                        <span>{t('map_project.run_ai_analysis')}</span>
                        <AIAssistantButton
                          models={AIModels}
                          selected={AIModel}
                          onClick={() => {}}
                          sx={{margin: '0 16px'}}
                          onModelChange={setAIModel}
                          popperProps={{
                            sx: {zIndex: 1500}
                          }}
                          disabled={!autoRunAIAnalysis}
                        />
                      </span>
                    }
                  />
                  <FormHelperText sx={{marginTop: '-4px'}}>
                    {t('map_project.run_ai_analysis_note')}
                  </FormHelperText>
                </>
            }
          </DialogContent>
          <DialogActions sx={{padding: '16px'}}>
            <Button
              color='default'
              variant='contained'
              size='small'
              sx={{textTransform: 'none'}}
              onClick={() => setMatchDialog(false)}
            >
              {t('common.close')}
            </Button>
            <Button
              variant='contained'
              size='small'
              sx={{textTransform: 'none', marginLeft: '12px'}}
              endIcon={<DoubleArrowIcon />}
              disabled={!repo?.url}
              onClick={onGetCandidatesSubmit}
            >
              {t('common.submit')}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
      <Paper component="div" className={isSplitView ? 'col-xs-6 split padding-0 split-appear' : 'col-xs-6 padding-0'} sx={{boxShadow: 'none', p: 0, backgroundColor: WHITE, borderRadius: '10px', border: 'solid 0.3px', borderColor: 'surface.nv80', opacity: isSplitView ? 1 : 0, height: 'calc(100vh - 100px) !important', overflow: 'auto'}}>
        {
          configure && file?.name ?
            <div className='col-xs-12'>
              <ConfigurationForm
                project={project}
                handleFileUpload={handleFileUpload}
                file={file}
                owner={owner}
                setOwner={setOwner}
                name={name}
                setName={setName}
                description={description}
                setDescription={setDescription}
                repo={repo}
                onRepoChange={onRepoChange}
                repoVersion={repoVersion}
                setRepoVersion={onRepoVersionChange}
                mappedSources={mappedSources}
                targetSourcesFromRows={targetSourcesFromRows}
                versions={versions}
                algo={algo}
                onAlgoSelect={onAlgoSelect}
                algos={algos}
                validColumns={headers}
                columns={columns}
                isValidColumnValue={isValidColumnValue}
                updateColumn={updateColumn}
                configure={configure}
                setConfigure={setConfigure}
                columnVisibilityModel={columnVisibilityModel}
                setColumnVisibilityModel={setColumnVisibilityModel}
                onSave={onSave}
                isSaving={isSaving}
                matchAPI={matchAPI}
                setMatchAPI={setMatchAPI}
                matchAPIToken={matchAPIToken}
                setMatchAPIToken={setMatchAPIToken}
                semanticBatchSize={semanticBatchSize}
                setSemanticBatchSize={setSemanticBatchSize}
                candidatesScore={candidatesScore}
                onScoreChange={setCandidatesScore}
                includeDefaultFilter={includeDefaultFilter}
                setIncludeDefaultFilter={setIncludeDefaultFilter}
                filters={filters}
                setFilters={setFilters}
                locales={locales}
                isLoadingLocales={isLoadingLocales}
                reranker={reranker}
                setReranker={setReranker}
                bridgeEnabled={bridgeEnabled}
                setBridgeEnabled={setBridgeEnabled}
                canBridge={canBridge}
                canScispacy={canScispacy}
                scispacyEnabled={scispacyEnabled}
                setScispacyEnabled={setScispacyEnabled}
              />
            </div> :
          (
            rowIndex !== undefined ?
            <>
              <div className='col-xs-12' style={{padding: '8px 16px', minWidth: '500px'}}>
                <div className='col-xs-12 padding-0' style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                  <Typography component='span' sx={{fontSize: '20px', color: 'surface.dark', fontWeight: 600}}>
                    {t('map_project.mapping_decisions')}
                    <Chip sx={{padding: '0 6px', marginLeft: '12px'}} variant='outlined' {...VIEWS[getStateFromIndex(rowIndex)]} label={t('map_project.view_' + getStateFromIndex(rowIndex).toLowerCase())} />
                  </Typography>
                  <CloseIconButton color='secondary' onClick={onCloseDecisions} />
                </div>
                <MappingDecisionResult
                  targetConcept={targetConcept}
                  repoVersion={repoVersion}
                  row={row}
                  rowIndex={rowIndex}
                  repo={repo}
                  mapTypes={mapTypes}
                  allMapTypes={allMapTypes}
                  onMap={onMap}
                  proposed={proposed[rowIndex]}
                  columns={columns}
                  onTargetClick={setShowItem}
                />
                <Divider sx={{width: '100%'}} />
                <DecisionSelector
                  selected={decisions[rowIndex]}
                  onChange={onDecisionChange}
                  disabledMap={!mapSelected[rowIndex]}
                  disabledPropsed={!proposed[rowIndex]?.id}
                />
                <Divider sx={{width: '100%'}} />
                <ReviewNote
                  value={notes[rowIndex]}
                  onChange={event => setNotes({...notes, [rowIndex]: event.target.value || ''})}
                />
                <div className='col-xs-12' style={{padding: '0 0 8px 78px'}}>
                  <Button size='small' disabled={rowStatuses.reviewed.includes(rowIndex) || decisions[rowIndex] === 'none' || !decisions[rowIndex]} color='primary' onClick={() => onReviewDone(true)} variant='contained' sx={{textTransform: 'none'}}>
                    {t('map_project.approve_and_next')}
                  </Button>
                  <Button size='small' disabled={rowStatuses.reviewed.includes(rowIndex) || decisions[rowIndex] === 'none' || !decisions[rowIndex]} color='primary' onClick={() => onReviewDone(false)} variant='outlined' sx={{textTransform: 'none', marginLeft: '8px'}}>
                    {t('map_project.approve')}
                  </Button>
                  <Button size='small' disabled={decisions[rowIndex] === 'none' || !decisions[rowIndex]} color='error' onClick={(event) => onDecisionChange(event, 'rejected')} variant='outlined' sx={{textTransform: 'none', marginLeft: '8px'}}>
                    {t('map_project.reject')}
                  </Button>
                </div>
                <Divider sx={{width: '100%'}} />
                <div className='col-xs-12 padding-0'>
                  <Tabs
                    variant='fullWidth'
                    value={decisionTab}
                    onChange={onDecisionTabChange}
                  >
                    {
                      DECISION_TABS.map(_tab => {
                        return (
                          <Tab
                            sx={{padding: '2px 6px !important', textTransform: 'none', fontWeight: 'bold'}}
                            value={_tab}
                            key={_tab}
                            label={t('map_project.decision_tab_' + _tab)}
                          />
                        )
                      })
                    }
                  </Tabs>
                </div>
                {
                  decisionTab === 'propose' && isSplitView &&
                    <Propose
                      onChange={onProposedUpdate}
                      proposed={proposed[rowIndex]}
                      onSubmit={(event, state) => {
                        if(state)
                          setProposed(prev => ({...prev, [rowIndex]: {...state}}))
                        onDecisionChange(event, 'propose')
                      }}
                      repo={repoVersion || repo}
                      row={row}
                      columns={columns}
                    />
                }
                {
                  decisionTab === 'candidates' && isSplitView &&
                    <Candidates
                      reranker={reranker}
                      candidatesScore={candidatesScore}
                      rowIndex={rowIndex}
                      alert={alert}
                      setAlert={setAlert}
                      candidates={otherMatchedConcepts}
                      bridgeCandidates={bridgeCandidates}
                      scispacyCandidates={scispacyCandidates}
                      orderBy={candidatesOrderBy}
                      order={candidatesOrder}
                      onOrderChange={onCandidatesOrderChange}
                      setShowItem={setShowItem}
                      showItem={showItem}
                      setShowHighlights={setShowHighlights}
                      isSelectedForMap={isSelectedForMap}
                      onMap={onMap}
                      isLoading={isLoadingInDecisionView}
                      onFetchMore={onFetchMoreCandidates}
                      repoVersion={repoVersion}
                      onFetchRecommendation={fetchRecommendation}
                      analysis={analysis[rowIndex]}
                      columns={getValidColumns()}
                      facets={facets[rowIndex]}
                      appliedFacets={appliedFacets[rowIndex]}
                      defaultFilters={getAppliedFacetFromQueryParam(getFilters())}
                      filters={getFilters(rowIndex)}
                      setAppliedFacets={(filters) => {
                        setAppliedFacets(() => ({...appliedFacets, [rowIndex]: filters}))
                        fetchOtherCandidates(null, 0, false, false, filters, true)
                      }}
                      locales={filters.locale || ''}
                      models={AIModels}
                      selectedModel={AIModel}
                      onModelChange={setAIModel}
                      onRefreshClick={onRefreshClick}
                    />
                }
                {
                  decisionTab === 'search' && isSplitView &&
                    <Search
                      rowIndex={rowIndex}
                      onSearch={search}
                      repo={repo}
                      repoVersion={repoVersion}
                      concepts={searchedConcepts[rowIndex]}
                      response={searchResponse}
                      setShowItem={setShowItem}
                      showItem={showItem}
                      isSelectedForMap={isSelectedForMap}
                      onMap={onMap}
                      searchStr={searchStr}
                      setSearchStr={setSearchStr}
                      isLoading={isLoadingInDecisionView}
                      columns={getValidColumns()}
                      facets={facets[rowIndex]}
                      appliedFacets={appliedFacets[rowIndex]}
                      defaultFilters={getAppliedFacetFromQueryParam(getFilters())}
                      filters={getFilters()}
                      setAppliedFacets={(filters) => {
                        setAppliedFacets({...appliedFacets, [rowIndex]: filters})
                        search(null, null, null, null, filters)
                      }}
                      locales={filters.locale || ''}
                    />
                }
                {
                  decisionTab === 'discuss' && isSplitView &&
                    <Discuss logs={logs[rowIndex]} onAdd={comment => comment ? log({action: 'commented', description: comment}) : null} />
                }
              </div>
              <SearchHighlightsDialog
                open={Boolean(showHighlights)}
                onClose={() => setShowHighlights(false)}
                highlight={showHighlights?.search_meta?.search_highlight || []}
                score={parseFloat(showHighlights?.search_meta?.search_normalized_score || 0).toFixed(2)}
                raw_score={parseFloat(showHighlights?.search_meta?.search_score || 0).toFixed(2)}
              />
            </> : <ProjectLogs open={showProjectLogs} onClose={() => setShowProjectLogs(false) } logs={projectLogs} />
          )
        }
    </Paper>
    </Split>
      <Menu
        id="matching-algo"
        anchorEl={algoMenuAnchorEl}
        open={Boolean(algoMenuAnchorEl)}
        onClose={onAlgoButtonClick}
        MenuListProps={{
          'aria-labelledby': 'matching-algo',
          role: 'listbox',
        }}
      >
        {
          algos.map(_algo => (
            <MenuItem
              key={_algo.id}
              disabled={_algo.disabled}
              selected={_algo.id === algo}
              onClick={() => onAlgoSelect(_algo.id)}
            >
              {_algo.label}
            </MenuItem>
          ))
        }
      </Menu>
      {
        deleteProject && project?.id &&
          <MapProjectDeleteConfirmDialog open={deleteProject} onClose={() => setDeleteProject(false)} project={project} />
      }
      {
        showItem?.id &&
          <Dialog
            PaperComponent={DraggablePaperComponent}
            aria-labelledby="draggable-dialog-title"
            disableEscapeKeyDown
            open
            onClose={() => setShowItem(false)}
            scroll='paper'
            maxWidth='sm'
            fullWidth
            sx={{
              '& .MuiDialog-paper': {
                borderRadius: '28px',
                padding: 0,
              }
            }}
          >
            <ConceptHome
              style={{borderRadius: 0}}
              detailsStyle={{height: 'calc(100vh - 400px)'}}
              repo={showItem.source === (repoVersion?.short_code || repoVersion?.id) ? repoVersion : null}
              url={showItem.url}
              concept={showItem}
              onClose={() => setShowItem(false)}
              onMap={onMap}
              isSelectedForMap={isSelectedForMap}
            />
          </Dialog>
      }

      <ImportToCollection
        onImport={onImport}
        rowStatuses={rowStatuses}
        open={openImportToCollection}
        onClose={() => setOpenImportToCollection(false)}
      />
    </div>
  )
}

export default MapProject;
