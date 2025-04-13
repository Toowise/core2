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
import PropTypes from 'prop-types'
import { AppSidebarNav } from './AppSidebarNav'
import logoImage from 'src/assets/brand/logo.png'

// nav configs
import userNavigation from '../_nav'
import adminNavigation from '../_nav_admin'

const AppSidebar = ({ admin = false }) => {
  const dispatch = useDispatch()
  const unfoldable = useSelector((state) => state.sidebarUnfoldable)
  const sidebarShow = useSelector((state) => state.sidebarShow)
  const [showModal, setShowModal] = useState(false)
  const navigate = useNavigate()

  const handleLogout = () => {
    sessionStorage.removeItem('token')
    window.dispatchEvent(new Event('storage'))
    navigate('/login')
  }

  const confirmLogout = () => {
    setShowModal(true)
  }

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
      <AppSidebarNav items={admin ? adminNavigation : userNavigation} />

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
AppSidebar.propTypes = {
  admin: PropTypes.bool.isRequired,
}
export default React.memo(AppSidebar)
