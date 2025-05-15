import React, { useEffect, useState } from 'react'
import axios from '../../api/axios'
import {
  CRow,
  CCol,
  CCard,
  CCardBody,
  CCardHeader,
  CWidgetStatsA,
  CSpinner,
  CAlert,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
} from '@coreui/react'

const UserDashboard = () => {
  const [shipments, setShipments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchUserShipments = async () => {
      try {
        const token = sessionStorage.getItem('token')
        const res = await axios.get('/api/shipments/user', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        const data = Array.isArray(res.data) ? res.data : []
        setShipments(data)
      } catch (err) {
        console.error(err)
        setError('Failed to load your shipments.')
      } finally {
        setLoading(false)
      }
    }

    fetchUserShipments()
  }, [])

  const activeShipments = shipments.filter(
    (s) => s.status !== 'Package Received' && s.status !== 'Cancelled',
  )
  const deliveredShipments = shipments.filter((s) => s.status === 'Package Received')
  const pendingPickup = shipments.filter((s) => s.status === 'Pending for Pickup')

  return (
    <>
      {loading && <CSpinner color="primary" />}
      {error && <CAlert color="danger">{error}</CAlert>}

      {!loading && !error && (
        <>
          <h4 className="mb-4">Welcome! Here's an overview of your shipments.</h4>

          <CRow className="mb-4">
            <CCol sm={6} lg={4}>
              <CWidgetStatsA
                color="primary"
                value={activeShipments.length}
                title="Active Shipments"
              />
            </CCol>
            <CCol sm={6} lg={4}>
              <CWidgetStatsA
                color="success"
                value={deliveredShipments.length}
                title="Package Received"
              />
            </CCol>
            <CCol sm={6} lg={4}>
              <CWidgetStatsA color="warning" value={pendingPickup.length} title="Pending Pickup" />
            </CCol>
          </CRow>

          <CCard className="mb-4">
            <CCardHeader>Latest Shipment Updates</CCardHeader>
            <CCardBody>
              {activeShipments.length === 0 ? (
                <p>You have no active shipments at the moment.</p>
              ) : (
                <ul>
                  {activeShipments.map((shipment) => (
                    <li key={shipment._id}>
                      <strong>{shipment.trackingNumber}</strong> - {shipment.status}
                      {shipment.latest_location ? ` @ ${shipment.latest_location}` : ''}
                      {shipment.updated_at && (
                        <small className="text-muted">
                          {' '}
                          — Updated on {new Date(shipment.updated_at).toLocaleString()}
                        </small>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </CCardBody>
          </CCard>

          <CCard className="mb-4">
            <CCardHeader>Recent Shipments</CCardHeader>
            <CCardBody>
              {shipments.length === 0 ? (
                <p>No shipments found.</p>
              ) : (
                <CTable hover responsive>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>Tracking Number</CTableHeaderCell>
                      <CTableHeaderCell>Status</CTableHeaderCell>
                      <CTableHeaderCell>Destination</CTableHeaderCell>
                      <CTableHeaderCell>Expected Delivery</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {shipments.slice(0, 5).map((s) => (
                      <CTableRow key={s._id}>
                        <CTableDataCell>{s.trackingNumber}</CTableDataCell>
                        <CTableDataCell>{s.status}</CTableDataCell>
                        <CTableDataCell>{s.deliveryAddress}</CTableDataCell>
                        <CTableDataCell>
                          {s.expected_delivery
                            ? new Date(s.expected_delivery).toLocaleDateString()
                            : '—'}
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              )}
            </CCardBody>
          </CCard>
        </>
      )}
    </>
  )
}

export default UserDashboard
