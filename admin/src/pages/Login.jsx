import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Auth from '../hooks/auth';
const auth = new Auth();
import LocalStorage from '../utils/localStorage';
import { Button } from '@mui/material';
const Login = () => {
  LocalStorage.clear();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const result = await auth.login(username, password);
      if (result) {
        navigate('/');
      } else {
        setError('Invalid credentials');
      }
    } catch (err) {
      console.error(err);
      setError('Something went wrong');
    }
  };

  return (
    
      <div className="flex justify-center items-center min-h-screen bg-gray-100">


        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded-lg p-8 w-full max-w-sm"
        >
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Login</h2>

          {error && (
            <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
          )}
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            autoComplete="off"
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 mb-6 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <Button
            variant="contained"
            type="submit"
            className="w-full text-white font-semibold py-2 rounded-lg"
          >
            Login
          </Button>
        </form>
      </div>
    
  );
};

export default Login;
