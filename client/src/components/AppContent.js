import React, { Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { CContainer, CSpinner } from '@coreui/react'
import PropTypes from 'prop-types'
// routes config
import routes from '../routes'

const AppContent = ({ admin = false }) => {
  const filteredRoutes = admin ? routes : routes.filter((r) => !r.adminOnly)
  return (
    <CContainer className="px-4" lg>
      <Suspense fallback={<CSpinner color="primary" />}>
        <Routes>
          {filteredRoutes.map(
            (route, idx) =>
              route.element && (
                <Route
                  key={idx}
                  path={route.path}
                  exact={route.exact}
                  name={route.name}
                  element={<route.element />}
                />
              ),
          )}
          <Route path="/" element={<Navigate to="dashboard" replace />} />
        </Routes>
      </Suspense>
    </CContainer>
  )
}
AppContent.propTypes = {
  admin: PropTypes.bool,
}
export default React.memo(AppContent)
