// src/layouts/AdminLayout.jsx
import React from 'react'
import { AppContent, AppSidebar, AppFooter, AppHeader } from '../components/index'

const AdminLayout = () => {
  return (
    <div>
      <AppSidebar admin /> {/* You can pass a prop to customize admin sidebar */}
      <div className="wrapper d-flex flex-column min-vh-100">
        <AppHeader admin />
        <div className="body flex-grow-1">
          <AppContent admin />
        </div>
        <AppFooter />
      </div>
    </div>
  )
}

export default AdminLayout
