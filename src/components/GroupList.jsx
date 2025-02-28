import { Link } from 'react-router-dom'
import './GroupList.css'

function GroupList({ groups, title = "Grupos" }) {
  return (
    <div className="group-list-container">
      <h2 className="group-list-title">{title}</h2>
      
      {groups.length === 0 ? (
        <div className="no-groups">
          <p>Você não participa de nenhum grupo ainda.</p>
          <Link to="/create-group" className="create-group-link">
            Criar um grupo
          </Link>
        </div>
      ) : (
        <ul className="group-list">
          {groups.map(group => (
            <li key={group.id} className="group-item">
              <Link to={`/group/${group.id}`} className="group-link">
                <div className="group-avatar">
                  {group.name.charAt(0).toUpperCase()}
                </div>
                <div className="group-info">
                  <span className="group-name">{group.name}</span>
                  <span className="group-description">
                    {group.description || 'Sem descrição'}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default GroupList