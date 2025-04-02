import React from 'react'
export const useDoubleClick = (onClick, onDbClick, delay = 200) => {
  const timePassed= React.useRef(0);
  return (params, e) => {
    if (e.detail === 1) {
      setTimeout(() => {
        if (Date.now() - timePassed.current >= delay) {
          onClick(params.row, e);
        }
      }, delay)
    }

    if (e.detail === 2) {
      timePassed.current = Date.now();
      onDbClick(params, e);
    }
  }
}
