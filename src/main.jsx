import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom'
import CreateTrip from './create-trip/index.jsx'
import Header from './components/ui/custom/Header'
import { GoogleOAuthProvider } from '@react-oauth/google'

export const RootLayout = () => (
  <>
    <Header />
    <Outlet />
  </>
)

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <App />,
      },
      {
        path: 'create-trip',
        element: <CreateTrip />,
      },
    ],
  }
]);


const googleClientId = import.meta.env.VITE_GOOGLE_AUTH_CLIENT_ID
const appRouter = <RouterProvider router={router} />

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {googleClientId ? (
      <GoogleOAuthProvider clientId={googleClientId}>
        {appRouter}
      </GoogleOAuthProvider>
    ) : (
      appRouter
    )}
  </StrictMode>,
)
