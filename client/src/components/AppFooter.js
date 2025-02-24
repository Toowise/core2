import React from 'react'
import { CFooter } from '@coreui/react'

const AppFooter = () => {
  return (
    <CFooter className="px-4">
      <div>
        <a href="#" target="_blank" rel="noopener noreferrer">
          Core 2
        </a>
      </div>
    </CFooter>
  )
}

export default React.memo(AppFooter)
