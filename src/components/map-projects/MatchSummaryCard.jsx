import React from 'react'
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import { WHITE } from '../../common/colors';
import { useTranslation } from 'react-i18next';

const MatchSummaryCard = ({id, icon, label, count, loading, color, selected, onClick, size, isLast, dividerBgColor }) => {
  const { t } = useTranslation();
  const isSelected = id === selected
  const isLarge = size === 'large'
  const _iconSize = (isLarge ? 32 : 24)
  const iconSize =  _iconSize + 'px'
  const isDisabled = count === '0' && id !== 'all'
  return (
    <div style={{display: 'flex', alignItems: 'center'}}>
      <div className='col-xs-2' style={{padding: '0px 3px', minWidth: '160px', width: 'auto', marginRight: 0 }}>
        <Card variant='outlined' sx={{borderColor: isSelected ? color + '.main' : 'grey.main', cursor: isDisabled ? 'not-allowed' : 'pointer', backgroundColor: isSelected ? 'rgba(72,54,255, 0.1)' : WHITE, opacity: isDisabled ? 0.5 : 1}} onClick={isDisabled ? undefined : onClick}>
          <CardContent sx={{padding: '0px !important'}}>
            <ListItem sx={{padding: '2px 8px'}}>
              <ListItemAvatar sx={{minWidth: 'auto'}}>
                <Box sx={{ position: 'relative' }}>
                  <Avatar sx={{backgroundColor: `${color}.main`, width: iconSize, height: iconSize}}>
                    {icon}
                  </Avatar>
                  {loading && (
                    <CircularProgress
                      size={_iconSize + 8}
                      sx={{
                        color: `${color}.main`,
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        marginTop: '-20px',
                        marginLeft: '-20px'
                      }}
                    />
                  )}
                </Box>
              </ListItemAvatar>
              <ListItemText
                primary={t('map_project.view_' + label.toLowerCase())}
                secondary={count?.toLocaleString()}
                sx={{
                  paddingLeft: '12px',
                  margin: 0,
                  '.MuiListItemText-primary': {
                    fontSize: isLarge ? '12px' : '10px',
                    color: 'rgba(0, 0, 0, 0.7)'
                  },
                  '.MuiListItemText-secondary': {
                    color: '#000',
                    fontSize: isLarge ? '16px' : '12px',
                    fontWeight: 'bold'
                  }
                }}
              />
            </ListItem>
          </CardContent>
        </Card>
      </div>
      {
        !isLast &&
          <Divider sx={{width: '12px', margin: '0 2px', backgroundColor: dividerBgColor, height: '1px'}} />
      }
    </div>
  )
}

export default MatchSummaryCard
