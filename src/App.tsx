import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Signup';
import PropostasPage from './pages/PropostaPage';
import PerfilPage from './pages/PerfilPage';
import UsersPage from './pages/UsersPage';
import EmpresasPage from './pages/EmpresasPage';
import Header from './components/Header';
import Footer from './components/Footer';
import { JSX } from 'react';
import AdminDashboardPage from './pages/AdminDashboardPage';

function AdminRoute({ children }: { children: JSX.Element }) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return (user?.perfil === 'administrador' || user?.perfil === 'gestor') ? children : <Navigate to="/" />;
}

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/propostas" element={<PropostasPage />} />
        <Route path="/empresas" element={<EmpresasPage />} />
        <Route path="/perfil" element={<PerfilPage />} />
        <Route
          path="/users"
          element={
            <AdminRoute>
              <UsersPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboardPage />
            </AdminRoute>
          }
        />
      </Routes>
      <Footer />
    </>
  );
}

export default App;