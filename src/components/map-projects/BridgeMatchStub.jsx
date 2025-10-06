import React from 'react';

const BridgeMatchStub = React.forwardRef((_props, ref) => {
  React.useImperativeHandle(ref, () => ({
    fetchBridgeCandidates: () => {
      console.warn('[BridgeMatchStub] Premium feature not available in this build.');
    },
    getCandidateLabelForDownload: () => {
      console.warn('[BridgeMatchStub] Premium feature not available in this build.');
    },
    canBridge: () => false
  }));
  return null;
});

export default BridgeMatchStub;
