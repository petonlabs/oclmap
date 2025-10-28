/*eslint no-process-env: 0*/
import React from 'react'
import BridgeMatchStub from '../components/map-projects/BridgeMatchStub'

const loadScriptOnce = src => {
  return new Promise((resolve, reject) => {
    if (!src) return resolve()
    if (document.querySelector(`script[data-ocl-src="${src}"]`)) return resolve()
    const s = document.createElement('script')
    s.async = true
    s.dataset.oclSrc = src
    s.onload = resolve
    s.onerror = reject
    s.src = src
    document.head.appendChild(s)
  })
}

if (!window.React) window.React = React

const Lazy = React.lazy(async () => {
  /*eslint no-undef: 0*/
  /*eslint no-undef: 0*/
  let bridgeComponentURL = process.env.BRIDGE_MATCH_URL || ''
  if(!bridgeComponentURL)
    return { default: BridgeMatchStub }

  if(bridgeComponentURL)
    try { await loadScriptOnce(bridgeComponentURL) } catch { console.warn('Unable to load url', bridgeComponentURL) }
  const Impl = window.premium?.BridgeMatch;
  if (!Impl) return { default: BridgeMatchStub };

  const Wrapped = React.forwardRef((props, ref) => <Impl {...props} ref={ref} />);
  return {default: Wrapped}
})

const LazyLoader = React.forwardRef((props, ref) => {
  return (
    <React.Suspense fallback={null}>
      <Lazy ref={ref} {...props} />
    </React.Suspense>
  )
})

export default LazyLoader;
