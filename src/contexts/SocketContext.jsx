import { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

const SocketContext = createContext()

export function useSocket() {
  return useContext(SocketContext)
}

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)
  const [messages, setMessages] = useState([])
  const [groupMessages, setGroupMessages] = useState({})
  const [onlineUsers, setOnlineUsers] = useState([])
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    // Connect to socket server
    const socketInstance = io('http://localhost:3001', {
      auth: {
        userId: user.id
      }
    })

    socketInstance.on('connect', () => {
      console.log('Connected to socket server')
      setConnected(true)
    })

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from socket server')
      setConnected(false)
    })

    socketInstance.on('private-message', (message) => {
      setMessages((prevMessages) => [...prevMessages, message])
    })

    socketInstance.on('group-message', (message) => {
      setGroupMessages((prevGroupMessages) => {
        const groupId = message.groupId
        const prevMessages = prevGroupMessages[groupId] || []
        return {
          ...prevGroupMessages,
          [groupId]: [...prevMessages, message]
        }
      })
    })

    socketInstance.on('online-users', (users) => {
      setOnlineUsers(users)
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [user])

  const sendPrivateMessage = (recipientId, content, metadata = {}) => {
    if (!socket || !connected) return false

    const message = {
      senderId: user.id,
      recipientId,
      content,
      timestamp: new Date().toISOString(),
      metadata
    }

    socket.emit('private-message', message)
    setMessages((prevMessages) => [...prevMessages, message])
    return true
  }

  const sendGroupMessage = (groupId, content, metadata = {}) => {
    if (!socket || !connected) return false

    const message = {
      senderId: user.id,
      groupId,
      content,
      timestamp: new Date().toISOString(),
      metadata
    }

    socket.emit('group-message', message)
    setGroupMessages((prevGroupMessages) => {
      const prevMessages = prevGroupMessages[groupId] || []
      return {
        ...prevGroupMessages,
        [groupId]: [...prevMessages, message]
      }
    })
    return true
  }

  const joinGroup = (groupId) => {
    if (!socket || !connected) return false
    socket.emit('join-group', { groupId, userId: user.id })
    return true
  }

  const leaveGroup = (groupId) => {
    if (!socket || !connected) return false
    socket.emit('leave-group', { groupId, userId: user.id })
    return true
  }

  const loadPrivateMessages = async (userId1, userId2) => {
    try {
      // Load messages from Supabase
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${userId1},recipient_id.eq.${userId2}),and(sender_id.eq.${userId2},recipient_id.eq.${userId1})`)
        .order('created_at', { ascending: true })

      if (error) throw error

      // Format messages to match our state structure
      const formattedMessages = data.map(msg => ({
        id: msg.id,
        senderId: msg.sender_id,
        recipientId: msg.recipient_id,
        content: msg.content,
        timestamp: msg.created_at,
        metadata: msg.metadata || {}
      }))

      setMessages(formattedMessages)
      return formattedMessages
    } catch (err) {
      console.error('Error loading private messages:', err)
      return []
    }
  }

  const loadGroupMessages = async (groupId) => {
    try {
      // Load group messages from Supabase
      const { data, error } = await supabase
        .from('group_messages')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: true })

      if (error) throw error

      // Format messages to match our state structure
      const formattedMessages = data.map(msg => ({
        id: msg.id,
        senderId: msg.sender_id,
        groupId: msg.group_id,
        content: msg.content,
        timestamp: msg.created_at,
        metadata: msg.metadata || {}
      }))

      setGroupMessages(prev => ({
        ...prev,
        [groupId]: formattedMessages
      }))
      
      return formattedMessages
    } catch (err) {
      console.error('Error loading group messages:', err)
      return []
    }
  }

  const value = {
    socket,
    connected,
    messages,
    groupMessages,
    onlineUsers,
    sendPrivateMessage,
    sendGroupMessage,
    joinGroup,
    leaveGroup,
    loadPrivateMessages,
    loadGroupMessages
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}