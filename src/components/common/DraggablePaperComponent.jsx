import React from 'react';
import Draggable from 'react-draggable';
import Paper from '@mui/material/Paper';


const DraggablePaperComponent = props => {
  const nodeRef = React.useRef(null);
  return (
    <Draggable
      nodeRef={nodeRef}
      handle="#draggable-dialog-title"
      cancel={'[class*="MuiDialogContent-root"]'}
    >
      <Paper {...props} ref={nodeRef} />
    </Draggable>
  );
}

export default DraggablePaperComponent
