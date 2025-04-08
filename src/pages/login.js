import { useState } from 'react';
import { useRouter } from 'next/router';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [notification, setNotification] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setNotification('Please fill out both fields.');
      return;
    }

    setNotification(''); // Clear previous notifications

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.status === 200) {
        setNotification('Login successful!');
        setTimeout(() => {
          setNotification('');
          router.push('/dashboard'); // Redirect to the dashboard after successful login
        }, 2000);
      } else {
        setNotification(data.error || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Error during login:', error);
      setNotification('Error during login. Please try again later.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-4">Login</h1>
      {notification && (
        <div
          className={`${
            notification.includes('successful') ? 'bg-green-500' : 'bg-red-500'
          } text-white p-2 rounded mb-4`}
        >
          {notification}
        </div>
      )}
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg">
        <form onSubmit={handleLogin}>
          <input
            type="email"
            className="w-full p-2 border rounded mb-2"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            className="w-full p-2 border rounded mb-2"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
            Login
          </button>
        </form>
        <p className="mt-4 text-center">
          Don't have an account?{' '}
          <a href="/signup" className="text-blue-500">
            Sign up here
          </a>
        </p>
      </div>
    </div>
  );
}
