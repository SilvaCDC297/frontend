import axios from 'axios';

export async function register({ nome, email, password, perfil }: { nome: string, email: string, password: string, perfil: string }) {
  const res = await axios.post('https://backend-ssli.onrender.com/api/register', {
    nome,
    email,
    password,
    perfil,
  });
  return res.data;
}