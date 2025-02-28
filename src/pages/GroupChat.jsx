import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useSocket } from '../contexts/SocketContext'
import { getGroupById, getGroupMembers, saveGroupMessage } from '../services/supabaseClient'
import MessageList from '../components/MessageList'
import MessageInput from '../components/MessageInput'
import './ChatPages.css'

function GroupChat() {
  const { groupId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { groupMessages, sendGroupMessage, loadGroupMessages, joinGroup } = useSocket()
  const [group, setGroup] = useState(null)
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [users, setUsers] = useState({})
  const [showMembers, setShowMembers] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Join the group socket room
        joinGroup(groupId)
        
        // Fetch group data
        const groupData = await getGroupById(groupId)
        if (!groupData) {
          throw new Error('Grupo não encontrado')
        }
        setGroup(groupData)
        
        // Fetch group members
        const membersData = await getGroupMembers(groupId)
        setMembers(membersData)
        
        // Load group messages
        await loadGroupMessages(groupId)
        
        // Create users object for message display
        const usersObj = {}
        membersData.forEach(member => {
          usersObj[member.userId] = member.profile
        })
        setUsers(usersObj)
      } catch (err) {
        console.error('Error loading group chat:', err)
        setError('Falha ao carregar o grupo. ' + err.message)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [groupId, joinGroup, loadGroupMessages])

  const handleSendMessage = async (content, metadata) => {
    // Send message via socket
    const sent = sendGroupMessage(groupId, content, metadata)
    
    if (sent) {
      // Save message to database
      try {
        await saveGroupMessage({
          senderId: user.id,
          groupId,
          content,
          metadata
        })
      } catch (err) {
        console.error('Error saving group message:', err)
        // We don't show this error to the user since the message was already sent via socket
      }
    }
  }

  const toggleMembersList = () => {
    setShowMembers(!showMembers)
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Carregando grupo...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="alert alert-error">{error}</div>
        <button 
          className="btn-primary" 
          onClick={() => navigate('/dashboard')}
        >
          Voltar para Dashboard
        </button>
      </div>
    )
  }

  const currentGroupMessages = groupMessages[groupId] || []

  return (
    <div className="chat-container">
      <div className="chat-header">
        <button 
          className="back-button"
          onClick={() => navigate('/dashboard')}
        >
          ←
        </button>
        <div className="chat-user-info">
          <h2>{group?.name}</h2>
          <div className="group-details">
            <span className="group-description">{group?.description}</span>
            <button 
              className="members-toggle"
              onClick={toggleMembersList}
            >
              {members.length} membros
            </button>
          </div>
        </div>
      </div>
      
      {showMembers && (
        <div className="members-list">
          <h3>Membros do Grupo</h3>
          <ul>
            {members.map(member => (
              <li key={member.userId} className="member-item">
                <div className="member-avatar">
                  {member.profile.name.charAt(0).toUpperCase()}
                </div>
                <div className="member-info">
                  <span className="member-name">{member.profile.name}</span>
                  <span className="member-role">{member.role}</span>
                </div>
              </li>
            ))}
          </ul>
          <button 
            className="close-members"
            onClick={toggleMembersList}
          >
            Fechar
          </button>
        </div>
      )}
      
      <div className="chat-messages">
        <MessageList messages={currentGroupMessages} users={users} />
      </div>
      
      <div className="chat-input">
        <MessageInput 
          onSendMessage={handleSendMessage} 
          placeholder="Digite sua mensagem para o grupo..."
        />
      </div>
    </div>
  )
}

export default GroupChat