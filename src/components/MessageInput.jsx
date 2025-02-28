import { useState } from 'react'
import './MessageInput.css'

function MessageInput({ onSendMessage, placeholder = "Digite sua mensagem..." }) {
  const [message, setMessage] = useState('')
  const [isUrgent, setIsUrgent] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!message.trim()) return
    
    // Create metadata for the message
    const metadata = {
      urgent: isUrgent,
      // Add any other metadata here
    }
    
    onSendMessage(message, metadata)
    setMessage('')
    setIsUrgent(false)
  }

  return (
    <form className="message-input-container" onSubmit={handleSubmit}>
      <div className="message-options">
        <label className="urgent-checkbox">
          <input 
            type="checkbox" 
            checked={isUrgent} 
            onChange={() => setIsUrgent(!isUrgent)}
          />
          <span>Urgente</span>
        </label>
      </div>
      
      <div className="input-area">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={placeholder}
          className={isUrgent ? 'urgent' : ''}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSubmit(e)
            }
          }}
        />
        
        <button 
          type="submit" 
          className="send-button"
          disabled={!message.trim()}
        >
          Enviar
        </button>
      </div>
    </form>
  )
}

export default MessageInput