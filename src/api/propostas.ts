import axios from 'axios';
import { Proposta } from '../types/index';

const API_URL = 'https://backend-ssli.onrender.com/api/propostas';

export const getPropostas = async (): Promise<Proposta[]> => {
  const res = await axios.get(API_URL);
  return res.data;
};

export const createProposta = async (proposta: Partial<Proposta>): Promise<Proposta> => {
  const res = await axios.post(API_URL, proposta);
  return res.data;
};

export const updateProposta = async (id: number, proposta: Partial<Proposta>): Promise<Proposta> => {
  const res = await axios.put(`${API_URL}/${id}`, proposta);
  return res.data;
};

export const deleteProposta = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}/${id}`);
};