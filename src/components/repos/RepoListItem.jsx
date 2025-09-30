import React from 'react';
import { ListItem, ListItemText, Chip } from '@mui/material';
import RepoFilledIcon from '@mui/icons-material/Folder';
import { PRIMARY_COLORS } from '../../common/colors'
import OwnerIcon from '../common/OwnerIcon'
import RepoTooltip from './RepoTooltip'

const RepoListItem = ({ option, listItemProps, sx }) => {
  let owner = {id: option.owner, type: option.ownerType}
  return (
    <ListItem
      {...listItemProps}
      alignItems="flex-start"
      sx={{alignItems: 'flex-start', ...sx}}
    >
      <ListItemText
        primary={
          <RepoTooltip repo={option}>
          <Chip
            sx={{
              borderRadius: '4px',
              minWidth: '95px',
              border: '1px solid',
              borderColor: 'surface.nv80',
              justifyContent: 'flex-start',
              backgroundColor: "#FFF",
              '&:hover': {
                backgroundColor: `${PRIMARY_COLORS['95']} !important`,
                textDecoration: 'none !important'
              },
              '&:active': {
                outline: 'none',
                outlineOffset: 0,
                textDecoration: 'none !important'
              },
              height: '36px',
              fontSize: '14px',
              padding: '8px 12px',
              '.MuiChip-label': {
                paddingLeft: 0,
              },
              '.MuiAvatar-root': {
                width: '18px',
                height: '18px',
                margin: '1px 6px 1px 0',
                backgroundColor: 'transparent'
              },
              '.MuiSvgIcon-root': {
                color: '#000',
                fontSize: '18px',
                width: '18px',
                height: '18px',
                margin: '1px 6px 1px 0',
                backgroundColor: 'transparent'
              },
              '.divider-span': {
                width: '3px',
                height: '3px',
                backgroundColor: 'secondary.main',
                margin: '0 8px',
                borderRadius: '100px',
                opacity: 0.8,
              },
              '.entity-type': {
                color: 'secondary.main',
              },
              '.entity-name': {
                color: '#000',
              },
              '.entity-id': {
                color: '#000',
              }
            }}
            label={
              <span style={{display: 'flex', alignItems: 'center'}} className='entity-label'>
                <span style={{display: 'flex', alignItems: 'center'}} className='owner entity-label'>
                  <OwnerIcon noLink noTooltip strict ownerType={option.ownerType} owner={owner} />
                  <span className='entity-id'><b>{owner.id}</b></span>
                </span>
                <span className='divider-span' />
                <span style={{display: 'flex', alignItems: 'center'}} className='repo entity-label'>
                  <RepoFilledIcon />
                  <span className='entity-id'><b>{option.short_code || option.id}</b></span>
                  <span className='divider-span' />
                  <span className='entity-type'>{option.type}</span>
                </span>
              </span>
            }
            />
          </RepoTooltip>
        }
      />
    </ListItem>

  )
}

export default RepoListItem;
