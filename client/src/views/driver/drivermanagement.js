import React, { useEffect, useState } from 'react'
import {
  CCard,
  CCardBody,
  CCol,
  CRow,
  CTable,
  CTableBody,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CTableDataCell,
  CSpinner,
  CFormInput,
} from '@coreui/react'

const DriverManagement = () => {
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterTerm, setFilterTerm] = useState('')

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const res = await fetch('https//backend-core2.axleshift.com/api/drivers')
        const data = await res.json()
        setDrivers(data)
      } catch (error) {
        console.error('Failed to fetch drivers:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDrivers()
    const intervalId = setInterval(fetchDrivers, 2000)

    return () => clearInterval(intervalId)
  }, [])
  const filteredDrivers = drivers.filter((d) => {
    const term = filterTerm.toLowerCase()

    const matchesName = d.name.toLowerCase().includes(term)
    const matchesPlate = d.vehicle?.number?.toLowerCase().includes(term)
    const matchesLicense = d.licenseNumber?.toLowerCase().includes(term)
    const matchesVehicleType = d.vehicle?.type?.toLowerCase().includes(term)
    const matchesOnDuty = (d.onDuty ? 'Yes' : 'No').includes(term)

    return matchesName || matchesPlate || matchesLicense || matchesVehicleType || matchesOnDuty
  })

  return (
    <CRow>
      <CCol>
        <CCard className="mb-4 shadow-sm">
          <CCardBody>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4>Driver Management</h4>
              <CFormInput
                type="text"
                placeholder="Search name, plate, or license"
                value={filterTerm}
                onChange={(e) => setFilterTerm(e.target.value)}
                className="form-control"
                style={{ maxWidth: '250px' }}
              />
            </div>
            {loading ? (
              <CSpinner color="primary" />
            ) : (
              <CTable striped responsive bordered hover>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Name</CTableHeaderCell>
                    <CTableHeaderCell>Vehicle Type</CTableHeaderCell>
                    <CTableHeaderCell>On Duty</CTableHeaderCell>
                    <CTableHeaderCell>Plate Number</CTableHeaderCell>
                    <CTableHeaderCell>License Number</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {filteredDrivers.map((d) => (
                    <CTableRow key={d._id}>
                      <CTableDataCell>{d.name}</CTableDataCell>
                      <CTableDataCell>{d.vehicle?.type}</CTableDataCell>
                      <CTableDataCell>{d.onDuty ? 'Yes' : 'No'}</CTableDataCell>
                      <CTableDataCell>{d.vehicle?.number || 'Unassigned'}</CTableDataCell>
                      <CTableDataCell>{d.licenseNumber}</CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default DriverManagement
