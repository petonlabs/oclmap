import React from 'react'
import ListIcon from '@mui/icons-material/FormatListNumbered';
import UnMappedIcon from '@mui/icons-material/LinkOff';
import MappedIcon from '@mui/icons-material/Link';
import ReviewedIcon from '@mui/icons-material/FactCheckOutlined';
import AutoMatchIcon from '@mui/icons-material/MotionPhotosAutoOutlined';
import MediumMatchIcon from '@mui/icons-material/Rule';
import LowMatchIcon from '@mui/icons-material/DynamicForm';
import NoMatchIcon from '@mui/icons-material/RemoveRoad';

const ID_HEADER = {id: 'id', label: 'ID', description: 'Exact match on concept ID'}
const COMMON_HEADERS = [
  {id: 'description', label: 'Description', description: 'Basic string search on concept descriptions'},
  {id: 'concept_class', label: 'Property: Class', description: 'String matching on concept class (e.g. diagnosis, symptom)'},
  {id: 'datatype', label: 'Property: Datatype', description: 'String matching on concept datatype (e.g. numeric, coded)'},
  {id: 'same_as_map_codes', label: 'Same As Codes', description: 'Matches the SAME-AS concept ID'},
  {id: 'other_map_codes', label: 'Concept Set', description: 'Matches Concept Set ID'},
]

export const HEADERS = [
  ID_HEADER,
  {id: 'name', label: 'Name', description: 'Fuzzy string search on primary display name'},
  {id: 'synonyms', label: 'Synonyms', description: 'Fuzzy string search on all concept names and synonyms'},
  ...COMMON_HEADERS
]

export const SEMANTIC_SEARCH_HEADERS = [
  ID_HEADER,
  {id: 'name', label: 'Name', description: 'Semantic search (cosine similarity) on primary display name'},
  {id: 'synonyms', label: 'Synonyms', description: 'Semantic search (cosine similarity) on all concept names and synonyms'},
  ...COMMON_HEADERS
]

export const ROW_STATES = ['unmapped', 'readyForReview', 'reviewed']
export const VIEWS = {
  all: {
    label: 'All',
    icon: <ListIcon fontSize='small' />,
    color: 'grey',
  },
  unmapped: {
    label: 'Unmapped',
    icon: <UnMappedIcon fontSize='small' />,
    color: 'secondary',
  },
  readyForReview: {
    label: 'Proposed',
    icon: <MappedIcon fontSize='small' />,
    color: 'warning',
  },
  reviewed: {
    label: 'Approved',
    icon: <ReviewedIcon fontSize='small' />,
    color: 'primary',
  },
}

export const MATCH_TYPES = {
  very_high: {
    label: 'Auto Match',
    icon: <AutoMatchIcon fontSize='small' />,
    color: 'primary',
  },
  high: {
    label: 'High Match',
    icon: <MediumMatchIcon fontSize='small' />,
    color: 'warning',
  },
  low: {
    label: 'Low Match',
    icon: <LowMatchIcon fontSize='small' />,
    color: 'secondary',
  },
  no_match: {
    label: 'No Match',
    icon: <NoMatchIcon fontSize='small' />,
    color: 'error',
  },
}

export const DECISION_TABS = ['candidates', 'propose', 'search']
