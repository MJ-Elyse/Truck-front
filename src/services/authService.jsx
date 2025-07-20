import axios from 'axios';

const API_URL = `${process.env.REACT_APP_BASE_URL}/auth`; 

export const login = async (email, password) => {
  try {
    const data= { email: email, password: password }
    const response = await axios.post(`${API_URL}/login`, data);
    
    const { accessToken, name } = response.data;
    
    sessionStorage.setItem('accessToken', accessToken);
    sessionStorage.setItem('userName', name)

  } catch (error) {
    throw new Error(error);
  }
};

export const register = async (name, email, password) => {
  try {
    const data= {name: name,  email: email, password: password }
    const response = await axios.post(`${API_URL}/register`, data);
  } catch (error) {
    throw new Error(error);
  }
};

const isAuthenticated = () => {
  //edit later
  return !!sessionStorage.getItem('accessToken');
};

// eslint-disable-next-line import/no-anonymous-default-export
export default {login, isAuthenticated, register};
