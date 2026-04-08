import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <App />
          <Toaster position="bottom-right" toastOptions={{
            style: { background:'#111827', color:'#e2e8f0', border:'1px solid #1f2d45' },
            success: { iconTheme: { primary:'#06d6a0', secondary:'#111827' } },
            error:   { iconTheme: { primary:'#ef4444', secondary:'#111827' } },
          }}/>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
