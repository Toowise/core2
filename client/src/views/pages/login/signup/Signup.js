import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'src/api/axios.js'
import { auth } from '../../../../firebase'
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth'
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
  CAlert,
  CSpinner,
} from '@coreui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faUser,
  faEnvelope,
  faLock,
  faEye,
  faEyeSlash,
  faMapMarkerAlt,
  faSignature,
  faCheckCircle,
  faX,
} from '@fortawesome/free-solid-svg-icons'

const Signup = () => {
  const [formData, setFormData] = useState({
    fullname: '',
    username: '',
    email: '',
    address: '',
    password: '',
  })
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [showVerifyButton, setShowVerifyButton] = useState(false)
  const navigate = useNavigate()

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  // Friendly error messages
  const getFriendlyErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'This email is already in use. Please try logging in.'
      case 'auth/weak-password':
        return 'Your password is too weak. Use at least 6 characters.'
      case 'auth/invalid-email':
        return 'Invalid email format.'
      default:
        return 'Signup failed. Please try again.'
    }
  }

  // Handle user signup
  const handleSignup = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      //  Create Firebase User
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password,
      )

      //  Send verification email
      await sendEmailVerification(userCredential.user)
      setSuccessMessage('A verification email has been sent. Please check your inbox.')
      setShowVerifyButton(true)
    } catch (err) {
      console.error('Signup error:', err)
      setErrorMessage(getFriendlyErrorMessage(err.code))
    } finally {
      setIsLoading(false)
    }
  }

  // Check email verification status and register user in backend
  const checkEmailVerification = async () => {
    setIsLoading(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      await auth.currentUser.reload()

      if (auth.currentUser.emailVerified) {
        setSuccessMessage('Email verified successfully! Registering your account...')

        const userData = {
          fullname: formData.fullname,
          username: formData.username,
          email: formData.email,
          address: formData.address,
          password: formData.password,
        }

        const response = await axios.post('/signup', userData)
        console.log('Signup successful:', response.data)

        setSuccessMessage('User registered successfully! Redirecting to login...')
        setTimeout(() => navigate('/login'), 3000)
      } else {
        setErrorMessage('Email not verified yet. Please check your inbox.')
      }
    } catch (error) {
      console.error('Verification check error:', error)
      setErrorMessage('Error checking verification status.')
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
                {successMessage && (
                  <CAlert color="success" className="d-flex align-items-center">
                    <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                    {successMessage}
                  </CAlert>
                )}

                {!showVerifyButton ? (
                  <CForm onSubmit={handleSignup}>
                    <h1>Sign Up</h1>
                    <p className="text-body-secondary">Create your account</p>

                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <FontAwesomeIcon icon={faSignature} />
                      </CInputGroupText>
                      <CFormInput
                        type="text"
                        placeholder="Full Name"
                        name="fullname"
                        value={formData.fullname}
                        onChange={handleChange}
                        required
                      />
                    </CInputGroup>

                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <FontAwesomeIcon icon={faUser} />
                      </CInputGroupText>
                      <CFormInput
                        type="text"
                        placeholder="Username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                      />
                    </CInputGroup>

                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <FontAwesomeIcon icon={faEnvelope} />
                      </CInputGroupText>
                      <CFormInput
                        type="email"
                        placeholder="Email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </CInputGroup>

                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <FontAwesomeIcon icon={faMapMarkerAlt} />
                      </CInputGroupText>
                      <CFormInput
                        type="text"
                        placeholder="Address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
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
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />
                      <CInputGroupText
                        style={{ cursor: 'pointer' }}
                        onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                      >
                        <FontAwesomeIcon icon={isPasswordVisible ? faEyeSlash : faEye} />
                      </CInputGroupText>
                    </CInputGroup>

                    <div className="d-grid mb-3">
                      <CButton type="submit" color="primary" className="rounded">
                        Sign Up
                      </CButton>
                    </div>
                  </CForm>
                ) : (
                  <div className="text-center">
                    <h3>Email Verification</h3>
                    <p>
                      A verification email has been sent to {formData.email}. Click the button below
                      after verifying.
                    </p>
                    <CButton onClick={checkEmailVerification} color="success">
                      Check Verification
                    </CButton>
                  </div>
                )}
                <p>
                  Already have an account?{' '}
                  <a href="/login" className="text-primary">
                    Login
                  </a>
                </p>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Signup
