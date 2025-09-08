import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/login';
import './css/Login.css';
import logo from './assets/logo.png';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [erro, setErro] = useState('');
    const [sucesso, setSucesso] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErro('');
        setSucesso('');
        try {
            const res = await login(email, password);
            localStorage.setItem('user', JSON.stringify(res.utilizador));
            setSucesso('Login com sucesso! Bem-vindo, ' + res.utilizador.nome);
            setTimeout(() => navigate('/'), 1000); // Redireciona sempre após 1s
        } catch (err: any) {
            setErro(err.response?.data?.erro || 'Erro ao fazer login.');
        }
    };

    return (
        <div className="homepage-bg animated-bg min-vh-100">
            <div className="container py-5">
                <div className="text-center mb-4">
                    <img src={logo} alt="Logo" style={{ height: 60 }} />
                    <h1 className="login-title mt-2">Job Connect ESTGV</h1>
                </div>
                <h2 className="login-subtitle mb-2">Login</h2>
                <p className="login-desc mb-4">Bem-vindo de volta! Por favor, inicie sessão para aceder à sua conta.</p>
                <form onSubmit={handleSubmit}>
                    <div className="row g-2 mb-3">
                        <div className="col">
                            <input
                                type="email"
                                className="form-control login-input"
                                placeholder="Introduza o seu e-mail"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="col">
                            <input
                                type="password"
                                className="form-control login-input"
                                placeholder="Introduza a sua Password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="mb-3 text-end">
                        <a href="#" className="login-link">Esqueceu-se da palavra-passe?</a>
                    </div>
                    {erro && <div className="alert alert-danger">{erro}</div>}
                    {sucesso && <div className="alert alert-success">{sucesso}</div>}
                    <button type="submit" className="btn btn-login w-100 mb-2">Login</button>
                    <button type="button" className="btn btn-dark w-100 mb-2" onClick={() => navigate('/register')}
                    >
                        Sign Up
                    </button>
                    <div className="text-center my-2">ou Continuar com</div>
                    <div className="d-flex justify-content-center gap-3 mb-4">
                        <button type="button" className="btn btn-social"><i className="bi bi-google"></i></button>
                        <button type="button" className="btn btn-social"><i className="bi bi-facebook"></i></button>
                        <button type="button" className="btn btn-social"><i className="bi bi-apple"></i></button>
                    </div>
                </form>
                {/* Rodapé */}
                <footer className="login-footer mt-4">
                    <div className="d-flex justify-content-center gap-3 mb-2">
                        <a href="#"><i className="bi bi-envelope"></i> hello@skillbridge.com</a>
                        <span><i className="bi bi-telephone"></i> +91 91813 23 2309</span>
                        <span><i className="bi bi-geo-alt"></i> Algum lugar no mundo</span>
                    </div>
                    <div className="d-flex justify-content-center gap-3 mb-2">
                        <a href="#"><i className="bi bi-google"></i></a>
                        <a href="#"><i className="bi bi-facebook"></i></a>
                        <a href="#"><i className="bi bi-linkedin"></i></a>
                    </div>
                    <div className="text-center small text-secondary">
                        YourBank - Todos os direitos reservados. Política de Privacidade | Termos de Serviço
                    </div>
                </footer>
            </div>
        </div>
    );
}