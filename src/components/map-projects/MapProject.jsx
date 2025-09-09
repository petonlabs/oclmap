import React from 'react'
import * as XLSX from 'xlsx';
import moment from 'moment'
import Split from 'react-split';

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
import { DataGrid } from '@mui/x-data-grid';


import DownIcon from '@mui/icons-material/ArrowDropDown';
import MatchingIcon from '@mui/icons-material/DeviceHub';
import DoubleArrowIcon from '@mui/icons-material/DoubleArrow';
import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';
import SettingsIcon from '@mui/icons-material/Settings';
import AutoMatchIcon from '@mui/icons-material/MotionPhotosAutoOutlined';
import ClearIcon from '@mui/icons-material/Clear';

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

import { OperationsContext } from '../app/LayoutContext';

import APIService from '../../services/APIService';
import { highlightTexts, dropVersion, getCurrentUser } from '../../common/utils';
import { WHITE, SURFACE_COLORS } from '../../common/colors';

import { useDoubleClick } from '../common/useDoubleClick'
import CloseIconButton from '../common/CloseIconButton';
import SearchHighlightsDialog from '../search/SearchHighlightsDialog'
import ConceptHome from '../concepts/ConceptHome'
import RepoSearchAutocomplete from '../repos/RepoSearchAutocomplete'
import RepoVersionSearchAutocomplete from '../repos/RepoVersionSearchAutocomplete'
import DraggablePaperComponent from '../common/DraggablePaperComponent'
import LoaderDialog from '../common/LoaderDialog'
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
  const { toggles, setAlert: baseSetAlert } = React.useContext(OperationsContext);
  const user = getCurrentUser()
  const params = useParams()
  const history = useHistory()

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
  const [matchTypes, setMatchTypes] = React.useState({very_high: 0, high: 0, low: 0, no_match: 0})
  const [matchedConcepts, setMatchedConcepts] = React.useState([]);
  const [otherMatchedConcepts, setOtherMatchedConcepts] = React.useState([]);
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
  const [searchStr, setSearchStr] = React.useState('') // concept search
  const [candidatesOrder, setCandidatesOrder] = React.useState('desc')
  const [candidatesOrderBy, setCandidatesOrderBy] = React.useState('search_meta.search_normalized_score')
  const [matchAPI, setMatchAPI] = React.useState('')
  const [matchAPIToken, setMatchAPIToken] = React.useState('')
  const [semanticBatchSize, setSemanticBatchSize] = React.useState(SEMANTIC_BATCH_SIZE)
  const [candidatesScore, setCandidatesScore] = React.useState({recommended: 100, available: 70})

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
  const [alert, setAlert] = React.useState(false)
  const [columnVisibilityModel, setColumnVisibilityModel] = React.useState({})
  const [columnWidth, setColumnWidth] = React.useState({})
  const [logs, setLogs] = React.useState({})
  const [filterModel, setFilterModel] = React.useState({ items: [] });
  const [retired, setRetired] = React.useState(false)

  // repo state
  const [repo, setRepo] = React.useState(false)
  const [repoVersion, setRepoVersion] = React.useState(false)
  const [mappedSources, setMappedSources] = React.useState([])
  const [versions, setVersions] = React.useState([])
  const [conceptCache, setConceptCache] = React.useState({})
  const [allMapTypes, setAllMapTypes] = React.useState([])
  const [random, setRandom] = React.useState(0)
  const [deleteProject, setDeleteProject] = React.useState(false)
  const [loadingProject, setLoadingProject] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)

  // algos
  const [algos, setAlgos] = React.useState([
    {id: 'es', label: 'Generic Elastic Search Matching', description: "Token and Keyword based search using ES"},
    {id: 'llm', label: 'Semantic Search (all-MiniLM-L6-v2)', description: "Vector based search powered by MiniLM", disabled: !toggles?.SEMANTIC_SEARCH_TOGGLE},
    {id: 'custom', label: 'Custom API', description: 'Custom $match API'}
  ])


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
  }, [])

  const fetchAndSetProject = () => {
    setLoadingProject(true)
    let url = ['', params.ownerType, params.owner, 'map-projects', params.projectId, ''].join('/')
    APIService.new().overrideURL(url).get().then(response => {
      if(response.data.url) {
        APIService.new().overrideURL(response.data.url).appendToUrl('logs/').get().then(response => setLogs(response.data.logs || []))
      }
      if(response.data?.file_url) {
        fetch(response.data.file_url).then(res => res.text()).then(csvText => {
          const workbook = XLSX.read(csvText, { type: "string", raw: true });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const data = XLSX.utils.sheet_to_json(sheet, { raw: false, defval: '' })
          setProjectFromData(data)
          if(response?.data?.target_repo_url) {
            APIService.new().overrideURL(response.data.target_repo_url).get().then(res => {
              setRepo(res.data || {})
              fetchVersions(res.data?.url, res.data?.version)
            })
          }
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
      setName(response.data?.name || '')
      setDescription(response.data?.description || '')
      setOwner(response.data?.owner_url)
      setRetired(Boolean(response.data?.include_retired))
      setMatchAPI(response.data?.match_api_url)
      setMatchAPIToken(response.data?.match_api_token)
      if(response.data?.match_api_url)
        setSemanticBatchSize(response.data?.batch_size || SEMANTIC_BATCH_SIZE)
      setCandidatesScore(response.data?.score_configuration)
      setProject(response.data)
      setConfigure(false)
    })
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
                           <Tooltip title="Clear Filter">
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
      headerName: 'Target Code',
      width: columnWidth['_targetCode_'] || 300,
      renderCell: params => {
        const targetConcept = mapSelected[params.row.__index]
        if(targetConcept?.url) {
          return <Concept firstChild concept={targetConcept} noScore onCardClick={false} />
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
    setMatchTypes({very_high: 0, high: 0, low: 0, no_match: 0})
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

  const setProjectFromData = jsonData => {
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
        _decisions[index] = data['__Decision__'] === 'None' ? undefined : data['__Decision__']
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
      if(_repo?.url) {
        fetchRepo(_repo.url, _repo)
        fetchVersions(_repo.url, _repo.version)
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
    const formData = new FormData();
    formData.append('file', f);
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
    let service = APIService.new().overrideURL(owner).appendToUrl('map-projects/')
    if(project?.id)
      service = service.appendToUrl(project.id + '/').put(formData, null, {"Content-Type": "multipart/form-data"})
    else
      service = service.post(formData, null, {"Content-Type": "multipart/form-data"})

    service.then(response => {
      setIsSaving(false)
      if(response?.data?.id) {
        setConfigure(false)
        setProject(response.data)
        if(response.data.url)
          history.push(response.data.url)
        baseSetAlert({severity: 'success', message: 'Successfully Saved.', duration: 2000})

        APIService.new().overrideURL(response.data.url).appendToUrl('logs/').post({logs: logs}).then(() => {})
      }
    })
  }

  const log = (data, index) => {
    let idx = index === undefined ? rowIndex : index
    setLogs(prev => ({...prev, [idx]: [{...data, created_at: moment().toDate(), user: user.username || user.id}, ...(prev[idx] || [])]}))
  }

  const fetchRepo = (url, _repo) => APIService.new().overrideURL(url).get().then(response => setRepo(response.data?.id ? response.data : _repo))

  const fetchMappedSources = url => APIService.new().overrideURL(url).appendToUrl('mapped-sources/?excludeSelf=false&brief=true').get().then(response => setMappedSources(response?.data || []))

  const onRepoVersionChange = version => {
    setRepoVersion(version)
    if(version?.version_url) {
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

  const getPayloadForMatching = (rows, _repo) => {
    return {
      rows: map(rows, row => prepareRow(row)),
      target_repo_url: repoVersion?.version_url || _repo.version_url || _repo.url,
      target_repo: {
        'owner': _repo.owner,
        'owner_type': _repo.owner_type,
        'source_version': repoVersion?.id || _repo.version || _repo.id,
        'source': _repo.short_code || _repo.id
      },
      map_config: getMapConfigs()
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

      try {
        const service = getMatchAPIService()
        const response = await service.post(
          payload,
          (algo === 'custom' && matchAPI && matchAPIToken) ? matchAPIToken : null,
          null,
          {
            includeSearchMeta: true,
            semantic: ['llm', 'custom'].includes(algo),
            bestMatch: true
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
              low: prev.low + (counts?.low || 0),
              no_match: prev.no_match + (sum(values(omit(counts, ['very_high', 'high', 'low']))) || 0)
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
            setMatchedConcepts(prev => [...prev, ...data]);
            activeRequests.delete(promise); // Remove from active set after completion
          });
          activeRequests.add(promise);
        }

        // Wait for at least one request to complete before continuing
        await Promise.race(activeRequests);
      }
    };

    setRowStatuses(prev => {
      prev.unmapped = []
      if(!autoMatchUnmappedOnly)
        prev.readyForReview = []
      return prev
    })
    await processWithConcurrency(repo);
    setEndMatchingAt(moment())
    setLoadingMatches(false)
  };

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

  const prepareRow = csvRow => {
    let row = {}
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
        }
      }
    })
    return row
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
      setLoadingMatches(true)
      getRowsResults(data)
    } else {
      setAlert({message: 'None of the columns are valid for matching, please edit and assign valid columns.'})
      setTimeout(() => setAlert(false), 10000)
    }
    setMatchDialog(false)
  }

  const showMatchSummary = Boolean(data?.length && (loadingMatches || matchedConcepts?.length))
  const getMatchingDuration = () => {
    let start = startMatchingAt
    let end = endMatchingAt
    if(!end)
      end = moment()
    if(!start)
      return false
    return `${moment.duration(end.diff(start)).as('minutes').toFixed(2)} mins`;
  }

  const getCandidatesButtonLabel = () => {
    const matchingDuration = getMatchingDuration()
    if(loadingMatches || matchedConcepts?.length)
      return `Auto Match (${matchingDuration})`
    return 'Auto Match'
  }

  const onMatchTypeChange = bucket => setSelectedMatchBucket(prev => prev === bucket ? false : bucket)

  const getRows = () => {
    let rows = data?.length ? [...data] : []
    if(selectedRowStatus !== 'all')
      rows = filter(rows, r => rowStatuses[selectedRowStatus].includes(r.__index))
    if(selectedMatchBucket) {
      let getIndex = concept => {
        if(selectedMatchBucket === 'no_match')
          return (!concept?.results?.length || !['very_high', 'high', 'low'].includes(concept.results[0].search_meta.match_type)) ? concept.row.__index : null
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
      if(selectedCandidatesScoreBucket === 'unranked' ) {
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
            let score = v?.search_meta?.search_normalized_score
            return isNumber(score) ? score >= minScore && score < maxScore : noScore
          })
          .sort((a, b) => {
            let aScore = a[1].search_meta.search_normalized_score
            let bScore = b[1].search_meta.search_normalized_score
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

  const unrankedCount = filter(mapSelected, target => !target?.search_meta?.search_normalized_score || target?.search_meta?.search_normalized_score < candidatesScore.available)?.length
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
    XLSX.writeFile(workbook, `${name || 'Matched'}.${moment().format('YYYYMMDDHHmmss')}.csv`, { compression: true });
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
    XLSX.utils.book_append_sheet(workbook, worksheet, "Dates");
    return workbook
  }

  const getRowsForDownload = () => {
    return map(data, row => {
      const index = row.__index
      const rowState = getStateFromIndex(index)
      const rowStateLabel = VIEWS[rowState].label
      let concept = mapSelected[index]
      let _repo = concept?.repo
      let newRow = {
        ...row,
        '__Concept ID__': concept?.id,
        '__Concept Name__': concept?.display_name,
        '__Concept URL__': concept?.url,
        '__Map Type__': mapTypes[index],
        '__Match Score__': concept?.search_meta?.search_normalized_score,
        '__Match Type__': concept?.search_meta?.match_type ? startCase(concept.search_meta.match_type) : null,
        '__Decision__': decisions[index] || 'None',
        '__Note__': notes[index] || null,
        '__State__': rowStateLabel,
        '__Proposed__': isEmpty(proposed[index]) ? null : JSON.stringify(proposed[index]),
        '__Repo Version__': _repo?.version || _repo?.id,
        '__Repo ID__': _repo?.short_code || _repo?.id,
        '__Repo URL__': _repo?.version_url || _repo?.url
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

    if(repo?.id) {
      fetchOtherCandidates(csvRow)
      getFacets(csvRow)
    }

    const el = document.querySelector(`div[data-id="${csvRow.__index}"]`)
    if(el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" })
    }
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
    if(next){
      const nextRow = data[selectedRowStatus === 'all' ? rowIndex + 1 : find(rowStatuses[selectedRowStatus], idx => idx > rowIndex)]
      if(nextRow !== undefined)
        setTimeout(() => onCSVRowSelect(nextRow), 300)
      log({'action': 'approved'})
    }
  }

  const getConceptLabel = concept => `${concept?.repo?.short_code || repo?.short_code || repo?.id}:${concept.repo?.version || concept.repo?.id || repo?.version || repo?.id}:${concept.id} ${concept.display_name || ''}`

  const isSelectedForMap = (concept, index) => mapSelected[index || rowIndex]?.url == concept.url

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
      low: (counts?.low || 0),
      no_match: sum(values(omit(counts, ['very_high', 'high', 'low']))) || 0
    });
  }

  const onDecisionTabChange = (event, newValue) => {
    setShowItem(false)
    setDecisionTab(newValue)
    if(newValue === 'candidates' && repo?.id && !find(otherMatchedConcepts, c => c.row.__index === rowIndex)?.results?.length) {
      fetchOtherCandidates()
    }
    if(newValue === 'search' && isEmpty(facets[rowIndex]))
      getFacets()
  }

  const onDecisionChange = (event, newValue) => {
    let logged = false
    if(newValue === 'rejected') {
      let selected = mapSelected[rowIndex]
      selected = getConcept(selected) || selected
      if(selected?.id) {
        let conceptLabel = getConceptLabel(selected)
        let comment = `Rejected ${conceptLabel}`
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
      setAlert({message: 'Proposed successfully.', duration: 2, severity: 'success'})
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
      log({action: newValue || 'decision_changed', description: 'Desicion Changed to None', extras: newValue ? {} : {decision: 'None'}})
  }

  const toggleRetired = () => {
    let newRetired = !retired
    setRetired(newRetired)
    if(decisionTab === 'search')
      search(null, null, null, newRetired)
    else if(decisionTab === 'candidates') {
      setOtherMatchedConcepts([...reject(otherMatchedConcepts, c => c.row.__index === row.__index)])
      fetchOtherCandidates(null, 0, newRetired)
    }
  }

  const fetchOtherCandidates = (_row, offset=0, _retired, scrollToBottom) => {
    setAlert(false)
    if(isAnyValidColumn()) {
      let __row = isEmpty(_row) ? row : _row
      setIsLoadingInDecisionView(true)
      const payload = getPayloadForMatching([__row], repo)
      const service = getMatchAPIService()
      service.post(
        payload,
        (algo === 'custom' && matchAPI && matchAPIToken) ? matchAPIToken : null,
        null,
        {
          includeSearchMeta: true,
          includeMappings: true,
          includeRetired: isBoolean(_retired) ? _retired : retired,
          mappingBrief: true,
          mapTypes: 'SAME-AS,SAME AS,SAME_AS',
          verbose: true,
          limit: 10,
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
          let items = get(response.data, '0.results') || []
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
        });
    } else {
      setAlert({message: 'None of the columns are valid for matching, please edit and assign valid columns.'})
      setTimeout(() => setAlert(false), 6000)
    }
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
      ...getFacetQueryParam(appliedFilters || appliedFacets[rowIndex])
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

  const getFacets = _row => {
    APIService.new().overrideURL(repoVersion.version_url).appendToUrl('concepts/').get(null, null, {
      q: searchStr,
      includeRetired: retired,
      facetsOnly: true
    }).then(response => {
      setFacets({...facets, [_row?.__index === undefined ? row.__index : _row.__index]: response?.data?.facets?.fields || {}})
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


  const isSplitView = Boolean(rowIndex !== undefined) || (configure && file?.name)
  const rows = getRows()

  const getConcept = concept => concept?.url ? conceptCache[concept.url] || concept : concept

  const onProposedUpdate = proposedState => setProposed(prev => ({...prev, [rowIndex]: {...proposedState}}))

  const onCandidatesOrderChange = (property, order) => {
    setCandidatesOrderBy(property)
    setCandidatesOrder(order)
    let candidates = find(otherMatchedConcepts, c => c.row.__index === rowIndex)?.results || []
    if(candidates.length) {
      const newCandidates = [...otherMatchedConcepts]
      const index = findIndex(otherMatchedConcepts, c => c.row.__index === rowIndex)
      newCandidates[index].results = orderBy(candidates, property, order)
      setOtherMatchedConcepts(newCandidates)
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
    return 'unranked'
  }

  return (
    <div className='col-xs-12 padding-0' style={{borderRadius: '10px', width: 'calc(100vw - 32px)'}}>
      {
        loadingProject &&
          <LoaderDialog open message='Loading project...'/>
      }
      <Split
        sizes={isSplitView ? [50, 50] : [100, 0]} // initial % widths
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
                  />
                </div>
          }
          <div className='col-xs-12 padding-0' style={{backgroundColor: SURFACE_COLORS.main, marginLeft: '-5px', paddingBottom: '0px', paddingLeft: '0px', paddingTop: '0px', display: 'flex', justifyContent: 'space-between'}}>
            {
              !(configure && !file?.name) &&
                <span style={{display: 'flex', alignItems: 'center'}}>
                  {
                    name &&
                      <span style={{fontWeight: 'bold', fontSize: '18px', maxWidth: isSplitView ? '300px' : '500px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', marginRight: '8px'}}>
                        {name}
                      </span>
                  }
                  <Tooltip title='Configure Mapping Project'>
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
                    loadingMatches &&
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
                        {abortRef.current ? 'Stopping gracefully...' : 'Stop Processing'}
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
              <div className='col-xs-12' style={{padding: '8px 14px', display: 'flex', alignItems: 'center', backgroundColor: SURFACE_COLORS.main}}>
                <FormControl>
                  <SearchField onChange={debounce(val => setSearchText(val || ''))} />
                </FormControl>
                <FormControlLabel
                  sx={{
                    marginLeft: '10px',
                    '.MuiFormControlLabel-label': {fontSize: '0.8125rem'}
                  }}
                  control={<Switch disabled={!showMatchSummary || selectedRowStatus === 'unmapped'} size="small" checked={selectedMatchBucket === 'very_high'} onChange={() => onMatchTypeChange('very_high')} />}
                  label={`Auto Match (${(matchTypes.very_high || 0).toLocaleString()})`}
                />
                <ScoreBucketButton
                  selected={selectedCandidatesScoreBucket}
                  onSort={() => setScoreBucketSortBy(scoreBucketSortBy === 'desc' ? 'asc' : 'desc')}
                  sortBy={scoreBucketSortBy}
                  onClick={bucket => setSelectedCandidatesScoreBucket(selectedCandidatesScoreBucket === bucket ? false : bucket)}
                  recommended={recommendedCount}
                  available={availableCount}
                  unranked={unrankedCount}
                />
                {
                  selectedRowStatus === 'unmapped' &&
                    <Chip
                      label={`Rejected (${keys(pickBy(decisions, value => value === 'rejected')).length})`}
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
                      sx={{marginLeft: '10px'}}
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
                              label={`${startCase(_decision)} (${count})`}
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
                              sx={{marginLeft: '10px'}}
                            />
                          )
                        })
                      }
                    </React.Fragment>
                }
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
                    }
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
            Auto Match
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
            <RepoSearchAutocomplete label='Map Target' size='small' onChange={(id, item) => onRepoChange(item)} value={repo} />
            <RepoVersionSearchAutocomplete versions={versions} label='Version' size='small' onChange={(id, item) => onRepoVersionChange(item)} value={repoVersion} sx={{marginTop: '10px'}} />
            <FormControlLabel sx={{marginTop: '8px'}} control={<Checkbox checked={autoMatchUnmappedOnly} onChange={event => setAutoMatchUnmappedOnly(event.target.checked)} />} label="Unmapped Only" />
            {!autoMatchUnmappedOnly && <FormHelperText sx={{marginTop: '-4px'}}>This will not affect Approved Matches but will override other existing matches</FormHelperText>}
          </DialogContent>
          <DialogActions sx={{padding: '16px'}}>
            <Button
              color='default'
              variant='contained'
              size='small'
              sx={{textTransform: 'none'}}
              onClick={() => setMatchDialog(false)}
            >
              Close
            </Button>
            <Button
              variant='contained'
              size='small'
              sx={{textTransform: 'none', marginLeft: '12px'}}
              endIcon={<DoubleArrowIcon />}
              disabled={!repo?.url}
              onClick={onGetCandidatesSubmit}
            >
              Submit
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
              />
            </div> :
          (
            <>
              <div className='col-xs-12' style={{padding: '8px 16px'}}>
                <div className='col-xs-12 padding-0' style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                  <Typography component='span' sx={{fontSize: '20px', color: 'surface.dark', fontWeight: 600}}>
                    Mapping Decisions
                    <Chip sx={{padding: '0 6px', marginLeft: '12px'}} variant='outlined' label={startCase(getStateFromIndex(rowIndex))} {...VIEWS[getStateFromIndex(rowIndex)]} />
                  </Typography>
                  <CloseIconButton color='secondary' onClick={onCloseDecisions} />
                </div>
                <MappingDecisionResult
                  targetConcept={targetConcept}
                  row={row}
                  rowIndex={rowIndex}
                  repo={repo}
                  mapTypes={mapTypes}
                  allMapTypes={allMapTypes}
                  onMap={onMap}
                  proposed={proposed[rowIndex]}
                  columns={columns}
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
                    Approve and Next
                  </Button>
                  <Button size='small' disabled={rowStatuses.reviewed.includes(rowIndex) || decisions[rowIndex] === 'none' || !decisions[rowIndex]} color='primary' onClick={() => onReviewDone(false)} variant='outlined' sx={{textTransform: 'none', marginLeft: '8px'}}>
                    Approve
                  </Button>
                  <Button size='small' disabled={decisions[rowIndex] === 'none' || !decisions[rowIndex]} color='error' onClick={(event) => onDecisionChange(event, 'rejected')} variant='outlined' sx={{textTransform: 'none', marginLeft: '8px'}}>
                    Reject
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
                            label={startCase(_tab)}
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
                      candidatesScore={candidatesScore}
                      rowIndex={rowIndex}
                      alert={alert}
                      setAlert={setAlert}
                      candidates={otherMatchedConcepts}
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
                      retired={retired}
                      setRetired={toggleRetired}
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
                      facets={facets[rowIndex]}
                      appliedFacets={appliedFacets[rowIndex]}
                      isLoading={isLoadingInDecisionView}
                      setAppliedFacets={(filters) => {
                        setAppliedFacets({...appliedFacets, [rowIndex]: filters})
                        search(null, null, null, null, filters)
                      }}
                      retired={retired}
                      setRetired={toggleRetired}
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
              />
            </>
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
            sx={{
              '& .MuiDialog-paper': {
                borderRadius: '28px',
                minWidth: '312px',
                minHeight: '262px',
                padding: 0
              }
            }}
          >
            <ConceptHome
              style={{borderRadius: 0}}
              detailsStyle={{height: 'calc(100vh - 550px)'}}
              source={repo}
              repo={repoVersion}
              url={showItem.url}
              concept={showItem}
              onClose={() => setShowItem(false)}
              onMap={onMap}
              isSelectedForMap={isSelectedForMap}
            />
          </Dialog>
      }
    </div>
  )
}

export default MapProject;
