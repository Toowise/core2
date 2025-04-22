import React, { useEffect, useState } from 'react'
import axios from '../../../api/axios'
import {
  CRow,
  CCol,
  CCard,
  CCardBody,
  CCardHeader,
  CWidgetStatsA,
  CSpinner,
  CAlert,
} from '@coreui/react'
import { CChartBar, CChartDoughnut } from '@coreui/react-chartjs'

const AdminDashboard = () => {
  const [shipments, setShipments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        const res = await axios.get('/api/shipments')
        const data = Array.isArray(res.data) ? res.data : []
        setShipments(data)
      } catch (err) {
        console.error(err)
        setError('Failed to load shipments.')
      } finally {
        setLoading(false)
      }
    }

    fetchShipments()
  }, [])

  const total = shipments.length
  const packageReceived = shipments.filter((s) => s.status === 'Package Received').length
  const outForDelivery = shipments.filter((s) => s.status === 'Out for Delivery').length
  const pendingPickup = shipments.filter((s) =>
    s.events?.some((e) => e.status === 'Pending for Pickup'),
  ).length

  const deliveryDates = shipments.map((s) => new Date(s.expected_delivery).toLocaleDateString())

  return (
    <>
      {loading && <CSpinner color="primary" />}
      {error && <CAlert color="danger">{error}</CAlert>}

      {!loading && !error && (
        <>
          <CRow className="mb-4">
            <CCol sm={6} lg={3}>
              <CWidgetStatsA
                className="mb-3"
                color="primary"
                value={total}
                title="Total Shipments"
              />
            </CCol>
            <CCol sm={6} lg={3}>
              <CWidgetStatsA
                className="mb-3"
                color="info"
                value={packageReceived}
                title="Package Received"
              />
            </CCol>
            <CCol sm={6} lg={3}>
              <CWidgetStatsA
                className="mb-3"
                color="warning"
                value={outForDelivery}
                title="Out for Delivery"
              />
            </CCol>
            <CCol sm={6} lg={3}>
              <CWidgetStatsA
                className="mb-3"
                color="danger"
                value={pendingPickup}
                title="Pending Pickup"
              />
            </CCol>
          </CRow>

          <CRow>
            <CCol md={6}>
              <CCard className="mb-4">
                <CCardHeader>Shipment Distribution</CCardHeader>
                <CCardBody>
                  <CChartDoughnut
                    data={{
                      labels: ['Package Received', 'Out for Delivery', 'Pending Pickup'],
                      datasets: [
                        {
                          backgroundColor: ['#0d6efd', '#ffc107', '#dc3545'],
                          data: [packageReceived, outForDelivery, pendingPickup],
                        },
                      ],
                    }}
                  />
                </CCardBody>
              </CCard>
            </CCol>

            <CCol md={6}>
              <CCard className="mb-4">
                <CCardHeader>Expected Deliveries</CCardHeader>
                <CCardBody>
                  <CChartBar
                    data={{
                      labels: [...new Set(deliveryDates)],
                      datasets: [
                        {
                          label: 'Shipments',
                          backgroundColor: '#6610f2',
                          data: Object.values(
                            deliveryDates.reduce((acc, date) => {
                              acc[date] = (acc[date] || 0) + 1
                              return acc
                            }, {}),
                          ),
                        },
                      ],
                    }}
                    options={{
                      plugins: { legend: { display: false } },
                      scales: { y: { beginAtZero: true } },
                    }}
                  />
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
        </>
      )}
    </>
  )
}

export default AdminDashboard
