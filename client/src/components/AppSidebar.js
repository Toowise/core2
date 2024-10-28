import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'

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
import CIcon from '@coreui/icons-react'

import { AppSidebarNav } from './AppSidebarNav'

import { logo } from 'src/assets/brand/logo'
import { sygnet } from 'src/assets/brand/sygnet'

// sidebar nav config
import navigation from '../_nav'
import { useStateContext } from '../context/contextProvider' // Import the context

const AppSidebar = () => {
  const dispatch = useDispatch()
  const unfoldable = useSelector((state) => state.sidebarUnfoldable)
  const sidebarShow = useSelector((state) => state.sidebarShow)

  const { setUser } = useStateContext() // Access the setUser from context to log out

  const [showModal, setShowModal] = useState(false) // State for the logout modal

  // Function to handle logout
  const handleLogout = () => {
    sessionStorage.removeItem('token') // Remove token from session storage
    setUser(null) // Clear user state (logout)
    window.location.href = '/login' // Redirect to login page
  }

  // Function to show the confirmation modal
  const confirmLogout = () => {
    setShowModal(true) // Open the modal
  }

  // Function to close the modal
  const closeModal = () => {
    setShowModal(false) // Close the modal
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
          <CIcon customClassName="  brand-full" icon={logo} height={32} />
          <CIcon customClassName="sidebar-brand-narrow" icon={sygnet} height={32} />
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
        <CButton
          color="danger"
          className="w-100"
          onClick={confirmLogout} // Trigger the logout confirmation
        >
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
