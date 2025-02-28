import { Link } from 'react-router-dom'
import { useSocket } from '../contexts/SocketContext'
import './UserList.css'

function UserList({ users, title = "Usuários" }) {
  const { onlineUsers } = useSocket()

  return (
    <div className="user-list-container">
      <h2 className="user-list-title">{title}</h2>
      
      {users.length === 0 ? (
        <p className="no-users">Nenhum usuário disponível</p>
      ) : (
        <ul className="user-list">
          {users.map(user => {
            const isOnline = onlineUsers.includes(user.id)
            
            return (
              <li key={user.id} className="user-item">
                <Link to={`/chat/${user.id}`} className="user-link">
                  <div className="user-avatar">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="user-info">
                    <span className="user-name">{user.name}</span>
                    <span className="user-role">{user.role || 'Usuário'}</span>
                  </div>
                  <span className={`status-indicator ${isOnline ? 'online' : 'offline'}`}>
                    {isOnline ? 'Online' : 'Offline'}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default UserList