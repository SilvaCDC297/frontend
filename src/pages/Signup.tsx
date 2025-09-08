import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../api/register';
import axios from 'axios';
import logo from './assets/logo.png';
import './css/Login.css';

export default function RegisterPage() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [perfil, setPerfil] = useState('estudante');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setSucesso('');
    try {
      // Regista o utilizador
      const novoUser = await register({ nome, email, password, perfil });

      // Se for estudante, cria também na tabela estudantes
      if (perfil === 'estudante' && novoUser?.id) {
        await axios.post('http://localhost:5000/api/estudantes', {
          utilizador_id: novoUser.id
        });
      }

      setSucesso('Registo efetuado com sucesso! Pode agora fazer login.');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err: any) {
      setErro(err.response?.data?.erro || 'Erro ao registar.');
    }
  };

  return (
    <div className="homepage-bg animated-bg min-vh-100">
      <div className="container py-5">
        <div className="text-center mb-4">
          <img src={logo} alt="Logo" style={{ height: 60 }} />
          <h1 className="login-title mt-2">Job Connect ESTGV</h1>
        </div>
        <h2 className="login-subtitle mb-2">Registo</h2>
        <p className="login-desc mb-4">Crie a sua conta para aceder à plataforma.</p>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input
              type="text"
              className="form-control login-input"
              placeholder="Nome"
              value={nome}
              onChange={e => setNome(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <input
              type="email"
              className="form-control login-input"
              placeholder="E-mail"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <input
              type="password"
              className="form-control login-input"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <select
              className="form-select login-input"
              value={perfil}
              onChange={e => setPerfil(e.target.value)}
              required
            >
              <option value="estudante">Estudante</option>
              <option value="empresa">Empresa</option>
            </select>
          </div>
          {erro && <div className="alert alert-danger">{erro}</div>}
          {sucesso && <div className="alert alert-success">{sucesso}</div>}
          <button type="submit" className="btn btn-login w-100 mb-2">Registar</button>
          <button type="button" className="btn btn-dark w-100 mb-2" onClick={() => navigate('/login')}>Já tenho conta</button>
        </form>
      </div>
    </div>
  );
}