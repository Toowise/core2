import React from 'react'
import { createContext, useContext, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
const StateContext = createContext()

export const ContextProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  return (
    <StateContext.Provider
      value={{
        user,
        setUser,
      }}
    >
      {children}
    </StateContext.Provider>
  )
}
ContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
}
export const useStateContext = () => useContext(StateContext)
