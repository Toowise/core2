import React, { Suspense, useEffect, useState } from 'react'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import 'leaflet/dist/leaflet.css'
import { CSpinner, useColorModes } from '@coreui/react'
import './scss/style.scss'
import Signup from './views/pages/login/signup/Signup'

const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))
const Login = React.lazy(() => import('./views/pages/login/Login'))
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'))
const Page500 = React.lazy(() => import('./views/pages/page500/Page500'))
const DriverLogin = React.lazy(() => import('./views/driver/driverlogin'))
const DriverTracking = React.lazy(() => import('./views/driver/drivertracking'))

const App = () => {
  const { isColorModeSet, setColorMode } = useColorModes('theme')
  const storedTheme = useSelector((state) => state.theme)

  // State for driver authentication
  const [isDriverAuthenticated, setIsDriverAuthenticated] = useState(
    !!sessionStorage.getItem('driverToken'),
  )

  // State for user authentication
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(!!sessionStorage.getItem('token'))

  // Update authentication state if session storage changes
  useEffect(() => {
    const handleStorageChange = () => {
      setIsUserAuthenticated(!!sessionStorage.getItem('token'))
      setIsDriverAuthenticated(!!sessionStorage.getItem('driverToken'))
    }

    window.addEventListener('storage', handleStorageChange)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  // Set theme from URL params or Redux state
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const theme = urlParams.get('theme')?.match(/^[A-Za-z0-9\s]+/)[0]

    if (theme) setColorMode(theme)
    if (!isColorModeSet()) setColorMode(storedTheme)
  }, [isColorModeSet, setColorMode, storedTheme])

  return (
    <Router basename="/">
      <Suspense
        fallback={
          <div className="d-flex justify-content-center align-items-center vh-100">
            <CSpinner color="primary" variant="grow" />
          </div>
        }
      >
        <Routes>
          {/* User Authentication */}
          <Route path="/login" element={isUserAuthenticated ? <Navigate to="/" /> : <Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Driver Authentication */}
          <Route
            path="/driverlogin"
            element={isDriverAuthenticated ? <Navigate to="/drivertracking" /> : <DriverLogin />}
          />
          <Route
            path="/drivertracking"
            element={isDriverAuthenticated ? <DriverTracking /> : <Navigate to="/driverlogin" />}
          />

          {/* Error Pages */}
          <Route path="/404" element={<Page404 />} />
          <Route path="/500" element={<Page500 />} />

          {/* Dashboard / Home */}
          <Route
            path="/*"
            element={isUserAuthenticated ? <DefaultLayout /> : <Navigate to="/login" />}
          />

          {/* Catch-All 404 Page */}
          <Route path="*" element={<Page404 />} />
        </Routes>
      </Suspense>
    </Router>
  )
}

export default App
