import React from 'react'

import ButtonGroup from '@mui/material/ButtonGroup';
import Button from '@mui/material/Button'
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';


import MapIcon from '@mui/icons-material/Link';
import UnmapIcon from '@mui/icons-material/LinkOff';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

const MapButton = ({options, isMapped, onClick, selected}) => {
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
  return (
    <React.Fragment>
      <ButtonGroup
        size='small'
        variant={isMapped ? "outlined": "contained"}
        ref={anchorRef}
        aria-label="Button group with a nested menu"
        color={isMapped ? 'error' : 'primary'}
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
      <Popper
        sx={{
          zIndex: 1,
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
                <MenuList id="split-button-menu" autoFocusItem sx={{maxHeight: '400px', overflow: 'auto'}}>
                  {options.map(option => (
                    <MenuItem
                      key={option}
                      selected={option === mapType}
                      onClick={event => handleMenuItemClick(event, option)}
                    >
                      {option}
                    </MenuItem>
                  ))}
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
