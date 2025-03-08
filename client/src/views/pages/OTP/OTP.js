import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CCard,
  CCardBody,
  CFormInput,
  CButton,
  CContainer,
  CRow,
  CCol,
  CAlert,
  CForm,
} from '@coreui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'
import cookies from 'js-cookie'
import axios from 'axios'

const OTP = () => {
  const [loading, setLoading] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [error, setError] = useState({ error: false, message: '' })
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const navigate = useNavigate()
  const otpRefs = useRef([])

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '') // Only numeric input
    if (value.length <= 11) setPhoneNumber(value)
  }

  const handleChange = (e, index) => {
    const value = e.target.value.replace(/\D/g, '') // Only numeric input
    if (value.length === 1) {
      const newOtp = [...otp]
      newOtp[index] = value
      setOtp(newOtp)
      if (index < 5) otpRefs.current[index + 1].focus()
    }
  }

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1].focus()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    axios
      .post(`/auth/verify/otp`, { phone: phoneNumber, otp: otp.join('') })
      .then((response) => {
        if (response.data.error) {
          setError({ error: true, message: response.data.error })
        } else {
          navigate(new URLSearchParams(window.location.search).get('n') || '/')
        }
      })
      .catch((error) => {
        setError({ error: true, message: 'Server error, please try again' })
      })
      .finally(() => setLoading(false))
  }

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        {error.error && (
          <CAlert color="danger" className="d-flex align-items-center">
            <FontAwesomeIcon className="me-2" icon={faXmark} size="xl" />
            <div>{error.message}</div>
          </CAlert>
        )}
        <CRow className="justify-content-center">
          <CCol md={6} lg={5}>
            <CCard className="p-4 shadow">
              <CCardBody>
                <CForm onSubmit={handleSubmit}>
                  <h1>Enter OTP</h1>
                  <p>Enter your 11-digit phone number (PH):</p>
                  <CFormInput
                    type="text"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    maxLength="11"
                    className="mb-3"
                    placeholder="09XXXXXXXXX"
                  />
                  <p>Enter the 6-digit OTP sent to your number.</p>
                  <div className="d-flex justify-content-center gap-2 mb-3">
                    {otp.map((digit, index) => (
                      <CFormInput
                        key={index}
                        type="text"
                        value={digit}
                        onChange={(e) => handleChange(e, index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        maxLength="1"
                        className="otp-input"
                        ref={(el) => (otpRefs.current[index] = el)}
                      />
                    ))}
                  </div>
                  <CButton type="submit" color="primary" className="w-100 rounded">
                    Submit
                  </CButton>
                  <CButton
                    color="link"
                    className="mt-2 w-100"
                    onClick={() => {
                      cookies.remove(VITE_APP_SESSION)
                      navigate('/login')
                    }}
                  >
                    Logout
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

export default OTP
