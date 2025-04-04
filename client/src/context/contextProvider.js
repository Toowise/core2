import React, { createContext, useContext, useState, useEffect, startTransition } from 'react'
import PropTypes from 'prop-types'

const StateContext = createContext()

export const ContextProvider = ({ children }) => {
  const [user, setUserState] = useState(() => {
    const storedUser = sessionStorage.getItem('user')
    return storedUser ? JSON.parse(storedUser) : null
  })

  const setUser = (newUser) => {
    startTransition(() => {
      setUserState(newUser)
    })

    // Also update sessionStorage whenever user changes
    if (newUser) {
      sessionStorage.setItem('user', JSON.stringify(newUser))
    } else {
      sessionStorage.removeItem('user')
    }
  }

  // Optional: Listen for external sessionStorage changes (multi-tab support)
  useEffect(() => {
    const syncUserFromStorage = () => {
      const storedUser = sessionStorage.getItem('user')
      setUserState(storedUser ? JSON.parse(storedUser) : null)
    }

    window.addEventListener('storage', syncUserFromStorage)
    return () => window.removeEventListener('storage', syncUserFromStorage)
  }, [])

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
