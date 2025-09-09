import { useState, useEffect } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';

export default function PerfilPage() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [nome, setNome] = useState(user.nome || '');
  const [email, setEmail] = useState(user.email || '');
  const [dataNascimento, setDataNascimento] = useState(user.data_nascimento || '');
  const [mensagem, setMensagem] = useState('');
  // Estado para dados do estudante
  const [estudante, setEstudante] = useState<any>(null);
  const [editEstudante, setEditEstudante] = useState(false);
  const [estudanteForm, setEstudanteForm] = useState<any>({});

  useEffect(() => {
    if (user.perfil === 'estudante') {
      axios.get(`${process.env.REACT_APP_API_URL}/estudantes/utilizador/${user.id}`)
        .then(res => {
          setEstudante(res.data);
          setEstudanteForm(res.data);
        })
        .catch(() => {
          setEstudante(null);
          setEstudanteForm({});
        });
    }
  }, [user.id, user.perfil]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/utilizadores/${user.id}`, {
        nome,
        email,
        data_nascimento: dataNascimento,
      });
      setMensagem('Perfil atualizado com sucesso!');
      localStorage.setItem('user', JSON.stringify({ ...user, nome, email, data_nascimento: dataNascimento }));
    } catch (err) {
      setMensagem('Erro ao atualizar perfil.');
    }
  };

  const handleEstudanteEdit = () => {
    setEditEstudante(true);
  };

  const handleEstudanteCancel = () => {
    setEditEstudante(false);
    setEstudanteForm(estudante);
  };

  const handleEstudanteChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEstudanteForm({ ...estudanteForm, [e.target.name]: e.target.value });
  };

  const handleEstudanteSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/estudantes/utilizador/${user.id}`, estudanteForm);
      setEstudante(estudanteForm);
      setEditEstudante(false);
      setMensagem('Dados de estudante atualizados com sucesso!');
    } catch (err) {
      setMensagem('Erro ao atualizar dados de estudante.');
      console.error(err);
    }
  };

  const handleSolicitarRemocao = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/acoes-administrativas`, {
        tipo_acao: 'remover conta',
        tabela_alvo: 'utilizadores',
        alvo_id: user.id,
        //data ação atual é a data atual
        data_acao : dayjs().format('YYYY-MM-DD HH:mm:ss'),
      });
      setMensagem('Pedido de remoção de conta enviado para aprovação do administrador.');
    } catch (err) {
      setMensagem('Erro ao solicitar remoção da conta.');
    }
  };

  return (
    <div className="homepage-bg animated-bg min-vh-100">
      <div className="container" style={{ maxWidth: 600 }}>
        <h2 className="mb-4" style={{ color: 'white' }}>O Meu Perfil</h2>
        <div className="bg-light rounded-4 p-4 shadow">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Nome</label>
              <input className="form-control" value={nome} onChange={e => setNome(e.target.value)} />
            </div>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input className="form-control" value={email} disabled />
            </div>
            <div className="mb-3">
              <label className="form-label">Data de Nascimento</label>
              <input
                type="date"
                className="form-control"
                value={dataNascimento}
                onChange={e => setDataNascimento(e.target.value)}
              />
            </div>
            <button className="btn btn-lime" type="submit">Guardar Alterações</button>
          </form>
          {mensagem && <div className="mt-3 alert alert-info">{mensagem}</div>}
          <button
            className="btn btn-danger w-100 mt-4"
            type="button"
            onClick={handleSolicitarRemocao}
          >
            Solicitar Remoção da Conta
          </button>
        </div>

        {/* Só mostra se for estudante e já carregou os dados */}
        {user.perfil === 'estudante' && estudante && (
          <div className="bg-light rounded-4 p-4 shadow mt-4" style={{ border: '1px solid #dee2e6' }}>
            <h4 className="mb-3">Dados de Estudante</h4>
            {!editEstudante ? (
              <>
                <div className="mb-2"><strong>Curso:</strong> {estudante.curso}</div>
                <div className="mb-2"><strong>Ano:</strong> {estudante.ano}</div>
                <div className="mb-2"><strong>Ano de Conclusão:</strong> {estudante.ano_conclusao}</div>
                <div className="mb-2"><strong>Áreas de Interesse:</strong> {estudante.areas_interesse}</div>
                <div className="mb-2"><strong>Soft Skills:</strong> {estudante.soft_skills}</div>
                <div className="mb-2"><strong>Competências Técnicas:</strong> {estudante.competencias_tecnicas}</div>
                <div className="mb-2"><strong>Email Institucional:</strong> {estudante.email_institucional}</div>
                <div className="mb-2"><strong>Email Pessoal:</strong> {estudante.email_pessoal}</div>
                <button className="btn btn-lime" onClick={handleEstudanteEdit}>Editar Dados de Estudante</button>
              </>
            ) : (
              <form onSubmit={handleEstudanteSave}>
                <div className="mb-2">
                  <label className="form-label">Curso</label>
                  <input className="form-control" name="curso" value={estudanteForm.curso || ''} onChange={handleEstudanteChange} />
                </div>
                <div className="mb-2">
                  <label className="form-label">Ano</label>
                  <input className="form-control" name="ano" value={estudanteForm.ano || ''} onChange={handleEstudanteChange} />
                </div>
                <div className="mb-2">
                  <label className="form-label">Ano de Conclusão</label>
                  <input className="form-control" name="ano_conclusao" value={estudanteForm.ano_conclusao || ''} onChange={handleEstudanteChange} />
                </div>
                <div className="mb-2">
                  <label className="form-label">Áreas de Interesse</label>
                  <input className="form-control" name="areas_interesse" value={estudanteForm.areas_interesse || ''} onChange={handleEstudanteChange} />
                </div>
                <div className="mb-2">
                  <label className="form-label">Soft Skills</label>
                  <input className="form-control" name="soft_skills" value={estudanteForm.soft_skills || ''} onChange={handleEstudanteChange} />
                </div>
                <div className="mb-2">
                  <label className="form-label">Competências Técnicas</label>
                  <input className="form-control" name="competencias_tecnicas" value={estudanteForm.competencias_tecnicas || ''} onChange={handleEstudanteChange} />
                </div>
                <div className="mb-2">
                  <label className="form-label">Email Institucional</label>
                  <input className="form-control" name="email_institucional" value={estudanteForm.email_institucional || ''} onChange={handleEstudanteChange} />
                </div>
                <div className="mb-2">
                  <label className="form-label">Email Pessoal</label>
                  <input className="form-control" name="email_pessoal" value={estudanteForm.email_pessoal || ''} onChange={handleEstudanteChange} />
                </div>
                <div className="d-flex gap-2 mt-2">
                  <button className="btn btn-lime" type="submit">Guardar</button>
                  <button className="btn btn-secondary" type="button" onClick={handleEstudanteCancel}>Cancelar</button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}