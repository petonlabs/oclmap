import React from 'react'
import ListIcon from '@mui/icons-material/FormatListNumbered';
import UnMappedIcon from '@mui/icons-material/LinkOff';
import MappedIcon from '@mui/icons-material/Link';
import ReviewedIcon from '@mui/icons-material/FactCheckOutlined';
import AutoMatchIcon from '@mui/icons-material/MotionPhotosAutoOutlined';
import MediumMatchIcon from '@mui/icons-material/Rule';
import LowMatchIcon from '@mui/icons-material/DynamicForm';
import NoMatchIcon from '@mui/icons-material/RemoveRoad';

export const HEADERS = [
  {id: 'id', label: 'ID'},
  {id: 'name', label: 'Name'},
  {id: 'synonyms', label: 'Synonyms'},
  {id: 'description', label: 'Description'},
  {id: 'concept_class', label: 'Concept Class'},
  {id: 'datatype', label: 'Datatype'},
  {id: 'same_as_map_codes', label: 'Same As Codes'},
  {id: 'other_map_codes', label: 'Concept Set'},
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
