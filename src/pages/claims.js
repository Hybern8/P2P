// pages/claims.js
import { useState, useEffect } from 'react';
import axios from 'axios';
import { parse } from 'cookie';  // Import the cookie package for parsing

export default function ClaimsPage() {
  const [email, setEmail] = useState('');
  const [userData, setUserData] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const initialFormState = {
    causeOfDeath: '',
    dateOfDeath: '',
    claimantName: '',
    claimantEmail: '',
    phone: '',
    bankName: '',
    accountNumber: ''
  };

  const [form, setForm] = useState(initialFormState);

  // Use the email from cookies if available
  useEffect(() => {
    const cookies = parse(document.cookie);  // Parse the cookies from the document
    const storedEmail = cookies.userEmail;  // Retrieve the userEmail cookie
    if (storedEmail) {
      setEmail(storedEmail);
      fetchUser(storedEmail); // Fetch user data if email is in cookie
    }
  }, []);

  const fetchUser = async (emailToFetch) => {
    setLoading(true);
    setMessage('');
    try {
      const response = await axios.post('/api/fetchUserByEmail', {
        email: emailToFetch.trim().toLowerCase(),
        timestamp: new Date().getTime() // To prevent caching
      });

      if (response.data.user) {
        setUserData(response.data.user);
        // Optionally store the email in cookies for future use
        document.cookie = `userEmail=${emailToFetch.trim().toLowerCase()}; path=/; max-age=31536000`; // Store cookie for 1 year
      } else {
        setUserData(null);
        setMessage('❌ User not found.');
      }
    } catch (error) {
      setUserData(null);
      setMessage('❌ Error fetching user data.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!userData?.id) {
      setMessage('User not loaded.');
      return;
    }

    try {
      await axios.post('/api/submitClaim', {
        userId: userData.id,
        ...form
      });

      // Reset the form after successful submission
      setMessage('✅ Claim submitted successfully and claim status updated to Deceased.');
      setForm(initialFormState);  // Reset form fields
      setUserData(null);  // Clear user data
      setEmail('');  // Clear the email field
    } catch (error) {
      const errMsg = error.response?.data?.error || '❌ Error submitting claim.';
      setMessage(errMsg);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Submit Claim</h2>

      <input
        type="email"
        placeholder="Enter user's email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2 w-full mb-2"
      />
      <button
        onClick={() => fetchUser(email)}
        disabled={loading || !email}
        className={`px-4 py-2 rounded mb-4 ${
          loading ? 'bg-gray-400' : 'bg-blue-600 text-white'
        }`}
      >
        {loading ? 'Fetching...' : 'Fetch User'}
      </button>

      {userData && (
        <div className="border p-4 mb-4 bg-gray-100 rounded">
          <p><strong>Name:</strong> {userData.name}</p>
          <p><strong>Pool:</strong> {userData.pool}</p>
          <p><strong>Benefit:</strong> ₦{userData.benefit}</p>
        </div>
      )}

      {userData && (
        <div>
          {[ 
            ['causeOfDeath', 'Cause of Death'],
            ['dateOfDeath', 'Date of Death'],
            ['claimantName', 'Claimant Name'],
            ['claimantEmail', 'Claimant Email'],
            ['phone', 'Phone Number'],
            ['bankName', 'Bank Name'],
            ['accountNumber', 'Bank Account Number']
          ].map(([field, label]) => (
            <input
              key={field}
              name={field}
              placeholder={label}
              type={field === 'dateOfDeath' ? 'date' : 'text'}
              value={form[field]}
              onChange={handleChange}
              className="border p-2 w-full mb-2"
            />
          ))}

          <button
            onClick={handleSubmit}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Submit Claim
          </button>
        </div>
      )}

      {message && (
        <p className="mt-4 text-center text-sm text-red-600">{message}</p>
      )}
    </div>
  );
}
