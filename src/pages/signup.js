import { useState } from 'react';
import Link from 'next/link';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [notification, setNotification] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password || !name) {
      alert('Please fill out all fields');
      return;
    }

    setSubmitted(true);

    // Prepare user data to send to the API
    const userData = { name, email, password };

    try {
      // Send data to the API route
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.status === 200) {
        setNotification('Signup successful! Redirecting...');
        setTimeout(() => {
          window.location.href = '/policy'; // Redirect to the policy page
        }, 2000);
      } else {
        setNotification(data.error || 'Something went wrong.');
      }
    } catch (error) {
      console.error('Error during signup:', error);
      setNotification('Error during signup. Please try again later.');
    }

    setSubmitted(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-4">Sign Up</h1>

      {notification && <div className="bg-green-500 text-white p-2 rounded mb-4">{notification}</div>}

      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg">
        <div className="mb-4">
          <label htmlFor="name" className="block text-lg">Name</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full p-2 mt-2 border border-gray-300 rounded"
            placeholder="Full Name"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="email" className="block text-lg">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-2 mt-2 border border-gray-300 rounded"
            placeholder="Email Address"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block text-lg">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-2 mt-2 border border-gray-300 rounded"
            placeholder="Password"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 mt-4 rounded-full"
        >
          {submitted ? 'Signing Up...' : 'Sign Up'}
        </button>
      </form>
      <p className="mt-4">
        Already have an account? <Link href="/login" className="text-blue-500">Login</Link>
      </p>
    </div>
  );
}
