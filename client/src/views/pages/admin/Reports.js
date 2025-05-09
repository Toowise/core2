import React, { useEffect, useState } from 'react'
import axios from '../../../api/axios'
import {
  CAccordion,
  CAccordionItem,
  CAccordionHeader,
  CAccordionBody,
  CCard,
  CCardBody,
  CCardHeader,
  CSpinner,
  CAlert,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CButton,
} from '@coreui/react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import dayjs from 'dayjs'

const Reports = () => {
  const [shipments, setShipments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        const res = await axios.get('/api/shipments')
        setShipments(Array.isArray(res.data) ? res.data : [])
      } catch (err) {
        setError('Failed to load shipment reports.')
      } finally {
        setLoading(false)
      }
    }

    fetchShipments()
  }, [])

  const summarize = (days) => {
    const today = dayjs()
    const start = today.subtract(days, 'day')
    const filtered = shipments.filter((s) => dayjs(s.updated_at).isAfter(start))

    const statusCounts = {
      'Package Received': 0,
      'Out for Delivery': 0,
      'Pending Pickup': 0,
    }

    filtered.forEach((s) => {
      if (s.status === 'Package Received') statusCounts['Package Received']++
      if (s.status === 'Out for Delivery') statusCounts['Out for Delivery']++
      if (s.status === 'Pending for Pickup') statusCounts['Pending Pickup']++
    })

    return {
      count: filtered.length,
      ...statusCounts,
      range: `${start.format('MMM D')} - ${today.format('MMM D')}`,
    }
  }
  const daily = summarize(1)
  const weekly = summarize(7)
  const monthly = summarize(30)

  const exportAsPDF = () => {
    const doc = new jsPDF()

    const generateTable = (title, summary, startY) => {
      doc.text(title, 14, startY)
      autoTable(doc, {
        startY: startY + 6,
        head: [['Status', 'Count']],
        body: [
          ['Package Received', summary['Package Received']],
          ['Out for Delivery', summary['Out for Delivery']],
          ['Pending Pickup', summary['Pending Pickup']],
          ['Total', summary.count],
        ],
      })
    }

    let currentY = 10
    generateTable(`Daily Summary (${daily.range})`, daily, currentY)
    currentY = doc.lastAutoTable.finalY + 10
    generateTable(`Weekly Summary (${weekly.range})`, weekly, currentY)
    currentY = doc.lastAutoTable.finalY + 10
    generateTable(`Monthly Summary (${monthly.range})`, monthly, currentY)

    doc.save('shipment-analytics.pdf')
  }

  const renderTable = (summary) => (
    <CTable small responsive>
      <CTableHead>
        <CTableRow>
          <CTableHeaderCell>Status</CTableHeaderCell>
          <CTableHeaderCell>Count</CTableHeaderCell>
        </CTableRow>
      </CTableHead>
      <CTableBody>
        <CTableRow>
          <CTableDataCell>Package Received</CTableDataCell>
          <CTableDataCell>{summary['Package Received']}</CTableDataCell>
        </CTableRow>
        <CTableRow>
          <CTableDataCell>Out for Delivery</CTableDataCell>
          <CTableDataCell>{summary['Out for Delivery']}</CTableDataCell>
        </CTableRow>
        <CTableRow>
          <CTableDataCell>Pending Pickup</CTableDataCell>
          <CTableDataCell>{summary['Pending Pickup']}</CTableDataCell>
        </CTableRow>
        <CTableRow className="fw-bold">
          <CTableDataCell>Total</CTableDataCell>
          <CTableDataCell>{summary.count}</CTableDataCell>
        </CTableRow>
      </CTableBody>
    </CTable>
  )

  return (
    <>
      {loading && <CSpinner color="primary" />}
      {error && <CAlert color="danger">{error}</CAlert>}
      {!loading && !error && (
        <>
          <div className="d-flex justify-content-end mb-3">
            <CButton color="primary" variant="outline" onClick={exportAsPDF}>
              Export as PDF
            </CButton>
          </div>
          <CCard>
            <CCardHeader>Shipment Analytics Report</CCardHeader>
            <CCardBody>
              <CAccordion alwaysOpen>
                <CAccordionItem itemKey={1}>
                  <CAccordionHeader>📅 Daily Summary ({daily.range})</CAccordionHeader>
                  <CAccordionBody>{renderTable(daily)}</CAccordionBody>
                </CAccordionItem>
                <CAccordionItem itemKey={2}>
                  <CAccordionHeader>📈 Weekly Summary ({weekly.range})</CAccordionHeader>
                  <CAccordionBody>{renderTable(weekly)}</CAccordionBody>
                </CAccordionItem>
                <CAccordionItem itemKey={3}>
                  <CAccordionHeader>📆 Monthly Summary ({monthly.range})</CAccordionHeader>
                  <CAccordionBody>{renderTable(monthly)}</CAccordionBody>
                </CAccordionItem>
              </CAccordion>
            </CCardBody>
          </CCard>
        </>
      )}
    </>
  )
}

export default Reports
