import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from '/src/api/axios.js'
import {
  CContainer,
  CRow,
  CCol,
  CCard,
  CCardBody,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CButton,
  CButtonGroup,
  CAlert,
  CSpinner,
  CTooltip,
} from '@coreui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faLock, faEye, faEyeSlash, faX } from '@fortawesome/free-solid-svg-icons'


const DriverLogin = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage('')

    try {
      // Send login request to the backend
      const response = await axios.post('/driverlogin', {
        username,
        password,
      })
      console.log('Login response:', response.data)
      const data = response.data

      if (!data.success) {
        throw new Error(data.message || 'Login failed')
      }

      // Store token and navigate
      sessionStorage.setItem('driverToken', data.token)
      window.dispatchEvent(new Event('storage'))
      navigate('/drivertracking')
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Server error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        {isLoading && (
          <div className="loading-overlay">
            <CSpinner color="primary" variant="grow" />
          </div>
        )}
        <CRow className="justify-content-center">
          <CCol md={8} lg={6} xl={5} className="my-2">
            <CCard className="p-1 p-sm-4 shadow">
              <CCardBody>
                {errorMessage && (
                  <CAlert color="danger" className="d-flex align-items-center">
                    <FontAwesomeIcon icon={faX} className="me-2" />
                    {errorMessage}
                  </CAlert>
                )}
                <CForm onSubmit={handleLogin}>
                  <h1>Driver Login</h1>
                  <p className="text-body-secondary">Sign in to your driver account</p>
                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <FontAwesomeIcon icon={faUser} />
                    </CInputGroupText>
                    <CFormInput
                      type="username"
                      placeholder="Username"
                      autoComplete="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </CInputGroup>
                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <FontAwesomeIcon icon={faLock} />
                    </CInputGroupText>
                    <CFormInput
                      type={isPasswordVisible ? 'text' : 'password'}
                      placeholder="Password"
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <CInputGroupText>
                      <CTooltip
                        content={isPasswordVisible ? 'Hide password' : 'Show password'}
                        placement="top"
                      >
                        <span onClick={() => setIsPasswordVisible(!isPasswordVisible)}>
                          <FontAwesomeIcon icon={isPasswordVisible ? faEyeSlash : faEye} />
                        </span>
                      </CTooltip>
                    </CInputGroupText>
                  </CInputGroup>
                  <p>
                    <small>
                      By continuing, you agree to our
                      <a href="/policy" className="text-primary">
                        {' '}
                        Privacy Policy{' '}
                      </a>
                      and
                      <a href="/terms" className="text-primary">
                        {' '}
                        Terms of Service
                      </a>
                      .
                    </small>
                  </p>
                  <div className="d-grid mb-3">
                    <CButtonGroup>
                      <CButton type="submit" color="primary" className="rounded">
                        Login
                      </CButton>
                      <CButton
                        color="primary"
                        className="rounded"
                        onClick={() => navigate('/signup')}
                      >
                        Signup
                      </CButton>
                    </CButtonGroup>
                  </div>
                  <CButton color="link" className="px-0 text-primary">
                    Forgot password?
                  </CButton>
                </CForm>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default DriverLogin
