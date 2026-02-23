import React from 'react';
import { useTranslation } from 'react-i18next'
import Button from '@mui/material/Button';
import DownIcon from '@mui/icons-material/ArrowDropDown';
import DisplayMenu from './DisplayMenu';
import SortMenu from './SortMenu';

const SearchControls = ({ disabled, onDisplayChange, display, order, orderBy, onOrderByChange, sortableFields, noCardDisplay, extraControls, alignLeft, rightControl}) => {
  const { t } = useTranslation()
  const [sortAnchorEl, setSortAnchorEl] = React.useState(null);
  const onSortClick = event => setSortAnchorEl(event.currentTarget)
  const onSortMenuClose = () => setSortAnchorEl(null);

  const getDisplayControl = (sx) => {
    return (
      <DisplayMenu
        sx={sx}
          onSelect={onDisplayChange}
          selected={display}
          disabled={Boolean(disabled)}
        />
    )
  }

  const getControls = (withoutDisplay = false) => {
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
          !noCardDisplay && !withoutDisplay &&
            getDisplayControl()

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
              <span style={{display: 'flex', alignItems: 'center'}}>
                {getControls(true)}
              </span>
              {
              rightControl &&
                  <span style={{display: 'flex', alignItems: 'center'}}>
                    {rightControl}
                    {getDisplayControl({marginRight: '8px'})}
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
