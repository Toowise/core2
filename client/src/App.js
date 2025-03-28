import React, { Suspense, useEffect, useState } from 'react'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import 'leaflet/dist/leaflet.css'
import { CSpinner, useColorModes } from '@coreui/react'
import './scss/style.scss'
import { useStateContext } from './context/contextProvider'
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
  const { user } = useStateContext()

  // Separate authentication for users & drivers
  const [isDriverAuthenticated, setIsDriverAuthenticated] = useState(
    !!sessionStorage.getItem('driverToken'),
  )

  const isAuthenticated = user !== null

  useEffect(() => {
    const handleStorageChange = () => {
      setIsDriverAuthenticated(!!sessionStorage.getItem('driverToken'))
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const theme = urlParams.get('theme')?.match(/^[A-Za-z0-9\s]+/)[0]

    if (theme) setColorMode(theme)
    if (!isColorModeSet()) setColorMode(storedTheme)
  }, [isColorModeSet, setColorMode, storedTheme])

  return (
    <Router>
      <Suspense
        fallback={
          <div className="d-flex justify-content-center align-items-center vh-100">
            <CSpinner color="primary" variant="grow" />
          </div>
        }
      >
        <Routes>
          {/* User Authentication */}
          <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
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

          {/* Dashboard / Home */}
          <Route
            path="/*"
            element={isAuthenticated ? <DefaultLayout /> : <Navigate to="/login" />}
          />

          {/* Error Pages */}
          <Route path="/404" element={<Page404 />} />
          <Route path="/500" element={<Page500 />} />

          {/* Catch-All Route */}
          <Route
            path="*"
            element={isAuthenticated ? <DefaultLayout /> : <Navigate to="/login" />}
          />
        </Routes>
      </Suspense>
    </Router>
  )
}

export default App
