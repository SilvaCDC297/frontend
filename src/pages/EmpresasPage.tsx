import { useEffect, useState } from 'react';
import { getEmpresas, createEmpresa, updateEmpresa, deleteEmpresa } from '../api/empresas';
import { getUsers } from '../api/users';
import { Empresa } from '../types/index';

export default function EmpresasPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [form, setForm] = useState<Partial<Empresa>>({ nome_empresa: '', nome_contacto: '', email_contacto: '' });
  const [editing, setEditing] = useState<Empresa | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [usersList, setUsersList] = useState<any[]>([]);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    getEmpresas().then(setEmpresas);
    getUsers().then(setUsersList);
  }, []);

  const handleEdit = (empresa: Empresa) => {
    setEditing(empresa);
    setForm(empresa);
    setShowForm(true);
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;
    if (!window.confirm('Eliminar esta empresa?')) return;
    await deleteEmpresa(id);
    setEmpresas(empresas.filter(e => e.id !== id));
    setMensagem('Empresa eliminada.');
  };

  const handleAdd = () => {
    setEditing(null);
    setForm({ nome_empresa: '', nome_contacto: '', email_contacto: '' });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      utilizador_id: user.id 
    };
    if (editing && editing.id) {
      const updated = await updateEmpresa(editing.id, payload);
      setEmpresas(empresas.map(e => (e.id === editing.id ? updated : e)));
      setMensagem('Empresa atualizada.');
    } else {
      const nova = await createEmpresa(payload);
      setEmpresas([...empresas, nova]);
      setMensagem('Empresa criada.');
    }
    setShowForm(false);
    setEditing(null);
    setForm({ nome_empresa: '', nome_contacto: '', email_contacto: '' });
  };

  return (
    <div className="homepage-bg animated-bg min-vh-100">
      <main className="container py-5">
        <h1 className="fw-bold mb-4" style={{ color: '#d6ff3e' }}>
          <i className="bi bi-building me-2"></i>Empresas
        </h1>
        {/* Só admin pode adicionar */}
        {user?.perfil === 'administrador' && (
          <button className="btn btn-lime mb-3" onClick={handleAdd}>
            <i className="bi bi-plus-circle"></i> Adicionar Empresa
          </button>
        )}
        {mensagem && <div className="alert alert-info">{mensagem}</div>}
        <div className="table-responsive">
          <table className="table table-dark table-striped align-middle rounded">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Contacto</th>
                <th>Email</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {empresas.map(e => (
                <tr key={e.id}>
                  <td>{e.id}</td>
                  <td>{e.nome_empresa}</td>
                  <td>{e.nome_contacto}</td>
                  <td>{e.email_contacto}</td>
                  <td>
                    {/* Só admin pode editar ou eliminar */}
                    {user?.perfil === 'administrador' && (
                      <>
                        <button className="btn btn-sm btn-outline-warning me-2" onClick={() => handleEdit(e)}>
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(e.id)}>
                          <i className="bi bi-trash"></i>
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {empresas.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-secondary">Nenhuma empresa encontrada.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Só admin pode ver o formulário */}
        {showForm && user?.perfil === 'administrador' && (
          <div className="bg-light rounded-4 p-4 mt-4" style={{ maxWidth: 500, margin: '0 auto' }}>
            <h4>{editing ? 'Editar Empresa' : 'Adicionar Empresa'}</h4>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Nome</label>
                <input className="form-control" value={form.nome_empresa || ''} onChange={e => setForm(f => ({ ...f, nome_empresa: e.target.value }))} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Nome do Contacto</label>
                <input className="form-control" value={form.nome_contacto || ''} onChange={e => setForm(f => ({ ...f, nome_contacto: e.target.value }))} />
              </div>
              <div className="mb-3">
                <label className="form-label">Email do Contacto</label>
                <input className="form-control" type="email" value={form.email_contacto || ''} onChange={e => setForm(f => ({ ...f, email_contacto: e.target.value }))} />
              </div>
              <div className="mb-3">
                <label className="form-label">Utilizador (Empresa)</label>
                <select
                  className="form-select"
                  value={form.utilizador_id || ''}
                  onChange={e => setForm(f => ({ ...f, utilizador_id: Number(e.target.value) }))}
                  required
                >
                  <option value="">Selecione o utilizador</option>
                  {usersList
                    .filter(u => u.perfil === 'empresa')
                    .map(u => (
                      <option key={u.id} value={u.id}>
                        {u.nome} ({u.email})
                      </option>
                    ))}
                </select>
              </div>
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