import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import './Profile.css'

function Profile() {
  const { user, getUserProfile, updateUserProfile } = useAuth()
  const [profile, setProfile] = useState(null)
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [location, setLocation] = useState('')
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        const userProfile = await getUserProfile(user.id)
        setProfile(userProfile)
        setName(userProfile?.name || '')
        setRole(userProfile?.role || '')
        setLocation(userProfile?.location || '')
      } catch (err) {
        console.error('Error fetching profile:', err)
        setError('Falha ao carregar perfil. Por favor, tente novamente.')
      } finally {
        setLoading(false)
      }
    }
    
    fetchProfile()
  }, [user.id, getUserProfile])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!name.trim()) {
      setError('O nome é obrigatório')
      return
    }
    
    try {
      setUpdating(true)
      setError(null)
      setSuccess(null)
      
      await updateUserProfile(user.id, {
        name: name.trim(),
        role: role.trim(),
        location: location.trim()
      })
      
      setSuccess('Perfil atualizado com sucesso!')
    } catch (err) {
      console.error('Error updating profile:', err)
      setError('Falha ao atualizar perfil. Por favor, tente novamente.')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Carregando perfil...</p>
      </div>
    )
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Seu Perfil</h1>
        <p>Gerencie suas informações pessoais</p>
      </div>
      
      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}
      
      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}
      
      <div className="profile-card">
        <div className="profile-info">
          <div className="profile-avatar">
            {profile?.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
          </div>
          <div className="profile-details">
            <h2>{profile?.name || 'Usuário'}</h2>
            <p className="profile-email">{user.email}</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label htmlFor="name">Nome Completo *</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={updating}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="role">Função</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={updating}
            >
              <option value="">Selecione uma função</option>
              <option value="inspetor">Inspetor</option>
              <option value="coordenador">Coordenador</option>
              <option value="analista">Analista Ambiental</option>
              <option value="secretaria">Secretaria</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="location">Localização</label>
            <input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ex: Salesópolis, SP"
              disabled={updating}
            />
          </div>
          
          <button
            type="submit"
            className="update-button"
            disabled={updating}
          >
            {updating ? 'Atualizando...' : 'Atualizar Perfil'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Profile