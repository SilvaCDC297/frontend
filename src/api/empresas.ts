import axios from 'axios';
import { Empresa } from '../types/index';

const API_URL = 'http://localhost:5000/api/empresas';

export const getEmpresas = async (): Promise<Empresa[]> => {
  const res = await axios.get(API_URL);
  return res.data;
};

export const createEmpresa = async (empresa: Partial<Empresa>): Promise<Empresa> => {
  const res = await axios.post(API_URL, empresa);
  return res.data;
};

export const updateEmpresa = async (id: number, empresa: Partial<Empresa>): Promise<Empresa> => {
  const res = await axios.put(`${API_URL}/${id}`, empresa);
  return res.data;
};

export const deleteEmpresa = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}/${id}`);
};