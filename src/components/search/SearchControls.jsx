import React from 'react';
import { useTranslation } from 'react-i18next'
import Button from '@mui/material/Button';
import DownIcon from '@mui/icons-material/ArrowDropDown';
import DisplayMenu from './DisplayMenu';
import SortMenu from './SortMenu';

const SearchControls = ({ disabled, onDisplayChange, display, order, orderBy, onOrderByChange, sortableFields, noCardDisplay, extraControls, alignLeft, rightControl}) => {
  const { t } = useTranslation()
  const [displayAnchorEl, setDisplayAnchorEl] = React.useState(null);
  const [sortAnchorEl, setSortAnchorEl] = React.useState(null);
  const onDisplayClick = event => setDisplayAnchorEl(event.currentTarget)
  const onDisplayMenuClose = () => setDisplayAnchorEl(null);
  const onSortClick = event => setSortAnchorEl(event.currentTarget)
  const onSortMenuClose = () => setSortAnchorEl(null);

  const getControls = () => {
    return (
      <>
        {extraControls}
        {
          sortableFields?.length > 0 &&
            <Button disabled={Boolean(disabled)} variant='contained' color='default' size='small' style={{textTransform: 'none'}} endIcon={<DownIcon fontSize='inherit' />} onClick={onSortClick}>
              {t('search.sort_by')}
            </Button>
        }
        {
          !noCardDisplay &&
            <Button id="display-menu" disabled={Boolean(disabled)} variant='contained' color='default' size='small' style={{textTransform: 'none', marginLeft: '8px'}} endIcon={<DownIcon fontSize='inherit' />} onClick={onDisplayClick}>
              {t('search.display')}
            </Button>
        }
        {
          !noCardDisplay &&
            <DisplayMenu
              labelId="display-menu"
              anchorEl={displayAnchorEl}
              onClose={onDisplayMenuClose}
              onSelect={onDisplayChange}
              selected={display}
            />
        }
        <SortMenu
          labelId="sort-menu"
          anchorEl={sortAnchorEl}
          onClose={onSortMenuClose}
          onChange={onOrderByChange}
          order={order}
          orderBy={orderBy}
          fields={sortableFields}
        />
      </>
    )
  }

  return (
    <div className='col-xs-12 padding-0' style={{display: 'inline-flex', alignItems: 'center'}}>
      {
        alignLeft ?
          <>
            <div className='col-xs-12 padding-0' style={{float: 'left', textAlign: 'right', display: 'inline-flex', alignItems: 'center', justifyContent: 'space-between'}}>
              <span style={{display: 'flex'}}>
                {getControls()}
              </span>
              {
              rightControl &&
                  <span style={{display: 'flex'}}>
                    {rightControl}
                  </span>
              }
            </div>
          </> :
        <>
          <div className='col-xs-12 padding-0' style={{float: 'right', textAlign: 'right', display: 'inline-flex', alignItems: 'center', justifyContent: 'right'}}>
            {getControls()}
          </div>
        </>
      }
    </div>
  )
}


export default SearchControls;
