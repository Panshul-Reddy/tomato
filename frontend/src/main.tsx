import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {GoogleOAuthProvider} from '@react-oauth/google';
import { AppProvider } from './context/AppContext.tsx';
import 'leaflet/dist/leaflet.css';
import { SocketProvider } from './context/SocketContext.tsx';

export const authService = 'https://auth-1-h7ws.onrender.com'
export const restaurantService = 'https://restaurant-service-2o0p.onrender.com'
export const utilsService = 'https://utils-service-rzt6.onrender.com'
export const realtimeService = 'https://realtime-service-9re1.onrender.com'
export const riderService = 'https://rider-service-4pmj.onrender.com'
export const adminService = 'https://admin-service-riz1.onrender.com'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="227424340049-psf73lt46bg4rlvseol8ccq5o96iu8cd.apps.googleusercontent.com">
      <AppProvider>
        <SocketProvider>
          <App/>
        </SocketProvider>
      </AppProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
)
