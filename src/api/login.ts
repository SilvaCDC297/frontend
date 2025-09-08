import axios from 'axios';

export const login = async (email: string, password: string) => {
  const res = await axios.post('https://backend-ssli.onrender.com/api/login', { email, password });
  return res.data;
};