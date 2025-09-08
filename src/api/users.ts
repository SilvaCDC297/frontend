import axios from 'axios';
import { Utilizador } from '../types/index';

const API_URL = 'http://localhost:5000/api/utilizadores';

export const getUsers = async (): Promise<Utilizador[]> => {
  const res = await axios.get(API_URL);
  return res.data;
};

export const createUser = async (user: Partial<Utilizador>): Promise<Utilizador> => {
  const res = await axios.post(API_URL, user);
  return res.data;
};

export const updateUser = async (id: number, user: Partial<Utilizador>): Promise<Utilizador> => {
  const res = await axios.put(`${API_URL}/${id}`, user);
  return res.data;
};

export const deleteUser = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}/${id}`);
};