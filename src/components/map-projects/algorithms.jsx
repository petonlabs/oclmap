import React from 'react'
import orderBy from 'lodash/orderBy'
import MatchingIcon from '@mui/icons-material/DeviceHub';
import { toV3URL } from '../../common/utils'

export const useAlgos = (t, toggles, canBridge, canScispacy, Trans) => {
  const algos = [
    {
      'id': 'ocl-semantic',
      'getIcon': (props) => <MatchingIcon color='primary' {...props} />,
      'name': t('map_project.ocl_semantic_algorithm'),
      'description': t('map_project.algorithm_llm_description'),
      'type': 'ocl-semantic',
      'provider': 'ocl',
      'order': 0,
      'batch_size': 10,
      'concurrent_requests': 2,
      'query_params': {
        'semantic': true
      },
      'disabled': !toggles.SEMANTIC_SEARCH_TOGGLE,
      'allow_multiple': false
    },
    {
      'id': 'ocl-search',
      'getIcon': (props) => <MatchingIcon {...props} />,
      'name': t('map_project.ocl_search_algorithm'),
      'description': t('map_project.algorithm_es_description'),
      'type': 'ocl-search',
      'provider': 'ocl',
      'order': 1,
      'batch_size': 50,
      'concurrent_requests': 2,
      'disabled': false,
      'allow_multiple': false
    },
    {
      'id': 'custom',
      'getIcon': (props) => <i className="fa-solid fa-square-arrow-up-right" style={props.sx} />,
      'name': t('map_project.ocl_custom_algorithm'),
      'type': 'custom',
      'description': t('map_project.algorithm_custom_description'),
      'provider': 'external',
      'batch_size': 1,
      'order': 2,
      'url': undefined,
      'token': undefined,
      'concurrent_requests': 1,
      'disabled': false,
      'allow_multiple': true
    },
    {
      'id': 'ocl-ciel-bridge',
      'getIcon': (props) => <i className="fa-solid fa-bridge" style={props.sx} />,
      'name': (
        <Trans
          i18nKey='map_project.bridge_terminology_search'
          components={[
            <sup key="1"/>
          ]}
        />
      ),
      'description': (
        <Trans
          i18nKey='map_project.bridge_terminology_search_description'
          components={[
            <a key="0" href={`${toV3URL('/orgs/CIEL/sources/CIEL/')}`} target="_blank" rel="noreferrer noopener"/>
          ]}
        />
      ),
      'type': 'ocl-ciel-bridge',
      'provider': 'ocl',
      'batch_size': 10,
      'order': 3,
      'concurrent_requests': 2,
      'target_repo_url': '/orgs/CIEL/sources/CIEL/',
      'query_params': {
        'semantic': true
      },
      'disabled': !canBridge,
      'allow_multiple': true
    },
    {
      'id': 'ocl-scispacy-loinc',
      'name': (
        <Trans
          i18nKey='map_project.scispacy_loinc_search'
          components={[
            <sup key="1"/>
          ]}
        />
      ),
      'type': 'ocl-scispacy',
      'provider': 'ocl',
      'order': 4,
      'batch_size': 2,
      'concurrent_requests': 1,
      'disabled': !canScispacy,
      'allow_multiple': false
    }
  ]
  return orderBy(algos, 'order')
}
