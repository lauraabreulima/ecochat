import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getUsers, getGroups } from '../services/supabaseClient'
import UserList from '../components/UserList'
import GroupList from '../components/GroupList'
import './Dashboard.css'

function Dashboard() {
  const { user, getUserProfile } = useAuth()
  const [users, setUsers] = useState([])
  const [groups, setGroups] = useState([])
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch user profile
        const userProfile = await getUserProfile(user.id)
        setProfile(userProfile)
        
        // Fetch users
        const usersData = await getUsers()
        // Filter out current user
        setUsers(usersData.filter(u => u.id !== user.id))
        
        // Fetch groups
        const groupsData = await getGroups(user.id)
        setGroups(groupsData)
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        setError('Falha ao carregar dados. Por favor, tente novamente.')
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [user, getUserProfile])

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Carregando dados...</p>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}
      
      <div className="dashboard-header">
        <h1>Bem-vindo, {profile?.name || 'Usuário'}</h1>
        <p className="user-location">
          <span className="location-label">Localização:</span> {profile?.location || 'Não definida'}
        </p>
      </div>
      
      <div className="dashboard-actions">
        <Link to="/create-group" className="action-button">
          <span className="action-icon">+</span>
          <span>Criar Novo Grupo</span>
        </Link>
      </div>
      
      <div className="dashboard-content">
        <div className="dashboard-section">
          <GroupList groups={groups} title="Seus Grupos" />
        </div>
        
        <div className="dashboard-section">
          <UserList users={users} title="Inspetores e Analistas" />
        </div>
      </div>
    </div>
  )
}

export default Dashboard