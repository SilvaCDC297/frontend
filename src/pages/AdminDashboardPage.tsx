import { useEffect, useState } from 'react';
import axios from 'axios';
import { getUsers } from '../api/users';
import { getEmpresas } from '../api/empresas';
import { getPropostas } from '../api/propostas';
import './css/AdminDashboardPage.css';

export default function AdminDashboardPage() {
  const [numUsers, setNumUsers] = useState(0);
  const [numEmpresas, setNumEmpresas] = useState(0);
  const [numPropostas, setNumPropostas] = useState(0);
  const [remocoes, setRemocoes] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [validacoes, setValidacoes] = useState<any[]>([]);
  const [propostas, setPropostas] = useState<any[]>([]);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    getUsers().then(users => {
      setNumUsers(users.length);
      setUsersList(users);
      localStorage.setItem('usersList', JSON.stringify(users));
    });
    getEmpresas().then(empresas => setNumEmpresas(empresas.length));
    getPropostas().then(propostas => setNumPropostas(propostas.length));
    // Buscar pedidos de remoção
    axios.get('http://localhost:5000/api/acoes-administrativas?tipo_acao=remover conta')
      .then(res => setRemocoes(res.data))
      .catch(() => setRemocoes([]));
    axios.get('http://localhost:5000/api/acoes-administrativas?tipo_acao=validação')
      .then(res => setValidacoes(res.data))
      .catch(() => setValidacoes([]));
    axios.get('http://localhost:5000/api/propostas')
      .then(res => setPropostas(res.data))
      .catch(() => setPropostas([]));
  }, []);

  // Função para confirmar remoção
  const handleConfirmarRemocao = async (acao: any) => {
    if (!window.confirm('Tem a certeza que deseja remover este utilizador?')) return;
    try {
      // Atualiza a ação administrativa
      await axios.put(`http://localhost:5000/api/acoes-administrativas/${acao.id}`, {
        detalhes: 'Removido com Sucesso',
        admin_id: user.id
      });
      // Remove o utilizador alvo
      await axios.delete(`http://localhost:5000/api/utilizadores/${acao.alvo_id}`);
      // Atualiza o registo no estado remocoes (não remove, só atualiza)
      setRemocoes(remocoes.map(r =>
        r.id === acao.id
          ? { ...r, detalhes: 'Removido com Sucesso', admin_id: user.id }
          : r
      ));
      setNumUsers(n => n - 1);
    } catch (err) {
      alert('Erro ao remover utilizador.');
    }
  };

  // Handler para aceitar ou negar validação
  const handleValidacao = async (id: number, detalhes: string, alvo_id?: number) => {
    try {
      await axios.put(`http://localhost:5000/api/acoes-administrativas/${id}`, { detalhes });
      setValidacoes(validacoes.map(v =>
        v.id === id ? { ...v, detalhes } : v
      ));
      // Se for Aceite, atualiza o estado da proposta para "aprovada"
      if (detalhes === 'Aceite' && alvo_id) {
        await axios.put(`http://localhost:5000/api/propostas/${alvo_id}`, { estado: 'aprovada' });
        setPropostas(propostas.map(p =>
          p.id === alvo_id ? { ...p, estado: 'aprovada' } : p
        ));
      }
      // Se for Negado, atualiza o estado da proposta para "cancelada"
      if (detalhes === 'Negado' && alvo_id) {
        await axios.put(`http://localhost:5000/api/propostas/${alvo_id}`, { estado: 'cancelada' });
        setPropostas(propostas.map(p =>
          p.id === alvo_id ? { ...p, estado: 'cancelada' } : p
        ));
      }
    } catch {
      alert('Erro ao atualizar validação.');
    }
  };

  // Helper para obter o nome do utilizador pelo ID
  const getUserNameById = (id: number) => {
    const userObj = JSON.parse(localStorage.getItem('usersList') || '[]').find((u: any) => u.id === id);
    return userObj ? userObj.nome : id;
  };

  return (
    <div className="homepage-bg animated-bg min-vh-100">
      <div className="container py-5">
        <h1 className="fw-bold mb-4" style={{ color: '#d6ff3e' }}>
          <i className="bi bi-speedometer2 me-2"></i>Dashboard Admin
        </h1>
        <div className="row g-4 mb-5">
          <div className="col-md-4">
            <div className="card text-center border-lime">
              <div className="card-body">
                <i className="bi bi-people fs-1 text-lime"></i>
                <h5 className="card-title mt-2">Utilizadores</h5>
                <p className="display-5 fw-bold">{numUsers}</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card text-center border-lime">
              <div className="card-body">
                <i className="bi bi-building fs-1 text-lime"></i>
                <h5 className="card-title mt-2">Empresas</h5>
                <p className="display-5 fw-bold">{numEmpresas}</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card text-center border-lime">
              <div className="card-body">
                <i className="bi bi-briefcase fs-1 text-lime"></i>
                <h5 className="card-title mt-2">Propostas</h5>
                <p className="display-5 fw-bold">{numPropostas}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de pedidos de remoção */}
        <div className="card border-danger mb-4">
          <div className="card-header bg-danger text-white fw-bold">
            Pedidos de Remoção de Conta
          </div>
          <div className="card-body p-0">
            {remocoes.filter(r => r.tipo_acao?.toLowerCase() === 'remover conta').length === 0 ? (
              <div className="p-3 text-center text-secondary">Nenhum pedido de remoção pendente.</div>
            ) :
              (
                <table className="table table-striped mb-0">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Tabela</th>
                      <th>Alvo</th>
                      <th>Data Pedido</th>
                      <th>Detalhes</th>
                      <th>Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {remocoes
                      .filter(r => r.tipo_acao?.toLowerCase() === 'remover conta')
                      .map(r => (
                        <tr key={r.id}>
                          <td>{r.id}</td>
                          <td>{r.tabela_alvo}</td>
                          <td>
                            {(() => {
                              const userObj = usersList.find(u => u.id === r.alvo_id);
                              return userObj ? userObj.nome : r.alvo_id;
                            })()}
                          </td>
                          <td>{r.data_acao ? new Date(r.data_acao).toLocaleString() : ''}</td>
                          <td>{r.detalhes || ''}</td>
                          <td>
                            {r.detalhes === 'Removido com Sucesso' ? (
                              <button
                                className="btn btn-sm btn-outline-danger"
                                title="Eliminar registo"
                                onClick={async () => {
                                  if (window.confirm('Eliminar este registo da tabela de ações administrativas?')) {
                                    await axios.delete(`http://localhost:5000/api/acoes-administrativas/${r.id}`);
                                    setRemocoes(remocoes.filter(x => x.id !== r.id));
                                  }
                                }}
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            ) : (
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleConfirmarRemocao(r)}
                              >
                                Confirmar
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
          </div>
        </div>

        {/* Tabela de validações de propostas */}
        <div className="card border-info mb-4 mt-5">
          <div className="card-header bg-info text-white fw-bold">
            Validações de Propostas
          </div>
          <div className="card-body p-0">
            {validacoes.length === 0 ? (
              <div className="p-3 text-center text-secondary">Nenhuma validação pendente.</div>
            ) : (
              <table className="table table-striped mb-0">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Proposta</th>
                    <th>Data Pedido</th>
                    <th>Detalhes</th>
                    <th>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {validacoes
                    .filter(v => v.tipo_acao?.toLowerCase() === 'validação')
                    .map(v => (
                      <tr key={v.id}>
                        <td>{v.id}</td>
                        <td>
                          {(() => {
                            const prop = propostas.find(p => p.id === v.alvo_id);
                            return prop ? prop.titulo : v.alvo_id;
                          })()}
                        </td>
                        <td>{v.data_acao ? new Date(v.data_acao).toLocaleString() : ''}</td>
                        <td>{v.detalhes}</td>
                        <td>
                          {v.detalhes === 'Aguardar Validação' ? (
                            <>
                              <button
                                className="btn btn-sm btn-success me-2"
                                onClick={() => handleValidacao(v.id, 'Aceite', v.alvo_id)}
                              >
                                Aceitar
                              </button>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleValidacao(v.id, 'Negado', v.alvo_id)}
                              >
                                Negar
                              </button>
                            </>
                          ) : (
                            <span className={v.detalhes === 'Aceite' ? 'text-success' : 'text-danger'}>
                              {v.detalhes}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}