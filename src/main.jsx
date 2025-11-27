// src/main.jsx — put at VERY TOP (DEV only)
if (import.meta.env.DEV && typeof window !== 'undefined') {
  try {
    const hook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (hook && hook.renderers) {
      for (const [id, renderer] of hook.renderers.entries()) {
        try {
          if (!renderer) continue;
          if (!renderer.version || renderer.version === '') {
            renderer.version = '0.0.0';
            // console.warn(`[DEV] patched renderer id ${id} with version "0.0.0"`);
          }
          if (!renderer.rendererPackageName) renderer.rendererPackageName = 'unknown-renderer';
        } catch(e){}
      }
    }
    // Also patch rendererInterfaces map if present
    if (hook && hook.rendererInterfaces) {
      for (const [id, iface] of hook.rendererInterfaces.entries()) {
        try {
          if (!iface.version || iface.version === '') iface.version = '0.0.0';
          if (!iface.rendererPackageName) iface.rendererPackageName = 'unknown-renderer';
        } catch(e){}
      }
    }
  } catch (e) { /* ignore */ }
}



import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import App from './App.jsx'
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
ModuleRegistry.registerModules([AllCommunityModule]);
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
