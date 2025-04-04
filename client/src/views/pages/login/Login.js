import React, { useState } from 'react'
import axios from 'src/api/axios.js'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faLock, faEye, faEyeSlash, faX } from '@fortawesome/free-solid-svg-icons'
import {
  CContainer,
  CRow,
  CCol,
  CCard,
  CCardBody,
  CAlert,
  CForm,
  CInputGroup,
  CInputGroupText,
  CFormInput,
  CButton,
  CButtonGroup,
  CTooltip,
  CSpinner,
} from '@coreui/react'
import './Login.scss'
import { useStateContext } from '../../../context/contextProvider'

const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { setUser } = useStateContext();

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const response = await axios.post('/login', { username, password })
      const { token, user } = response.data

      if (token) {
        // Store token
        sessionStorage.setItem('token', token)

        // Optional: store minimal user info
        sessionStorage.setItem('user', JSON.stringify(user))

        // Notify app
        window.dispatchEvent(new Event('storage'))

        // Navigate to dashboard
        navigate('/')
      } else {
        setErrorMessage('Invalid credentials')
      }
    } catch (err) {
      console.error(err)
      setErrorMessage('Login failed. Please try again.')
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
                  <h1>Login</h1>
                  <p className="text-body-secondary">Sign in to your account</p>
                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <FontAwesomeIcon icon={faUser} />
                    </CInputGroupText>
                    <CFormInput
                      type="text"
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
                  <CButton
                    color="link"
                    className="px-0 text-primary"
                    onClick={() => console.log('Forgot password clicked')}
                  >
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

export default Login
