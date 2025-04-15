import React from 'react'
import CIcon from '@coreui/icons-react'
import { cilHistory, cilLocationPin, cilSpreadsheet, cilTruck } from '@coreui/icons'
import { CNavItem } from '@coreui/react'

const _nav_admin = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/admindashboard',
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
    name: 'Driver Management',
    to: '/drivermanagement',
    icon: <CIcon icon={cilTruck} customClassName="nav-icon" />,
    badge: {
      color: 'info',
    },
  },
]
export default _nav_admin
