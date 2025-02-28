import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useSocket } from '../contexts/SocketContext'
import { savePrivateMessage } from '../services/supabaseClient'
import MessageList from '../components/MessageList'
import MessageInput from '../components/MessageInput'
import './ChatPages.css'

function Chat() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const { user, getUserProfile } = useAuth()
  const { messages, sendPrivateMessage, loadPrivateMessages, onlineUsers } = useSocket()
  const [recipient, setRecipient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [users, setUsers] = useState({})

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch recipient profile
        const recipientProfile = await getUserProfile(userId)
        if (!recipientProfile) {
          throw new Error('Usuário não encontrado')
        }
        setRecipient(recipientProfile)
        
        // Load chat history
        await loadPrivateMessages(user.id, userId)
        
        // Create users object for message display
        const currentUserProfile = await getUserProfile(user.id)
        setUsers({
          [user.id]: currentUserProfile,
          [userId]: recipientProfile
        })
      } catch (err) {
        console.error('Error loading chat:', err)
        setError('Falha ao carregar o chat. ' + err.message)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [user.id, userId, getUserProfile, loadPrivateMessages])

  const handleSendMessage = async (content, metadata) => {
    // Send message via socket
    const sent = sendPrivateMessage(userId, content, metadata)
    
    if (sent) {
      // Save message to database
      try {
        await savePrivateMessage({
          senderId: user.id,
          recipientId: userId,
          content,
          metadata
        })
      } catch (err) {
        console.error('Error saving message:', err)
        // We don't show this error to the user since the message was already sent via socket
      }
    }
  }

  const isOnline = onlineUsers.includes(userId)

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Carregando conversa...</p>
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
          <h2>{recipient?.name}</h2>
          <div className="user-details">
            <span className={`status-dot ${isOnline ? 'online' : 'offline'}`}></span>
            <span className="status-text">{isOnline ? 'Online' : 'Offline'}</span>
            <span className="user-role">{recipient?.role}</span>
            <span className="user-location">{recipient?.location}</span>
          </div>
        </div>
      </div>
      
      <div className="chat-messages">
        <MessageList messages={messages} users={users} />
      </div>
      
      <div className="chat-input">
        <MessageInput 
          onSendMessage={handleSendMessage} 
          placeholder="Digite sua mensagem..."
        />
      </div>
    </div>
  )
}

export default Chat