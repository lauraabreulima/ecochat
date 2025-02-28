import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getUsers, createGroup } from '../services/supabaseClient'
import './CreateGroup.css'

function CreateGroup() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedUsers, setSelectedUsers] = useState([])
  const [availableUsers, setAvailableUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        const usersData = await getUsers()
        // Filter out current user
        setAvailableUsers(usersData.filter(u => u.id !== user.id))
      } catch (err) {
        console.error('Error fetching users:', err)
        setError('Falha ao carregar usuários. Por favor, tente novamente.')
      } finally {
        setLoading(false)
      }
    }
    
    fetchUsers()
  }, [user.id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!name.trim()) {
      setError('O nome do grupo é obrigatório')
      return
    }
    
    try {
      setSubmitting(true)
      setError(null)
      
      const groupData = {
        name: name.trim(),
        description: description.trim(),
        members: selectedUsers.map(user => user.id)
      }
      
      const newGroup = await createGroup(groupData, user.id)
      navigate(`/group/${newGroup.id}`)
    } catch (err) {
      console.error('Error creating group:', err)
      setError('Falha ao criar grupo. ' + err.message)
      setSubmitting(false)
    }
  }

  const toggleUserSelection = (user) => {
    if (selectedUsers.some(u => u.id === user.id)) {
      setSelectedUsers(selectedUsers.filter(u => u.id !== user.id))
    } else {
      setSelectedUsers([...selectedUsers, user])
    }
  }

  const filteredUsers = availableUsers.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.role && user.role.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.location && user.location.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="create-group-container">
      <div className="create-group-header">
        <h1>Criar Novo Grupo</h1>
        <p>Crie um grupo para comunicação entre equipes de monitoramento</p>
      </div>
      
      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="create-group-form">
        <div className="form-section">
          <h2>Informações do Grupo</h2>
          
          <div className="form-group">
            <label htmlFor="name">Nome do Grupo *</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Monitoramento Salesópolis"
              disabled={submitting}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Descrição</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o propósito deste grupo"
              disabled={submitting}
              rows={3}
            />
          </div>
        </div>
        
        <div className="form-section">
          <h2>Adicionar Membros</h2>
          <p className="section-description">
            Selecione os usuários que farão parte deste grupo
          </p>
          
          <div className="search-box">
            <input
              type="text"
              placeholder="Buscar por nome, função ou localização"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={submitting}
            />
          </div>
          
          {loading ? (
            <div className="loading-users">Carregando usuários...</div>
          ) : (
            <>
              <div className="selected-users">
                <h3>Selecionados ({selectedUsers.length})</h3>
                {selectedUsers.length === 0 ? (
                  <p className="no-selection">Nenhum usuário selecionado</p>
                ) : (
                  <ul className="selected-users-list">
                    {selectedUsers.map(user => (
                      <li key={user.id} className="selected-user-item">
                        <span>{user.name}</span>
                        <button
                          type="button"
                          className="remove-user"
                          onClick={() => toggleUserSelection(user)}
                          disabled={submitting}
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              
              <div className="available-users">
                <h3>Usuários Disponíveis</h3>
                {filteredUsers.length === 0 ? (
                  <p className="no-users">Nenhum usuário encontrado</p>
                ) : (
                  <ul className="users-list">
                    {filteredUsers.map(user => (
                      <li 
                        key={user.id} 
                        className={`user-item ${selectedUsers.some(u => u.id === user.id) ? 'selected' : ''}`}
                        onClick={() => toggleUserSelection(user)}
                      >
                        <div className="user-avatar">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="user-info">
                          <span className="user-name">{user.name}</span>
                          <div className="user-details">
                            {user.role && <span className="user-role">{user.role}</span>}
                            {user.location && <span className="user-location">{user.location}</span>}
                          </div>
                        </div>
                        <div className="selection-indicator"></div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </div>
        
        <div className="form-actions">
          <button
            type="button"
            className="cancel-button"
            onClick={() => navigate('/dashboard')}
            disabled={submitting}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="create-button"
            disabled={submitting || !name.trim()}
          >
            {submitting ? 'Criando...' : 'Criar Grupo'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateGroup