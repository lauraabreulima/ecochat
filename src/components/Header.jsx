import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Header.css'

function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className="header">
      <div className="container header-container">
        <div className="logo">
          <Link to="/dashboard">
            <h1>EcoChat</h1>
            <span className="logo-subtitle">Monitoramento Ambiental</span>
          </Link>
        </div>

        <div className="mobile-menu-button" onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </div>

        <nav className={`nav-menu ${isMenuOpen ? 'open' : ''}`}>
          <ul>
            <li>
              <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/create-group" onClick={() => setIsMenuOpen(false)}>
                Criar Grupo
              </Link>
            </li>
            <li>
              <Link to="/profile" onClick={() => setIsMenuOpen(false)}>
                Perfil
              </Link>
            </li>
            <li>
              <button className="logout-button" onClick={handleLogout}>
                Sair
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}

export default Header