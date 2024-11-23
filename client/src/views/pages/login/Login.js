import React, { useState } from 'react'
import axios from '../../../api/axios'
import { useStateContext } from '../../../context/contextProvider'
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

const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const { setUser } = useStateContext()

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const response = await axios.post('/login', { username, password })
      console.log('Login response:', response.data)

      const { token, user } = response.data

      if (token) {
        sessionStorage.setItem('token', token)

        const loggedInUser = {
          username: user.username,
          userRole: user.userRole,
        }

        setUser(loggedInUser)
      } else {
        setErrorMessage('Invalid credentials')
      }
    } catch (err) {
      setErrorMessage('Login failed. Please try again.')
      console.error(err)
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
                  <p className="text-body-secondary">Sign In to your account</p>
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
                      <CButton color="outline-primary" className="rounded" disabled>
                        Signup
                      </CButton>
                    </CButtonGroup>
                  </div>
                  <CButton
                    color="link"
                    className="px-0 text-primary"
                    onClick={() => console.log('Forgot password link clicked')}
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
