import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import logo from '../pages/assets/logo.png';

export default function Header() {
  const [user, setUser] = useState(localStorage.getItem('user'));
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onStorage = () => setUser(localStorage.getItem('user'));
    window.addEventListener('storage', onStorage);
    const interval = setInterval(() => {
      setUser(localStorage.getItem('user'));
    }, 500);
    return () => {
      window.removeEventListener('storage', onStorage);
      clearInterval(interval);
    };
  }, []);

  // Fecha o menu se clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setShowMenu(false);
    navigate('/');
  };

  // Parse user for display
  const userObj = user ? JSON.parse(user) : null;

  return (
    <nav
      className="navbar navbar-expand-lg"
      style={{
        background: '#181818',
        boxShadow: '0 2px 8px #0002',
        color: '#d6ff3e',
        zIndex: 1000,
      }}
    >
      <div className="container-fluid">
        <Link to="/" className="navbar-brand d-flex align-items-center" style={{ color: '#d6ff3e' }}>
          <img src={logo} alt="Logo" style={{ height: 40 }} className="me-2" />
          <span className="fw-bold">Job Connect ESTGV</span>
        </Link>
        <div className="ms-auto d-flex gap-2 align-items-center">
          <Link to="/propostas" className="btn btn-outline-light">Propostas</Link>
          <Link to="/empresas" className="btn btn-outline-light">Empresas</Link>
          {/* Só mostra o botão Users se for admin */}
          {userObj?.perfil === 'administrador' && (
            <Link to="/users" className="btn btn-outline-light">Users</Link>
          )}
          {(userObj?.perfil === 'administrador' || userObj?.perfil === 'gestor') && (
            <Link to="/admin" className="btn btn-outline-light">Dashboard</Link>
          )}
          {!user && (
            <Link to="/login" className="btn btn-lime">Login</Link>
          )}
          {user && (
            <div className="position-relative" ref={menuRef}>
              <button
                className="btn btn-lime"
                onClick={() => setShowMenu((v) => !v)}
              >
                <i className="bi bi-person-circle me-1"></i>
                {userObj?.nome || 'Perfil'}
              </button>
              {showMenu && (
                <div
                  className="dropdown-menu dropdown-menu-end show"
                  style={{ position: 'absolute', right: 0, top: '110%' }}
                >
                  <Link className="dropdown-item" to="/perfil" onClick={() => setShowMenu(false)}>
                    Ver Perfil
                  </Link>
                  <button className="dropdown-item" onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}