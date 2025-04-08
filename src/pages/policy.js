import { useState } from 'react';
import Link from 'next/link';

export default function PolicySelection() {
  const [selectedPolicy, setSelectedPolicy] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handlePolicyChange = (e) => {
    setSelectedPolicy(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Reset error before submission
    
    if (!selectedPolicy) {
      setError('Please select a policy before proceeding.');
      return;
    }

    try {
      setSubmitted(true); // Disable button during submission

      const response = await fetch('/api/setPolicy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ policy: selectedPolicy }), // Send selected policy
      });

      const data = await response.json(); // Get the response data

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update policy');
      }

      // Policy update successful — redirect to payment
      setTimeout(() => {
        window.location.href = '/payment';
      }, 1000);
    } catch (err) {
      console.error('Policy update failed:', err);
      setError('Something went wrong while updating your policy. Please try again.');
      setSubmitted(false); // Re-enable the submit button after failure
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-4">Select Your Insurance Policy</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg">
        <div className="mb-4">
          <label htmlFor="policy" className="block text-lg">Choose Policy</label>
          <select
            id="policy"
            name="policy"
            value={selectedPolicy}
            onChange={handlePolicyChange}
            required
            className="w-full p-2 mt-2 border border-gray-300 rounded"
          >
            <option value="">Select a policy</option>
            <option value="basic">Basic</option>
            <option value="premium">Premium</option>
            <option value="comprehensive">Comprehensive</option>
          </select>
        </div>
        {error && <p className="text-red-600 mb-2">{error}</p>}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 mt-4 rounded-full"
          disabled={submitted}
        >
          {submitted ? 'Processing...' : 'Proceed to Payment'}
        </button>
      </form>
      <p className="mt-4">
        <Link href="/signup" className="text-blue-500">Go Back to Sign Up</Link>
      </p>
    </div>
  );
}
