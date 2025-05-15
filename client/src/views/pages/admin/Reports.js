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
  const [drivers, setDrivers] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [shipmentsRes, driversRes] = await Promise.all([
          axios.get('/api/shipments'),
          axios.get('/api/drivers'),
        ])

        setShipments(Array.isArray(shipmentsRes.data) ? shipmentsRes.data : [])
        setDrivers(Array.isArray(driversRes.data) ? driversRes.data : [])
      } catch (err) {
        setError('Failed to load shipment or driver data.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
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
  const summarizeDrivers = (days) => {
    const today = dayjs()
    const start = today.subtract(days, 'day')

    const filtered = shipments.filter((s) => dayjs(s.updated_at).isAfter(start))

    const driverMap = {}
    drivers.forEach((d) => {
      driverMap[d.username] = d.name
    })

    const result = {}
    Object.values(driverMap).forEach((name) => {
      result[name] = {
        count: 0,
        shipments: [],
      }
    })

    filtered.forEach((s) => {
      const driverName = driverMap[s.driverUsername] || 'Unknown'
      if (!result[driverName]) {
        result[driverName] = {
          count: 0,
          shipments: [],
        }
      }
      result[driverName].count += 1
      result[driverName].shipments.push({
        trackingNumber: s.trackingNumber,
        date: dayjs(s.updated_at).format('YYYY-MM-DD'),
      })
    })

    return result
  }

  const daily = summarize(1)
  const weekly = summarize(7)
  const monthly = summarize(30)

  const driverDaily = summarizeDrivers(1)
  const driverWeekly = summarizeDrivers(7)
  const driverMonthly = summarizeDrivers(30)

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
  const exportDriverReportsPDF = () => {
    const doc = new jsPDF()
    let y = 10

    const addDriverSection = (title, data, range) => {
      doc.text(`${title} (${range})`, 14, y)
      y += 6

      const body = Object.entries(data).map(([driver, info]) => {
        const shipmentsStr = info.shipments
          .map((s) => `#${s.trackingNumber} - (${s.date})`)
          .join('\n')

        return [driver, info.count.toString(), shipmentsStr]
      })

      autoTable(doc, {
        startY: y,
        head: [['Driver', 'Total Shipments', 'Shipments']],
        body: body,
        margin: { top: 10, left: 14 },
        styles: { fontSize: 10, cellPadding: 2, overflow: 'linebreak' },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 30, halign: 'center' },
          2: { cellWidth: 110 },
        },
      })

      y = doc.lastAutoTable.finalY + 8
    }

    addDriverSection('Driver Daily Report', driverDaily, daily.range)
    addDriverSection('Driver Weekly Report', driverWeekly, weekly.range)
    addDriverSection('Driver Monthly Report', driverMonthly, monthly.range)

    doc.save('driver-delivery-report.pdf')
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

  const renderDriverTable = (data) => (
    <CTable small responsive>
      <CTableHead>
        <CTableRow>
          <CTableHeaderCell>Driver</CTableHeaderCell>
          <CTableHeaderCell>Total Shipments</CTableHeaderCell>
          <CTableHeaderCell>Shipments</CTableHeaderCell>
        </CTableRow>
      </CTableHead>
      <CTableBody>
        {Object.entries(data).map(([driver, info], index) => (
          <CTableRow key={index}>
            <CTableDataCell>{driver}</CTableDataCell>
            <CTableDataCell>{info.count}</CTableDataCell>
            <CTableDataCell>
              {info.shipments.map((s) => (
                <div key={s.trackingNumber}>
                  #{s.trackingNumber} -({s.date})
                </div>
              ))}
            </CTableDataCell>
          </CTableRow>
        ))}
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
              Export Shipment Report
            </CButton>
            <CButton
              color="success"
              variant="outline"
              className="ms-2"
              onClick={exportDriverReportsPDF}
            >
              Export Drivers Report
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

          <CCard className="mt-4">
            <CCardHeader>Driver Delivery Reports</CCardHeader>
            <CCardBody>
              <CAccordion alwaysOpen>
                <CAccordionItem itemKey={4}>
                  <CAccordionHeader>📅 Driver Daily Report ({daily.range})</CAccordionHeader>
                  <CAccordionBody>{renderDriverTable(driverDaily)}</CAccordionBody>
                </CAccordionItem>
                <CAccordionItem itemKey={5}>
                  <CAccordionHeader>📈 Driver Weekly Report ({weekly.range})</CAccordionHeader>
                  <CAccordionBody>{renderDriverTable(driverWeekly)}</CAccordionBody>
                </CAccordionItem>
                <CAccordionItem itemKey={6}>
                  <CAccordionHeader>📆 Driver Monthly Report ({monthly.range})</CAccordionHeader>
                  <CAccordionBody>{renderDriverTable(driverMonthly)}</CAccordionBody>
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
