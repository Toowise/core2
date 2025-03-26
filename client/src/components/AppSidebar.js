import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  CCloseButton,
  CSidebar,
  CSidebarBrand,
  CSidebarFooter,
  CSidebarHeader,
  CSidebarToggler,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react'

import { AppSidebarNav } from './AppSidebarNav'
import logoImage from 'src/assets/brand/logo.png'

// sidebar nav config
import navigation from '../_nav'
import { useStateContext } from '../context/contextProvider' // Import the context

const AppSidebar = () => {
  const dispatch = useDispatch()
  const unfoldable = useSelector((state) => state.sidebarUnfoldable)
  const sidebarShow = useSelector((state) => state.sidebarShow)
  const { setUser } = useStateContext()
  const [showModal, setShowModal] = useState(false)
  const navigate = useNavigate()
  // Function to handle logout
  const handleLogout = () => {
    sessionStorage.removeItem('token')
    setUser(null)
    navigate('/login')
  }

  // Function to show the confirmation modal
  const confirmLogout = () => {
    setShowModal(true)
  }

  // Function to close the modal
  const closeModal = () => {
    setShowModal(false)
  }

  return (
    <CSidebar
      className="border-end"
      colorScheme="dark"
      position="fixed"
      unfoldable={unfoldable}
      visible={sidebarShow}
      onVisibleChange={(visible) => {
        dispatch({ type: 'set', sidebarShow: visible })
      }}
    >
      <CSidebarHeader className="border-bottom">
        <CSidebarBrand to="/">
          <img src={logoImage} alt="Logo" className="brand-full" height={64} />
        </CSidebarBrand>
        <CCloseButton
          className="d-lg-none"
          dark
          onClick={() => dispatch({ type: 'set', sidebarShow: false })}
        />
      </CSidebarHeader>

      {/* Sidebar navigation */}
      <AppSidebarNav items={navigation} />

      {/* Sidebar footer */}
      <CSidebarFooter className="border-top d-none d-lg-flex">
        <CButton color="danger" className="w-100" onClick={confirmLogout}>
          Logout
        </CButton>
        <CSidebarToggler
          onClick={() => dispatch({ type: 'set', sidebarUnfoldable: !unfoldable })}
        />
      </CSidebarFooter>

      {/* Logout confirmation modal */}
      <CModal visible={showModal} onClose={closeModal}>
        <CModalHeader>
          <CModalTitle>Confirm Logout</CModalTitle>
        </CModalHeader>
        <CModalBody>Are you sure you want to logout?</CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={closeModal}>
            Cancel
          </CButton>
          <CButton color="danger" onClick={handleLogout}>
            Logout
          </CButton>
        </CModalFooter>
      </CModal>
    </CSidebar>
  )
}

export default React.memo(AppSidebar)
