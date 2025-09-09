import { useEffect, useState } from 'react';
import { getPropostas } from '../api/propostas';
import { Proposta, Empresa } from '../types/index';
import axios from 'axios';
import logo from './assets/logo.png';
import './css/HomePage.css';

export default function HomePage() {
  const [empresa, setEmpresa] = useState('');
  const [local, setLocal] = useState('');
  const [tipo, setTipo] = useState('');
  const [propostas, setPropostas] = useState<Proposta[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [resultados, setResultados] = useState<Proposta[]>([]);
  const [pesquisou, setPesquisou] = useState(false);

  useEffect(() => {
    getPropostas().then(setPropostas);
    axios.get(`${process.env.REACT_APP_API_URL}/empresas`).then(res => setEmpresas(res.data));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    let filtradas = propostas;

    if (empresa) {
      const empresaIds = empresas
        .filter(emp => emp.nome_empresa.toLowerCase().includes(empresa.toLowerCase()))
        .map(emp => emp.id);
      filtradas = filtradas.filter(p => empresaIds.includes(p.empresa_id));
    }
    if (local) {
      filtradas = filtradas.filter(p =>
        p.local_trabalho?.toLowerCase().includes(local.toLowerCase())
      );
    }
    if (tipo) {
      filtradas = filtradas.filter(p =>
        p.tipo?.toLowerCase().includes(tipo.toLowerCase())
      );
    }
    setResultados(filtradas);
    setPesquisou(true);
  };

  const getEmpresaNome = (empresa_id: number) =>
    empresas.find(e => e.id === empresa_id)?.nome_empresa || 'Empresa não encontrada';

  return (
    <div className="homepage-bg animated-bg min-vh-100">
      <nav className="navbar navbar-expand-lg navbar-dark bg-transparent px-4 py-3"></nav>
      <main className="container py-5">
        <h1 className="display-4 fw-bold" style={{ color: '#d6ff3e' }}>JobConnect ESTGV</h1>
        <h2 className="fs-5 mb-4" style={{ color: '#d6ff3e' }}>
          Encontra o teu Emprego de Sonho Hoje!
        </h2>
        <p className="lead text-white mb-4">
          Ligamos Talento a Oportunidades: A tua Porta de Entrada para o Sucesso Profissional
        </p>
        <form className="row justify-content-center mb-4" onSubmit={handleSearch}>
          <div className="col-md-2 mb-2">
            <input
              className="form-control"
              placeholder="Empresa"
              value={empresa}
              onChange={e => setEmpresa(e.target.value)}
            />
          </div>
          <div className="col-md-2 mb-2">
            <input
              className="form-control"
              placeholder="Localização"
              value={local}
              onChange={e => setLocal(e.target.value)}
            />
          </div>
          <div className="col-md-2 mb-2">
            <input
              className="form-control"
              placeholder="Tipo"
              value={tipo}
              onChange={e => setTipo(e.target.value)}
            />
          </div>
          <div className="col-md-2 mb-2">
            <button className="btn btn-lime w-100" type="submit">Pesquisar emprego</button>
          </div>
        </form>

        {pesquisou && (
          <section className="bg-light rounded-4 p-4 mb-5">
            <h4 className="fw-bold mb-3">Resultados da Pesquisa</h4>
            {resultados.length === 0 ? (
              <div className="text-secondary">Nenhuma proposta encontrada.</div>
            ) : (
              <div className="row g-3">
                {resultados.map(p => (
                  <div className="col-md-6 col-lg-4" key={p.id}>
                    <div className="card border-lime h-100">
                      <div className="card-body text-start">
                        <h5 className="card-title text-lime">{p.titulo}</h5>
                        <div><strong>Empresa:</strong> {getEmpresaNome(p.empresa_id)}</div>
                        <div><strong>Local:</strong> {p.local_trabalho}</div>
                        <div><strong>Tipo:</strong> {p.tipo}</div>
                        <div><strong>Prazo:</strong> {p.prazo_candidatura}</div>
                        <div><strong>Descrição:</strong> {p.descricao}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        <div className="d-flex justify-content-center gap-5 mb-5">
          <div className="text-center text-white">
            <div className="fs-3">
              <i className="bi bi-building" style={{ color: '#d6ff3e' }}></i> +100
            </div>
            <div>Empresas registadas</div>
          </div>
          <div className="text-center text-white">
            <div className="fs-3">
              <i className="bi bi-person-check" style={{ color: '#d6ff3e' }}></i> +5,250
            </div>
            <div>Logins Feitos</div>
          </div>
          <div className="text-center text-white">
            <div className="fs-3">
              <i className="bi bi-briefcase" style={{ color: '#d6ff3e' }}></i> +500
            </div>
            <div>Trabalhos publicados</div>
          </div>
        </div>
        <section className="bg-light rounded-4 p-4 mb-5">
          <h2 className="fw-bold mb-3">Sobre Nós</h2>
          <p>
            A JobConnect ESTGV é uma plataforma dedicada a aproximar alunos e ex-alunos da ESTGV às oportunidades de emprego e estágio, alinhadas com os seus perfis profissionais. Acreditamos no poder da comunidade académica e empresarial, criando ligações valiosas para o futuro profissional.
          </p>
          <h3 className="fw-bold mt-4 mb-3">Equipa</h3>
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            {["Martim Vasco", "Gabriel Silva", "João Silva", "Luís Ferreira", "João Pereira"].map((nome, i) => (
              <div key={i} className="card border-lime text-center p-3" style={{ minWidth: 140 }}>
                <i className="bi bi-person fs-1 mb-2" style={{ color: '#d6ff3e' }}></i>
                <div>{nome}</div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}