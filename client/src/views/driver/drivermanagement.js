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
import io from 'socket.io-client'

const DriverManagement = () => {
  const [shipments, setShipments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        const res = await fetch('https://backend-core2.axleshift.com/driver/shipments')
        const data = await res.json()
        setShipments(data)
      } catch (error) {
        console.error('Failed to fetch shipments:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchShipments()

    const socket = io('http://localhost:5052', {
      transports: ['websocket', 'polling'],
    })

    // Listen for shipment location updates
    socket.on('shipmentLocationUpdate', (data) => {
      // Update the state with the new location data
      setShipments((prevShipments) =>
        prevShipments.map((shipment) =>
          shipment.trackingNumber === data.trackingNumber
            ? {
                ...shipment,
                latitude: data.latitude,
                longitude: data.longitude,
                updated_at: data.updated_at,
                driverUsername: data.driverUsername,
              }
            : shipment,
        ),
      )
    })

    // Cleanup the socket connection when the component unmounts
    return () => {
      socket.disconnect()
    }
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

export default DriverManagement
