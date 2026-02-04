import React from 'react'
import moment from 'moment'
import { useTranslation } from 'react-i18next'

import Timeline  from '@mui/lab/Timeline';
import TimelineItem, { timelineItemClasses } from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';

import OpenIcon from '@mui/icons-material/CropSquare';
import RepoIcon from '../repos/RepoIcon'
import HistoryIcon from '@mui/icons-material/ChangeHistory';
import DownloadIcon from '@mui/icons-material/Download';
import AutoMatchIcon from '@mui/icons-material/MotionPhotosAutoOutlined';

import map from 'lodash/map'
import orderBy from 'lodash/orderBy'
import startCase from 'lodash/startCase'

import { PRIMARY_COLORS } from '../../common/colors'
import { toV3URL } from '../../common/utils'
import CloseIconButton from '../common/CloseIconButton';


const ProjectLogs = ({onClose, logs}) => {
  const { t } = useTranslation()

  const getIconAndColor = log => {
    const action = log?.action?.toLowerCase()
    if(action === 'created')
      return [<i key="created" className="fa-brands fa-octopus-deploy" style={{color: PRIMARY_COLORS.main, fontSize: '1.25rem', width: '1em', height: '1em'}}></i>, 'primary']
    if(action === 'updated')
      return [<HistoryIcon key='update' color='warning' />, 'warning']
    if(action === 'saved_to_collection')
      return [<RepoIcon key='collection' selected noTooltip />, 'primary']
    if(action === 'opened')
      return [<OpenIcon key='open' />, 'secondary']
    if(action === 'downloaded')
      return [<DownloadIcon key='download' />, 'secondary']
    if(action === 'auto_matched')
      return [<AutoMatchIcon key='auto_match' color='primary' />, 'primary']
    return [<HistoryIcon key='log' color='warning' />, 'warning']
  }


  const formatSubAction = subAction => {
    let result = '';
    if(subAction.startsWith('with_')) {
      result = 'with '
      subAction = subAction.replace('with_', '')
    }
    if(subAction.includes('ai_analysis'))
      result += 'AI Analysis'
    else
      result += startCase(subAction)
    return result
  }

  const getTitle = log => {
    if(log.action === 'saved_to_collection' && log.extras?.collection_url && log.extras?.id)
      return <span>
               {t('map_project.saved_to_collection')}
               <a className='no-anchor-styles' style={{color: PRIMARY_COLORS.main, marginLeft: '4px'}} target='_blank' href={toV3URL(log.extras.collection_url)} rel="noreferrer">
                 {log.extras.id}
               </a>
             </span>
    if(log.action === 'auto_matched') {
      return <span>
               {t('map_project.auto_matched')}
               {
                 log.extras?.sub_actions?.length ?
                <span style={{marginLeft: '4px'}}>
                  {`(${map(log.extras.sub_actions, formatSubAction).join(', ')})`}
                </span> :
                null
               }
             </span>
    }

    if(log.description)
      return log.description
    return startCase(log.action)
  }

  return (
    <div className='col-xs-12 padding-0'>
      <div className='col-xs-12' style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px'}}>
        <Typography component='span' sx={{fontSize: '22px', color: 'surface.dark', fontWeight: 600, display: 'flex', alignItems: 'center'}}>
          {t('map_project.project_logs')}
        </Typography>
        <CloseIconButton color='secondary' onClick={onClose} />
      </div>
      <div className='col-xs-12 padding-0' style={{maxHeight: 'calc(100vh - 190px)', overflow: 'auto'}}>
        <Timeline
          sx={{
            padding: '4px 20px',
            marginBottom: 0,
            [`& .${timelineItemClasses.root}:before`]: {
              flex: 0,
              padding: 0,
            },
          }}
        >
          {
            map(orderBy(logs, log => moment(log.created_at), ['desc']), (log, index) => {
              const [icon, color] = getIconAndColor(log)
              return (
                <TimelineItem key={log.created_at.toString()}>
                  <TimelineSeparator>
                    <Tooltip title={startCase(log.action)}>
                      <TimelineDot color={color} variant="outlined">
                        {icon}
                      </TimelineDot>
                    </Tooltip>
                    {
                      index !== (logs.length - 1) &&
                        <TimelineConnector />
                    }
                  </TimelineSeparator>
                  <TimelineContent>
                    <Typography component="span" sx={{fontSize: '14px'}}>
                      {getTitle(log)}
                    </Typography>
                    <Typography sx={{fontSize: '12px', color: 'rgba(0, 0, 0, 0.7)'}}>
                      {log.user} at {moment(log.created_at).format('ll LTS')}
                    </Typography>
                  </TimelineContent>
                </TimelineItem>
              )

            })
          }
        </Timeline>
      </div>
    </div>
  )
}

export default ProjectLogs
