import React, { useState } from 'react'
import axios from '../../../api/axios'
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
  CTooltip,
  CSpinner,
} from '@coreui/react'
import './Login.scss'
import { useStateContext } from '../../../context/contextProvider'

const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState(1)
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { setUser } = useStateContext()

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const response = await axios.post('/login', { username, password })
      // Proceed to 2FA step
      setStep(2)
    } catch (err) {
      console.error(err)
      setErrorMessage(err.response?.data?.message || 'Login failed.')
    } finally {
      setIsLoading(false)
    }
  }

  const handle2FAVerification = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const response = await axios.post('/verify-2fa', { username, code })
      const { token, user } = response.data

      sessionStorage.setItem('token', token)
      sessionStorage.setItem('user', JSON.stringify(user))
      window.dispatchEvent(new Event('storage'))
      setUser(user)

      navigate(user.userRole === 'admin' ? '/admindashboard' : '/')
    } catch (err) {
      console.error(err)
      setErrorMessage(err.response?.data?.message || '2FA verification failed.')
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

                <CForm onSubmit={step === 1 ? handleLogin : handle2FAVerification}>
                  <h1>{step === 1 ? 'Login' : '2FA Verification'}</h1>
                  <p className="text-body-secondary">Sign in to your account</p>

                  {step === 1 ? (
                    <>
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
                    </>
                  ) : (
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <FontAwesomeIcon icon={faLock} />
                      </CInputGroupText>
                      <CFormInput
                        type="text"
                        placeholder="Enter 2FA Code"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        required
                      />
                    </CInputGroup>
                  )}

                  <div className="d-grid mb-3">
                    <CButton type="submit" color="primary" className="rounded">
                      {step === 1 ? 'Login' : 'Verify Code'}
                    </CButton>
                  </div>

                  {step === 1 && (
                    <p>
                      {"Don't have an account?"}{' '}
                      <a href="/signup" className="signup-link">
                        Signup
                      </a>
                    </p>
                  )}
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
