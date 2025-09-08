export interface Utilizador {
    id?: number;
    nome: string;
    email: string;
    password_hash: string;
    perfil: string; // 'administrador', 'gestor', 'estudante', 'empresa'
    data_nascimento?: string;
    criado_em?: string;
}

export interface Estudante {
    id?: number;
    utilizador_id: number;
    curso: string;
    ano?: number;
    ano_conclusao?: number;
    areas_interesse?: string;
    competencias_tecnicas?: string;
    soft_skills?: string;
    email_institucional?: string;
    email_pessoal?: string;
}

export interface Empresa {
    id?: number;
    utilizador_id: number;
    nome_empresa: string;
    nome_contacto?: string;
    email_contacto?: string;
}

export interface Proposta {
    id?: number;
    empresa_id: number;
    titulo: string;
    tipo: string; // emprego, estágio, etc.
    perfil_candidato?: string;
    local_trabalho?: string;
    prazo_candidatura?: string;
    tipo_contrato?: string;
    competencias_tecnicas?: string;
    soft_skills?: string;
    descricao?: string;
    nome_contacto?: string;
    email_contacto?: string;
    estado?: string;
    criado_em?: string;
}

export interface GestorDepartamento {
    id?: number;
    utilizador_id: number;
    departamento: string;
}

export interface AssociacaoProposta {
    id?: number;
    estudante_id: number;
    proposta_id: number;
    grau_compatibilidade?: number;
    candidatou_se?: boolean;
    criado_em?: string;
}

export interface AcaoAdministrativa {
    id?: number;
    admin_id?: number;
    tipo_acao: string;
    tabela_alvo: string;
    alvo_id: number;
    data_acao?: string;
    detalhes?: string;
}