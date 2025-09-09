import { useEffect, useState } from 'react';
import { getUsers, updateUser, deleteUser } from '../api/users';
import { register } from '../api/register'; // importa o register
import { Utilizador } from '../types/index';
import axios from 'axios';

const user = JSON.parse(localStorage.getItem('user') || '{}');

export default function UsersPage() {
  const [users, setUsers] = useState<Utilizador[]>([]);
  const [editing, setEditing] = useState<Utilizador | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<(Partial<Utilizador> & { password?: string })>({ nome: '', email: '', perfil: '' });
  const [mensagem, setMensagem] = useState('');
  // Estado para dados de estudante
  const [estudanteForm, setEstudanteForm] = useState<any>({});
  const [showEstudante, setShowEstudante] = useState(false);

  useEffect(() => {
    getUsers().then(setUsers);
  }, []);

  // Quando editar, se for estudante, vai buscar os dados de estudante
  useEffect(() => {
    if (editing && editing.perfil === 'estudante') {
      axios.get(`${process.env.REACT_APP_API_URL}/estudantes/utilizador/${editing.id}`)
        .then(res => {
          setEstudanteForm(res.data);
          setShowEstudante(true);
        })
        .catch(() => {
          setEstudanteForm({});
          setShowEstudante(true);
        });
    } else {
      setEstudanteForm({});
      setShowEstudante(false);
    }
  }, [editing]);

  const handleEdit = (user: Utilizador) => {
    setEditing(user);
    setForm(user);
    setShowForm(true);
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;
    if (!window.confirm('Tem a certeza que deseja eliminar este utilizador?')) return;
    await deleteUser(id);
    setUsers(users.filter(u => u.id !== id));
    setMensagem('Utilizador eliminado.');
  };

  const handleAdd = () => {
    setEditing(null);
    setForm({ nome: '', email: '', perfil: '' });
    setEstudanteForm({});
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      nome: form.nome ?? '',
      email: form.email ?? '',
      perfil: form.perfil ?? '',
      password: form.password || '123456'
    };
    let updatedUser: Utilizador | undefined;
    if (editing && editing.id) {
      updatedUser = await updateUser(editing.id, payload);
      setUsers(users.map(u => (u.id === editing.id ? updatedUser! : u)));
      setMensagem('Utilizador atualizado.');
    } else {
      await register(payload);
      // Atualiza a lista de utilizadores após criar
      const listaAtualizada = await getUsers();
      setUsers(listaAtualizada);
      setMensagem('Utilizador criado.');
    }
    setShowForm(false);
    setEditing(null);
    setForm({ nome: '', email: '', perfil: '' });
    setEstudanteForm({});
    setShowEstudante(false);
  };

  const handleEstudanteChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEstudanteForm({ ...estudanteForm, [e.target.name]: e.target.value });
  };

  return (
    <div className="homepage-bg min-vh-100">
      <main className="container py-5">
        <h1 className="fw-bold mb-4" style={{ color: '#d6ff3e' }}>
          <i className="bi bi-people me-2"></i>Utilizadores
        </h1>
        {/* Só mostra o botão se não for gestor */}
        {user.perfil !== 'gestor' && (
          <button className="btn btn-lime mb-3" onClick={handleAdd}>
            <i className="bi bi-person-plus"></i> Adicionar Utilizador
          </button>
        )}
        {mensagem && <div className="alert alert-info">{mensagem}</div>}
        <div className="table-responsive">
          <table className="table table-dark table-striped align-middle rounded">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Email</th>
                <th>Perfil</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.nome}</td>
                  <td>{u.email}</td>
                  <td>{u.perfil}</td>
                  <td>
                    {/* Só mostra botões se não for gestor */}
                    {user.perfil !== 'gestor' && (
                      <>
                        <button className="btn btn-sm btn-outline-warning me-2" onClick={() => handleEdit(u)}>
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(u.id)}>
                          <i className="bi bi-trash"></i>
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-secondary">Nenhum utilizador encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Só mostra o formulário se não for gestor */}
        {showForm && user.perfil !== 'gestor' && (
          <div className="bg-light rounded-4 p-4 mt-4" style={{ maxWidth: 500, margin: '0 auto' }}>
            <h4>{editing ? 'Editar Utilizador' : 'Adicionar Utilizador'}</h4>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Nome</label>
                <input className="form-control" value={form.nome || ''} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input className="form-control" type="email" value={form.email || ''} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Perfil</label>
                <select className="form-select" value={form.perfil || ''} onChange={e => setForm(f => ({ ...f, perfil: e.target.value }))} required>
                  <option value="">Selecione...</option>
                  <option value="estudante">Estudante</option>
                  <option value="empresa">Empresa</option>
                  <option value="administrador">Administrador</option>
                  <option value="gestor">Gestor</option>
                </select>
              </div>
              {/* Campos de estudante só se perfil for estudante */}
              {showEstudante && (
                <div className="bg-white rounded-3 p-3 mb-3 border">
                  <h5 className="mb-3">Dados de Estudante</h5>
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
                </div>
              )}
              <div className="d-flex gap-2">
                <button className="btn btn-lime" type="submit">Guardar</button>
                <button className="btn btn-secondary" type="button" onClick={() => setShowForm(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}