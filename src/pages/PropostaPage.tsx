import { useEffect, useState } from 'react';
import { getPropostas, createProposta, updateProposta, deleteProposta } from '../api/propostas';
import axios from 'axios';
import dayjs from 'dayjs';
import { Proposta, Empresa } from '../types/index';
import './css/PropostaPage.css';

export default function PropostasPage() {
    const [propostas, setPropostas] = useState<Proposta[]>([]);
    const [empresas, setEmpresas] = useState<Empresa[]>([]);
    const [editing, setEditing] = useState<Proposta | null>(null);
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState<Partial<Proposta>>({});
    const [mensagem, setMensagem] = useState('');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        getPropostas().then(setPropostas);
        axios.get(`${process.env.REACT_APP_API_URL}/empresas`).then(res => setEmpresas(res.data));
    }, []);

    const getEmpresa = (empresa_id: number) =>
        empresas.find(e => e.id === empresa_id);

    // CRUD HANDLERS
    const handleDelete = async (id: number) => {
        if (!window.confirm('Tem a certeza que deseja eliminar esta proposta?')) return;
        try {
            await deleteProposta(id);
            setPropostas(propostas.filter(p => p.id !== id));
            setMensagem('Proposta eliminada.');
        } catch {
            setMensagem('Erro ao eliminar proposta.');
        }
    };

    // Aprovar proposta
    const handleAprovar = async (id: number | undefined, estado?: string) => {
        if (id === undefined) return;
        try {
            const updated = await updateProposta(id, { estado: estado || 'aprovada' });
            setPropostas(propostas.map(p => (p.id === id ? updated : p)));
            setMensagem('Proposta aprovada com sucesso!');
        } catch {
            setMensagem('Erro ao aprovar proposta.');
        }
    };

    const handleEdit = (proposta: Proposta) => {
        setEditing(proposta);
        setForm(proposta);
        setMensagem('');
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editing) return;
        try {
            const updated = await updateProposta(editing.id!, form);
            setPropostas(propostas.map(p => (p.id === editing.id ? updated : p)));
            setEditing(null);
            setForm({});
            setMensagem('Proposta atualizada com sucesso!');
        } catch {
            setMensagem('Erro ao atualizar proposta.');
        }
    };

    // CREATE
    const handleCreate = () => {
        setForm({
            titulo: '',
            tipo: '',
            empresa_id: user.perfil === 'empresa' ? user.id : '', // Só para empresa
            perfil_candidato: '',
            local_trabalho: '',
            prazo_candidatura: '',
            tipo_contrato: '',
            competencias_tecnicas: '',
            soft_skills: '',
            descricao: '',
            estado: 'pendente'
        });
        setCreating(true);
        setEditing(null);
        setMensagem('');
    };

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Converte strings vazias em null
        const payload = Object.fromEntries(
            Object.entries(form).map(([k, v]) => [k, v === '' ? null : v])
        );

        console.log('Formulário enviado:', payload);
        try {
            const res = await createProposta(payload);
            console.log('Resposta da API:', res);
            setPropostas([...propostas, res]);
            setCreating(false);
            setForm({});
            setMensagem('Proposta criada com sucesso!');
        } catch (err) {
            console.error('Erro ao criar proposta:', err);
            setMensagem('Erro ao criar proposta.');
        }
    };

    // Handler para ocupar lugar
    const handleOcuparLugar = async (propostaId: number) => {
        try {
            // Apenas muda o estado para "ocupada"
            const updated = await updateProposta(propostaId, { estado: 'ocupada' });
            setPropostas(propostas.map(p => (p.id === propostaId ? updated : p)));
            setMensagem('Proposta marcada como ocupada!');
        } catch {
            setMensagem('Erro ao ocupar lugar.');
        }
    };

    return (
        <div className="propostas-bg animated-bg py-5 min-vh-100">
            <div className="container">
                <h2 className="text-center mb-4" style={{ color: '#d6ff3e', fontWeight: 700 }}>
                    <i className="bi bi-briefcase-fill me-2"></i>
                    Propostas de Trabalho
                </h2>
                {/* Botão só para empresas */}
                {['empresa', 'administrador', 'gestor'].includes(user?.perfil) && (
                    <div className="mb-4 text-end">
                        <button className="btn btn-lime" onClick={handleCreate}>
                            <i className="bi bi-plus-circle"></i> Criar Proposta
                        </button>
                    </div>
                )}
                {mensagem && <div className="alert alert-info">{mensagem}</div>}
                <div className="row g-4">
                    {propostas.map(p => {
                        const empresa = getEmpresa(p.empresa_id);
                        return (
                            <div className="col-md-6 col-lg-4" key={p.id}>
                                <div className="card proposta-card h-100 border-lime position-relative">
                                    <div className="card-body d-flex flex-column">
                                        <h5 className="card-title text-lime mb-2">
                                            <i className="bi bi-clipboard2-check me-2"></i>
                                            {p.titulo}
                                            {(user?.perfil === 'administrador' || (user?.perfil === 'empresa' && user.id === p.empresa_id)) && (
                                                <button
                                                    className="btn btn-sm btn-warning ms-2"
                                                    style={{ float: 'right' }}
                                                    title="Editar proposta"
                                                    onClick={() => handleEdit(p)}
                                                >
                                                    <i className="bi bi-pencil"></i>
                                                </button>
                                            )}
                                            {p.estado === 'cancelada' &&
                                                (
                                                    (user?.perfil === 'empresa' && user.id === p.empresa_id) ||
                                                    ['administrador', 'gestor'].includes(user?.perfil)
                                                ) && (
                                                    <button
                                                        className="btn btn-sm btn-warning ms-2"
                                                        style={{ float: 'right' }}
                                                        title="Voltar a Pendente"
                                                        onClick={() => handleAprovar(p.id, 'pendente')}
                                                    >
                                                        <i className="bi bi-arrow-repeat"></i>
                                                    </button>
                                                )}
                                            {(user?.perfil === 'administrador' || user?.perfil === 'gestor') && (
                                                <button
                                                    className="btn btn-sm btn-danger ms-2"
                                                    style={{ float: 'right' }}
                                                    title="Eliminar proposta"
                                                    onClick={() => p.id !== undefined && handleDelete(p.id)}
                                                >
                                                    <i className="bi bi-trash"></i>
                                                </button>
                                            )}
                                            {/* Ícone para aprovar se estado for pendente */}
                                            {p.estado === 'pendente' && ['administrador', 'gestor'].includes(user?.perfil) && (
                                                <button
                                                    className="btn btn-sm btn-success ms-2"
                                                    style={{ float: 'right' }}
                                                    title="Aprovar proposta"
                                                    onClick={() => handleAprovar(p.id)}
                                                >
                                                    <i className="bi bi-check-circle"></i>
                                                </button>
                                            )}
                                            {/* Ícone para voltar a pendente se estado for ocupada */}
                                            {p.estado === 'ocupada' &&
                                                (
                                                    (user?.perfil === 'empresa' && user.id === p.empresa_id) ||
                                                    ['administrador', 'gestor'].includes(user?.perfil)
                                                ) && (
                                                    <button
                                                        className="btn btn-sm btn-warning ms-2"
                                                        style={{ float: 'right' }}
                                                        title="Voltar a Pendente"
                                                        onClick={() => handleAprovar(p.id, 'pendente')}
                                                    >
                                                        <i className="bi bi-arrow-repeat"></i>
                                                    </button>
                                                )}
                                            {/* Ícone para marcar como ocupada se estado não for ocupada */}
                                            {p.estado !== 'ocupada' &&
                                                (
                                                    (user?.perfil === 'empresa' && user.id === p.empresa_id) ||
                                                    ['administrador', 'gestor'].includes(user?.perfil)
                                                ) && (
                                                    <button
                                                        className="btn btn-sm btn-primary ms-2"
                                                        style={{ float: 'right' }}
                                                        title="Marcar como Ocupada"
                                                        onClick={() => handleAprovar(p.id, 'ocupada')}
                                                    >
                                                        <i className="bi bi-person-check"></i>
                                                    </button>
                                                )}
                            
                                            {/* Botão para estudante ocupar lugar */}
                                            {user?.perfil === 'estudante' && p.estado === 'aprovada' && (
                                                <button
                                                    className="btn btn-sm btn-outline-info ms-2"
                                                    style={{ float: 'right' }}
                                                    title="Ocupar Lugar"
                                                    onClick={() => p.id !== undefined && handleOcuparLugar(p.id)}
                                                >
                                                    <i className="bi bi-patch-question"></i> Ocupar Lugar
                                                </button>
                                            )}
                                        </h5>
                                        <div className="mb-2">
                                            <span className="badge bg-dark me-2">
                                                <i className="bi bi-briefcase"></i> {p.tipo}
                                            </span>
                                            {empresa ? (
                                                <span className="badge bg-secondary">
                                                    <i className="bi bi-building"></i> {empresa.nome_empresa}
                                                </span>
                                            ) : (
                                                <span className="badge bg-secondary">
                                                    <i className="bi bi-building"></i> Empresa não encontrada
                                                </span>
                                            )}
                                        </div>
                                        {p.perfil_candidato && (
                                            <div className="mb-1">
                                                <strong>Perfil:</strong> {p.perfil_candidato}
                                            </div>
                                        )}
                                        {p.local_trabalho && (
                                            <div className="mb-1">
                                                <strong>Local:</strong> {p.local_trabalho}
                                            </div>
                                        )}
                                        {p.prazo_candidatura && (
                                            <div className="mb-1">
                                                <strong>Prazo:</strong> {p.prazo_candidatura}
                                            </div>
                                        )}
                                        {p.tipo_contrato && (
                                            <div className="mb-1">
                                                <strong>Contrato:</strong> {p.tipo_contrato}
                                            </div>
                                        )}
                                        {p.competencias_tecnicas && (
                                            <div className="mb-1">
                                                <strong>Técnicas:</strong> {p.competencias_tecnicas}
                                            </div>
                                        )}
                                        {p.soft_skills && (
                                            <div className="mb-1">
                                                <strong>Soft Skills:</strong> {p.soft_skills}
                                            </div>
                                        )}
                                        {p.descricao && (
                                            <div className="mb-1">
                                                <strong>Descrição:</strong> {p.descricao}
                                            </div>
                                        )}
                                        <div className="mt-auto">
                                            <span className={`badge ${p.estado === 'aprovada' ? 'bg-success' : 'bg-warning text-dark'}`}>
                                                {p.estado ? p.estado.charAt(0).toUpperCase() + p.estado.slice(1) : 'Pendente'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {propostas.length === 0 && (
                        <div className="text-center text-white mt-5">Nenhuma proposta disponível.</div>
                    )}
                </div>
                {/* Formulário de criação */}
                {creating && (
                    <div className="bg-light rounded-4 p-4 mt-4" style={{ maxWidth: 500, margin: '0 auto' }}>
                        <h4>Criar Proposta</h4>
                        <form onSubmit={handleCreateSubmit}>
                            {/* Se for admin/gestor, pode escolher a empresa */}
                            {['administrador', 'gestor'].includes(user?.perfil) && (
                                <div className="mb-3">
                                    <label className="form-label">Empresa</label>
                                    <select
                                        className="form-select"
                                        value={form.empresa_id || ''}
                                        onChange={e => setForm(f => ({ ...f, empresa_id: Number(e.target.value) }))}
                                        required
                                    >
                                        <option value="">Selecione a empresa...</option>
                                        {empresas.map(emp => (
                                            <option key={emp.id} value={emp.id}>{emp.nome_empresa}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            {/* Se for empresa, mete o id da empresa automaticamente */}
                            {user.perfil === 'empresa' && (
                                <input type="hidden" value={user.id} />
                            )}
                            <div className="mb-3">
                                <label className="form-label">Título</label>
                                <input
                                    className="form-control"
                                    value={form.titulo || ''}
                                    onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Tipo</label>
                                <select
                                    className="form-select"
                                    value={form.tipo || ''}
                                    onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}
                                    required
                                >
                                    <option value="">Selecione...</option>
                                    <option value="efetivo">Efetivo</option>
                                    <option value="termo_certo">Termo Certo</option>
                                    <option value="estagio">Estágio</option>
                                    <option value="freelance">Freelance</option>
                                </select>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Perfil do Candidato</label>
                                <select
                                    className="form-select"
                                    value={form.perfil_candidato || ''}
                                    onChange={e => setForm(f => ({ ...f, perfil_candidato: e.target.value }))}
                                    required
                                >
                                    <option value="">Selecione...</option>
                                    <option value="Departamento de Ambiente">Departamento de Ambiente</option>
                                    <option value="Departamento de Eng.ª Civil">Departamento de Eng.ª Civil</option>
                                    <option value="Departamento de Eng.ª Eletrotécnica">Departamento de Eng.ª Eletrotécnica</option>
                                    <option value="Departamento de Eng.ª de Madeiras">Departamento de Eng.ª de Madeiras</option>
                                    <option value="Departamento de Eng.ª Mecânica e Gestão Industrial">Departamento de Eng.ª Mecânica e Gestão Industrial</option>
                                    <option value="Departamento de Informática">Departamento de Informática</option>
                                    <option value="Departamento de Gestão">Departamento de Gestão</option>
                                    <option value="Área Científica de Matemática">Área Científica de Matemática</option>
                                </select>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Local de Trabalho</label>
                                <input
                                    className="form-control"
                                    value={form.local_trabalho || ''}
                                    onChange={e => setForm(f => ({ ...f, local_trabalho: e.target.value }))}
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Prazo de Candidatura</label>
                                <input
                                    className="form-control"
                                    value={form.prazo_candidatura || ''}
                                    onChange={e => setForm(f => ({ ...f, prazo_candidatura: e.target.value }))}
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Tipo de Contrato</label>
                                <input
                                    className="form-control"
                                    value={form.tipo_contrato || ''}
                                    onChange={e => setForm(f => ({ ...f, tipo_contrato: e.target.value }))}
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Competências Técnicas</label>
                                <input
                                    className="form-control"
                                    value={form.competencias_tecnicas || ''}
                                    onChange={e => setForm(f => ({ ...f, competencias_tecnicas: e.target.value }))}
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Soft Skills</label>
                                <input
                                    className="form-control"
                                    value={form.soft_skills || ''}
                                    onChange={e => setForm(f => ({ ...f, soft_skills: e.target.value }))}
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Descrição</label>
                                <textarea
                                    className="form-control"
                                    value={form.descricao || ''}
                                    onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
                                />
                            </div>
                            <div className="d-flex gap-2">
                                <button className="btn btn-lime" type="submit">Criar</button>
                                <button className="btn btn-secondary" type="button" onClick={() => setCreating(false)}>Cancelar</button>
                            </div>
                        </form>
                    </div>
                )}
                {/* Formulário de edição */}
                {editing && (
                    <div className="bg-light rounded-4 p-4 mt-4" style={{ maxWidth: 500, margin: '0 auto' }}>
                        <h4>Editar Proposta</h4>
                        <form onSubmit={handleEditSubmit}>
                            <div className="mb-3">
                                <label className="form-label">Título</label>
                                <input
                                    className="form-control"
                                    value={form.titulo || ''}
                                    onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Tipo</label>
                                <select
                                    className="form-select"
                                    value={form.tipo || ''}
                                    onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}
                                    required
                                >
                                    <option value="">Selecione...</option>
                                    <option value="efetivo">Efetivo</option>
                                    <option value="termo_certo">Termo Certo</option>
                                    <option value="estagio">Estágio</option>
                                    <option value="freelance">Freelance</option>
                                </select>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Perfil do Candidato</label>
                                <select
                                    className="form-select"
                                    value={form.perfil_candidato || ''}
                                    onChange={e => setForm(f => ({ ...f, perfil_candidato: e.target.value }))}
                                    required
                                >
                                    <option value="">Selecione...</option>
                                    <option value="Departamento de Ambiente">Departamento de Ambiente</option>
                                    <option value="Departamento de Eng.ª Civil">Departamento de Eng.ª Civil</option>
                                    <option value="Departamento de Eng.ª Eletrotécnica">Departamento de Eng.ª Eletrotécnica</option>
                                    <option value="Departamento de Eng.ª de Madeiras">Departamento de Eng.ª de Madeiras</option>
                                    <option value="Departamento de Eng.ª Mecânica e Gestão Industrial">Departamento de Eng.ª Mecânica e Gestão Industrial</option>
                                    <option value="Departamento de Informática">Departamento de Informática</option>
                                    <option value="Departamento de Gestão">Departamento de Gestão</option>
                                    <option value="Área Científica de Matemática">Área Científica de Matemática</option>
                                </select>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Local de Trabalho</label>
                                <input
                                    className="form-control"
                                    value={form.local_trabalho || ''}
                                    onChange={e => setForm(f => ({ ...f, local_trabalho: e.target.value }))}
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Prazo de Candidatura</label>
                                <input
                                    className="form-control"
                                    value={form.prazo_candidatura || ''}
                                    onChange={e => setForm(f => ({ ...f, prazo_candidatura: e.target.value }))}
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Tipo de Contrato</label>
                                <input
                                    className="form-control"
                                    value={form.tipo_contrato || ''}
                                    onChange={e => setForm(f => ({ ...f, tipo_contrato: e.target.value }))}
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Competências Técnicas</label>
                                <input
                                    className="form-control"
                                    value={form.competencias_tecnicas || ''}
                                    onChange={e => setForm(f => ({ ...f, competencias_tecnicas: e.target.value }))}
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Soft Skills</label>
                                <input
                                    className="form-control"
                                    value={form.soft_skills || ''}
                                    onChange={e => setForm(f => ({ ...f, soft_skills: e.target.value }))}
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Descrição</label>
                                <textarea
                                    className="form-control"
                                    value={form.descricao || ''}
                                    onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
                                />
                            </div>
                            <div className="d-flex gap-2">
                                <button className="btn btn-lime" type="submit">Guardar</button>
                                <button className="btn btn-secondary" type="button" onClick={() => setEditing(null)}>Cancelar</button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}