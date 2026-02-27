import React from 'react'
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

const Comment = ({ header, body, footer, sx, headerSx, bodySx, footerSx, ...rest }) => {
  return (
    <Card variant='outlined' sx={{width: '100%', ...sx}} {...rest}>
      <CardContent sx={{padding: 0}}>
        {
          header &&
            <Typography component='h6' sx={{backgroundColor: '#f6f8fa', padding: '4px 4px 4px 8px', margin: 0, borderBottom: '1px solid #d0d7de', fontSize: '14px', ...headerSx}}>
              { header }
            </Typography>
        }
        <div className='col-xs-12' style={{padding: '16px', background: '#FFF', ...bodySx}}>
          {body}
        </div>
        {
          footer &&
            <Typography component='h6' sx={{backgroundColor: '#f6f8fa', padding: '4px 4px 4px 8px', margin: 0, borderBottom: '1px solid #d0d7de', fontSize: '14px', ...footerSx}}>
              { footer }
            </Typography>
        }
      </CardContent>
    </Card>
  )
}


export default Comment
