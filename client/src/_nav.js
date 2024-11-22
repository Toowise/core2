import React from 'react'
import CIcon from '@coreui/icons-react'
import { cilHistory, cilLocationPin, cilSpreadsheet, cilUser } from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpreadsheet} customClassName="nav-icon" />,
    badge: {
      color: 'info',
    },
  },
  {
    component: CNavItem,
    name: 'Shipment Tracker',
    to: '/trackingform',
    icon: <CIcon icon={cilLocationPin} customClassName="nav-icon" />,
    badge: {
      color: 'info',
    },
  },
  {
    component: CNavItem,
    name: 'Shipment History',
    to: '/shipmenthistory',
    icon: <CIcon icon={cilHistory} customClassName="nav-icon" />,
    badge: {
      color: 'info',
    },
  },
  {
    component: CNavItem,
    name: 'Create User',
    to: '/createuser',
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
    badge: {
      color: 'info',
    },
  },
]
export default _nav
