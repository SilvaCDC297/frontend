import axios from 'axios';

export const login = async (email: string, password: string) => {
  const res = await axios.post('http://localhost:5000/api/login', { email, password });
  return res.data;
};