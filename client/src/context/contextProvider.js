import React, { createContext, useContext, useState, useEffect, startTransition } from 'react'
import PropTypes from 'prop-types'

const StateContext = createContext()

export const ContextProvider = ({ children }) => {
  const [user, setUserState] = useState(null)
  const setUser = (newUser) => {
    startTransition(() => {
      setUserState(newUser)
    })
  }

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
