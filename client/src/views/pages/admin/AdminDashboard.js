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
} from '@coreui/react'

const AdminDashboard = () => {
  const [shipments, setShipments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        const res = await fetch('http://localhost:5052/driver/shipments')
        const data = await res.json()
        setShipments(data)
      } catch (error) {
        console.error('Failed to fetch shipments:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchShipments()
  }, [])

  return (
    <CRow>
      <CCol>
        <CCard className="mb-4 shadow-sm">
          <CCardBody>
            <h4 className="mb-3">Active Shipments </h4>
            {loading ? (
              <CSpinner color="primary" />
            ) : (
              <CTable striped responsive bordered hover>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Tracking Number</CTableHeaderCell>
                    <CTableHeaderCell>Status</CTableHeaderCell>
                    <CTableHeaderCell>Driver</CTableHeaderCell>
                    <CTableHeaderCell>Delivery Address</CTableHeaderCell>
                    <CTableHeaderCell>Live Location</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {shipments.map((s) => (
                    <CTableRow key={s.trackingNumber}>
                      <CTableDataCell>{s.trackingNumber}</CTableDataCell>
                      <CTableDataCell>{s.status || 'Unknown'}</CTableDataCell>
                      <CTableDataCell>{s.driverUsername || 'Unassigned'}</CTableDataCell>
                      <CTableDataCell>{s.deliveryAddress}</CTableDataCell>
                      <CTableDataCell>
                        {s.latitude && s.longitude ? (
                          <a
                            href={`https://www.google.com/maps?q=${s.latitude},${s.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View on Map
                          </a>
                        ) : (
                          'Not Available'
                        )}
                      </CTableDataCell>
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

export default AdminDashboard
