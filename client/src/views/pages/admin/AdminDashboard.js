import React, { useState } from 'react'
import { CButton, CButtonGroup, CCard, CCardBody, CCol, CRow } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCloudDownload } from '@coreui/icons'
import WidgetsDropdown from '../../widgets/WidgetsDropdown'
import MainChart from '../../dashboard/MainChart'

const AdminDashboard = () => {
  const [activeFilter, setActiveFilter] = useState('Month')

  return (
    <>
      {/* Widgets Section */}
      <WidgetsDropdown className="mb-4" />

      {/* Shipment Statistics Card */}
      <CCard className="mb-4 shadow-sm">
        <CCardBody>
          <CRow className="align-items-center">
            <CCol sm={6}>
              <h4 id="traffic" className="card-title mb-1">
                Current Shipment
              </h4>
              <div className="small text-muted">Updated just now</div>
            </CCol>
            <CCol sm={6} className="d-flex justify-content-end">
              <CButton color="primary" className="me-3">
                <CIcon icon={cilCloudDownload} className="me-2" />
                Export
              </CButton>
              <CButtonGroup>
                {['Day', 'Month', 'Year'].map((value) => (
                  <CButton
                    key={value}
                    color={activeFilter === value ? 'primary' : 'outline-secondary'}
                    onClick={() => setActiveFilter(value)}
                  >
                    {value}
                  </CButton>
                ))}
              </CButtonGroup>
            </CCol>
          </CRow>
          <MainChart filter={activeFilter} />
        </CCardBody>
      </CCard>
    </>
  )
}

export default AdminDashboard
