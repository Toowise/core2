import React, { useEffect, useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { VITE_SOCKET_URL } from '../config'
import {
  CContainer,
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CHeader,
  CHeaderNav,
  CHeaderToggler,
  useColorModes,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import PropTypes from 'prop-types'
import { cilBell, cilMenu, cilSun, cilMoon, cilContrast } from '@coreui/icons'
import { AppHeaderDropdown } from './header/index'

const AppHeader = ({ admin = false }) => {
  const headerRef = useRef()
  const dispatch = useDispatch()
  const sidebarShow = useSelector((state) => state.sidebarShow)
  const { colorMode, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [dropdownVisible, setDropdownVisible] = useState(false)

  useEffect(() => {
    const socket = new WebSocket(VITE_SOCKET_URL.replace(/^http/, 'ws'))

    document.addEventListener('scroll', () => {
      headerRef.current &&
        headerRef.current.classList.toggle('shadow-sm', document.documentElement.scrollTop > 0)
    })

    socket.addEventListener('open', () => {
      console.log('WebSocket connection opened')
    })

    socket.addEventListener('message', (event) => {
      try {
        const message = JSON.parse(event.data)

        if (message.type === 'shipmentUpdate') {
          const update = message.data
          setNotifications((prev) => [
            {
              ...update,
              message: `Shipment ${update.trackingNumber} updated to ${update.status}`,
            },
            ...prev,
          ])
          setUnreadCount((prev) => prev + 1)
        }
      } catch (error) {
        console.error('WebSocket message error:', error)
      }
    })

    socket.addEventListener('close', () => {
      console.log('WebSocket connection closed')
    })

    return () => {
      socket.close()
    }
  }, [])
  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible)
    setUnreadCount(0) //
  }

  return (
    <CHeader position="sticky" className="mb-4 p-0" ref={headerRef}>
      <CContainer className="border-bottom px-4" fluid>
        <CHeaderToggler onClick={() => dispatch({ type: 'set', sidebarShow: !sidebarShow })}>
          <CIcon icon={cilMenu} size="lg" />
        </CHeaderToggler>

        <CHeaderNav className="ms-auto">
          {!admin && (
            <CDropdown variant="nav-item" visible={dropdownVisible} onClick={toggleDropdown}>
              <CDropdownToggle caret={false}>
                <CIcon icon={cilBell} size="lg" />
                {unreadCount > 0 && (
                  <span className="position-absolute top-0 end-0 translate-middle badge rounded-pill bg-danger">
                    {unreadCount}
                  </span>
                )}
              </CDropdownToggle>
              <CDropdownMenu>
                {notifications.length === 0 ? (
                  <CDropdownItem disabled>No new notifications</CDropdownItem>
                ) : (
                  notifications.map((notif, index) => (
                    <CDropdownItem key={index}>
                      📦 {notif.status} - {notif.timestamp}
                    </CDropdownItem>
                  ))
                )}
              </CDropdownMenu>
            </CDropdown>
          )}
        </CHeaderNav>
        <CHeaderNav>
          <li className="nav-item py-1">
            <div className="vr h-100 mx-2 text-body text-opacity-75"></div>
          </li>
          <CDropdown variant="nav-item" placement="bottom-end">
            <CDropdownToggle caret={false}>
              {colorMode === 'dark' ? (
                <CIcon icon={cilMoon} size="lg" />
              ) : colorMode === 'auto' ? (
                <CIcon icon={cilContrast} size="lg" />
              ) : (
                <CIcon icon={cilSun} size="lg" />
              )}
            </CDropdownToggle>
            <CDropdownMenu>
              <CDropdownItem
                active={colorMode === 'light'}
                className="d-flex align-items-center"
                as="button"
                type="button"
                onClick={() => setColorMode('light')}
              >
                <CIcon className="me-2" icon={cilSun} size="lg" /> Light
              </CDropdownItem>
              <CDropdownItem
                active={colorMode === 'dark'}
                className="d-flex align-items-center"
                as="button"
                type="button"
                onClick={() => setColorMode('dark')}
              >
                <CIcon className="me-2" icon={cilMoon} size="lg" /> Dark
              </CDropdownItem>
              <CDropdownItem
                active={colorMode === 'auto'}
                className="d-flex align-items-center"
                as="button"
                type="button"
                onClick={() => setColorMode('auto')}
              >
                <CIcon className="me-2" icon={cilContrast} size="lg" /> Auto
              </CDropdownItem>
            </CDropdownMenu>
          </CDropdown>
          <li className="nav-item py-1">
            <div className="vr h-100 mx-2 text-body text-opacity-75"></div>
          </li>
          <AppHeaderDropdown />
        </CHeaderNav>
      </CContainer>
    </CHeader>
  )
}
AppHeader.propTypes = {
  admin: PropTypes.bool,
}

export default AppHeader
