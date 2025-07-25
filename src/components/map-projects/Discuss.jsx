import React from 'react'
import moment from 'moment'

import Timeline  from '@mui/lab/Timeline';
import TimelineItem, { timelineItemClasses } from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button'
import CommentIcon from '@mui/icons-material/Message';
import MapIcon from '@mui/icons-material/Link';
import UnmapIcon from '@mui/icons-material/LinkOff';
import RejectIcon from '@mui/icons-material/Clear';
import AutoMatchIcon from '@mui/icons-material/MotionPhotosAutoOutlined';

import map from 'lodash/map'
import startCase from 'lodash/startCase'
import orderBy from 'lodash/orderBy'


const Discuss = ({ logs, onAdd }) => {
  const [comment, setComment] = React.useState('')
  const getTitle = log => {
    if(['mapped', 'unmapped', 'auto-matched', 'rejected'].includes(log.action)) {
      let description = `${startCase(log.action)}: ${log.extras.name}`
      if(log?.extras?.map_type || log?.extras?.mapType) {
        description += ` (${log.extras.map_type || log.extras.mapType})`
      }
      return description
    }
    if(['commented'].includes(log.action)) {
      return <b>{log.description}</b>
    }
    return log.description || startCase(log.action)
  }

  const getIcon = (log, color) => {
    if(log.action === 'commented')
      return <CommentIcon fontSize='small' color={color} />
    if(['mapped'].includes(log.action))
      return <MapIcon fontSize='small' color={color} />
    if(['auto-matched'].includes(log.action))
      return <AutoMatchIcon fontSize='small' color={color} />
    if(log.action === 'unmapped')
      return <UnmapIcon fontSize='small' color={color} />
    if(log.action === 'rejected')
      return <RejectIcon fontSize='small' color={color} />
    return log.user.slice(0, 2).toUpperCase()
  }

  const getDotColor = log => {
    if(['unmapped', 'rejected'].includes(log.action))
      return 'error'
    if(['proposed'].includes(log.action))
      return 'warning'
    if(['mapped', 'auto-matched'].includes(log.action))
      return 'primary'
    return undefined
  }

  const onClick = () => {
    onAdd(comment)
    setComment('')
  }


  return (
    <>
      <Timeline
        sx={{
          maxHeight: 'calc(100vh - 560px)',
          overflow: 'auto',
          padding: '4px 16px',
          marginBottom: 0,
          [`& .${timelineItemClasses.root}:before`]: {
            flex: 0,
            padding: 0,
          },
        }}
      >
        {
          map(orderBy(logs, log => moment(log.created_at), ['desc']), (log, index) => {
            const dotColor = getDotColor(log)
            return (
              <TimelineItem key={log.created_at.toString()}>
                <TimelineSeparator>
                  <Tooltip title={startCase(log.action)}>
                    <TimelineDot color={dotColor} variant="outlined">
                      {getIcon(log, dotColor)}
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
                  <Typography sx={{fontSize: '12px', color: 'rgba(0, 0, 0, 0.7)'}}>{log.user} at {moment(log.created_at).format('ll LTS')}</Typography>
                </TimelineContent>
              </TimelineItem>
            )
          })
        }
      </Timeline>
      <div className='col-xs-12' style={{padding: '4px 16px'}}>
        <TextField
          autoFocus
          fullWidth
          multiline
          minRows={2}
          maxRows={4}
          value={comment}
          label='Comment'
          onChange={event => setComment(event.target.value || '')}
          sx={{
            '.MuiInputBase-root': {
              fontSize: '14px',
              padding: '4px 8px',
              '.MuiInputBase-inputMultiline': {
                height: '20px'
              }
            }
          }}
        />
        <Button onClick={onClick} sx={{textTransform: 'none', marginTop: '8px'}} variant='outlined' color='primary'>
          Comment
        </Button>
      </div>
    </>
  )
}

export default Discuss;
