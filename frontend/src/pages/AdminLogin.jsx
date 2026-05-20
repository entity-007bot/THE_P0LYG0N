import { useState, useContext } from 'react';
import { AuthContext } from '../App';

export default function AdminLogin() {
  const [token, setToken] = useState('');
  const { setIsAdmin } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    // Verify token with backend (you can hit an endpoint)
    const res = await fetch('/api/admin/verify', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) setIsAdmin(true);
    else alert('Invalid admin token');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-steel">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-lg w-96">
        <h2 className="text-2xl font-bold text-ink mb-4">POLYGON Admin</h2>
        <input
          type="password"
          placeholder="Enter admin token"
          value={token}
          onChange={e => setToken(e.target.value)}
          className="w-full p-3 border rounded mb-4"
        />
        <button type="submit" className="w-full bg-palm text-white py-2 rounded hover:bg-green-700">
          Authenticate
        </button>
      </form>
    </div>
  );
}