import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Chat from './pages/Chat'
import GroupChat from './pages/GroupChat'
import CreateGroup from './pages/CreateGroup'
import Profile from './pages/Profile'
import Header from './components/Header'
import './App.css'

function App() {
  const { user, loading } = useAuth()
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (!loading) {
      setIsReady(true)
    }
  }, [loading])

  if (!isReady) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Carregando EcoChat...</p>
      </div>
    )
  }

  return (
    <div className="app">
      {user && <Header />}
      <main className="main-content">
        <Routes>
          <Route 
            path="/" 
            element={user ? <Navigate to="/dashboard" /> : <Login />} 
          />
          <Route 
            path="/register" 
            element={user ? <Navigate to="/dashboard" /> : <Register />} 
          />
          <Route 
            path="/dashboard" 
            element={user ? <Dashboard /> : <Navigate to="/" />} 
          />
          <Route 
            path="/chat/:userId" 
            element={user ? <Chat /> : <Navigate to="/" />} 
          />
          <Route 
            path="/group/:groupId" 
            element={user ? <GroupChat /> : <Navigate to="/" />} 
          />
          <Route 
            path="/create-group" 
            element={user ? <CreateGroup /> : <Navigate to="/" />} 
          />
          <Route 
            path="/profile" 
            element={user ? <Profile /> : <Navigate to="/" />} 
          />
        </Routes>
      </main>
    </div>
  )
}

export default App