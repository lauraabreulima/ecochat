import { useEffect, useRef } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useAuth } from '../contexts/AuthContext'
import './MessageList.css'

function MessageList({ messages, users = {} }) {
  const { user } = useAuth()
  const messagesEndRef = useRef(null)

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const formatTime = (timestamp) => {
    try {
      return format(new Date(timestamp), 'HH:mm', { locale: ptBR })
    } catch (error) {
      return '00:00'
    }
  }

  const formatDate = (timestamp) => {
    try {
      return format(new Date(timestamp), "dd 'de' MMMM", { locale: ptBR })
    } catch (error) {
      return ''
    }
  }

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = formatDate(message.timestamp)
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(message)
    return groups
  }, {})

  return (
    <div className="message-list">
      {Object.entries(groupedMessages).map(([date, dateMessages]) => (
        <div key={date}>
          <div className="date-divider">
            <span>{date}</span>
          </div>
          
          {dateMessages.map((message, index) => {
            const isCurrentUser = message.senderId === user.id
            const sender = users[message.senderId] || { name: 'Usuário' }
            const isUrgent = message.metadata?.urgent
            
            return (
              <div 
                key={message.id || index} 
                className={`message-item ${isCurrentUser ? 'own-message' : 'other-message'} ${isUrgent ? 'urgent-message' : ''}`}
              >
                {!isCurrentUser && (
                  <div className="message-sender">{sender.name}</div>
                )}
                
                <div className="message-content">
                  {isUrgent && <div className="urgent-badge">URGENTE</div>}
                  <p>{message.content}</p>
                  <div className="message-time">{formatTime(message.timestamp)}</div>
                </div>
              </div>
            )
          })}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  )
}

export default MessageList