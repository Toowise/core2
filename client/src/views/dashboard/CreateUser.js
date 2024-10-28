import React, { useState } from 'react'
import axios from 'axios'
import { useStateContext } from '../../context/contextProvider'

const CreateUserForm = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [userRole, setRole] = useState('user')
  const [error, setError] = useState(null)
  const { user } = useStateContext()

  const handleCreateUser = async (e) => {
    e.preventDefault()

    try {
      const response = await axios.post('http://localhost:5052/createUser', {
        username,
        password,
        userRole,
      })
      alert('User created successfully')
    } catch (error) {
      console.error('Failed to create user:', error)
      setError('Failed to create user')
    }
  }

  if (user.userRole !== 'admin') {
    return (
      <div className="create-user-container">
        <div className="create-user-card">
          <h2>Access Denied</h2>
          <p>You do not have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="create-user-container">
      <div className="create-user-card">
        <h2>Create User</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <form onSubmit={handleCreateUser}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
          <select value={userRole} onChange={(e) => setRole(e.target.value)}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <button type="submit">Create User</button>
        </form>
      </div>
    </div>
  )
}

export default CreateUserForm
