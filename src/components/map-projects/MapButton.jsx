import React from 'react'

import ButtonGroup from '@mui/material/ButtonGroup';
import Button from '@mui/material/Button'
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import ListSubheader from '@mui/material/ListSubheader';


import MapIcon from '@mui/icons-material/Link';
import UnmapIcon from '@mui/icons-material/LinkOff';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

const MapButton = ({options, isMapped, onClick, selected, sx, color, variant, simple, mapOnly, usedMapTypes}) => {
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef(null);
  const [mapType, setMapType] = React.useState(selected || 'SAME-AS');
  const handleMenuItemClick = (
    event,
    newMapType
  ) => {
    event.preventDefault()
    event.stopPropagation()
    event.persist()

    setMapType(newMapType || 'SAME-AS');
    setOpen(false);
    if(isMapped)
      onClick(event, true, newMapType)
  };

  const handleToggle = event => {
    event.stopPropagation()
    event.preventDefault()
    setOpen((prevOpen) => !prevOpen)
  };

  const handleClose = (event) => {
    event.stopPropagation()
    event.preventDefault()

    if (anchorRef.current && anchorRef.current.contains(event.target))
      return;

    setOpen(false);
  };

  React.useEffect(() => {
    setMapType(selected || 'SAME-AS')
  }, [selected])

  const usedOptions = options?.filter(option => usedMapTypes?.includes(option))
  const recommendedOptions = options?.filter(option => !usedMapTypes?.includes(option) && ['SAME-AS', 'BROADER-THAN', 'NARROWER-THAN'].includes(option))
  const otherOptions = options?.filter(option => !usedOptions?.includes(option) && !recommendedOptions.includes(option))

  return (
    <React.Fragment>
      {
        simple ?
          <Button
            size='small'
            color={color || (isMapped ? 'error' : 'primary')}
            variant={variant || "contained"}
            sx={{textTransform: 'none', whiteSpace: 'nowrap', minWidth: '92px', ...sx}}
            onClick={event => onClick(event, !isMapped, mapType)}
            startIcon={isMapped ? <UnmapIcon fontSize='inherit' /> : <MapIcon fontSize='inherit' />}
          >
            {isMapped ? 'Un-Map' : 'Map'}
          </Button> :
        (
          mapOnly && isMapped ?
            <Button
              size="small"
              aria-controls={open ? 'split-button-menu' : undefined}
              aria-expanded={open ? 'true' : undefined}
              aria-label="select merge strategy"
              aria-haspopup="menu"
              onClick={handleToggle}
              color='primary'
              variant="contained"
              sx={{textTransform: 'none', whiteSpace: 'nowrap', ...sx}}
              startIcon={<MapIcon fontSize='inherit' />}
              endIcon={<ArrowDropDownIcon fontSize='inherit' />}
              ref={anchorRef}
            >
              {mapType}
            </Button> :
          <ButtonGroup
            size='small'
            variant={variant || (isMapped ? "outlined": "contained")}
            ref={anchorRef}
            aria-label="Button group with a nested menu"
            color={color || (isMapped ? 'error' : 'primary')}
            sx={sx}
          >
            <Button
              size='small'
              sx={{textTransform: 'none', whiteSpace: 'nowrap'}}
              onClick={event => onClick(event, !isMapped, mapType)}
              startIcon={isMapped ? <UnmapIcon fontSize='inherit' /> : <MapIcon fontSize='inherit' />}
            >
              {mapType}
            </Button>
            <Button
              size="small"
              aria-controls={open ? 'split-button-menu' : undefined}
              aria-expanded={open ? 'true' : undefined}
              aria-label="select merge strategy"
              aria-haspopup="menu"
              onClick={handleToggle}
            >
              <ArrowDropDownIcon />
            </Button>
          </ButtonGroup>
        )
      }
      <Popper
        sx={{
          zIndex: 3,
        }}
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
              placement === 'bottom' ? 'center top' : 'center bottom',
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList id="split-button-menu" autoFocusItem sx={{maxHeight: '400px', overflow: 'auto', paddingTop: 0, paddingBottom: 0}}>
                  {
                    usedOptions.length > 0 &&
                      <>
                        <ListSubheader sx={{fontSize: '12px', lineHeight: '32px'}}>Used in this Project</ListSubheader>
                        {
                          usedOptions.map(option => (
                            <MenuItem
                              key={option}
                              selected={option === mapType}
                              onClick={event => handleMenuItemClick(event, option)}
                            >
                              {option}
                            </MenuItem>
                          ))
                        }
                      </>
                  }
                  {
                    recommendedOptions.length > 0 &&
                      <>
                        <ListSubheader sx={{fontSize: '12px', lineHeight: '32px'}}>Recommended</ListSubheader>
                        {
                          recommendedOptions.map(option => (
                            <MenuItem
                              key={option}
                              selected={option === mapType}
                              onClick={event => handleMenuItemClick(event, option)}
                            >
                              {option}
                            </MenuItem>
                          ))
                        }
                      </>
                  }
                  {
                    otherOptions.length > 0 &&
                      <>
                        <ListSubheader sx={{fontSize: '12px', lineHeight: '32px'}}>All Options</ListSubheader>
                        {
                          otherOptions.map(option => (
                            <MenuItem
                              key={option}
                              selected={option === mapType}
                              onClick={event => handleMenuItemClick(event, option)}
                            >
                              {option}
                            </MenuItem>
                          ))
                        }
                      </>
                  }
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </React.Fragment>
  )
}

export default MapButton;
