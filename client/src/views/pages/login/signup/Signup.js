import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'src/api/axios.js'
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
  faPhone,
  faMapMarkerAlt,
  faSignature,
  faX,
  faCheckCircle,
} from '@fortawesome/free-solid-svg-icons'

const Signup = () => {
  const [formData, setFormData] = useState({
    fullname: '',
    username: '',
    email: '',
    phone: '',
    address: '',
    password: '',
  })
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const response = await axios.post('/signup', formData)
      console.log('Signup response:', response.data)

      if (response.data.success) {
        setSuccessMessage('Signup successful! Redirecting to login...')
        setTimeout(() => navigate('/login'), 3000) // Redirect after 3s
      } else {
        setErrorMessage(response.data.message || 'Signup failed.')
      }
    } catch (err) {
      setErrorMessage('Signup failed. Please try again.')
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
                {successMessage && (
                  <CAlert color="success" className="d-flex align-items-center">
                    <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                    {successMessage}
                  </CAlert>
                )}

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
                      <FontAwesomeIcon icon={faPhone} />
                    </CInputGroupText>
                    <CFormInput
                      type="text"
                      placeholder="Phone Number"
                      name="phone"
                      value={formData.phone}
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
                    <CInputGroupText onClick={() => setIsPasswordVisible(!isPasswordVisible)}>
                      <FontAwesomeIcon icon={isPasswordVisible ? faEyeSlash : faEye} />
                    </CInputGroupText>
                  </CInputGroup>

                  <div className="d-grid mb-3">
                    <CButton type="submit" color="primary" className="rounded">
                      Sign Up
                    </CButton>
                  </div>
                  <p>
                    Already have an account?{' '}
                    <a href="/login" className="text-primary">
                      Login
                    </a>
                  </p>
                </CForm>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Signup
