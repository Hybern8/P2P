import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Payment() {
  const [selectedPolicy, setSelectedPolicy] = useState('');
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const policyPrices = {
    basic: 5000,
    premium: 10000,
    comprehensive: 15000
  };

  useEffect(() => {
    async function fetchPolicy() {
      try {
        const res = await fetch('/api/getUserPolicy');
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Could not fetch policy');
        }

        const policy = data.policy?.toLowerCase();

        if (!policy || !policyPrices[policy]) {
          throw new Error('Invalid or missing policy. Please re-select your policy.');
        }

        setSelectedPolicy(policy);
        setAmount(policyPrices[policy]);
      } catch (err) {
        console.error('⚠️ Failed to fetch policy:', err);
        setError(err.message);
      }
    }

    fetchPolicy();
  }, []);

  const handlePayment = async () => {
    if (!amount || !selectedPolicy) {
      alert('Missing payment details.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // simulate payment gateway

      const response = await fetch('/api/recordPayment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Payment failed');
      }

      alert('✅ Payment successful!');
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('❌ Payment error:', error);
      alert(`Payment failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-4">Payment</h1>
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg">
        {error ? (
          <p className="text-red-600 text-center">{error}</p>
        ) : (
          <>
            <p className="text-lg">
              You are about to pay for the <strong>{selectedPolicy?.toUpperCase()}</strong> policy.
            </p>
            <p className="text-lg mt-4">Amount: ₦{amount}</p>
            <button
              onClick={handlePayment}
              className="w-full bg-blue-500 text-white p-2 mt-4 rounded-full"
              disabled={loading}
            >
              {loading ? 'Processing Payment...' : 'Pay Now'}
            </button>
          </>
        )}
      </div>
      <p className="mt-4">
        <Link href="/policy" className="text-blue-500">Go Back to Policy Selection</Link>
      </p>
    </div>
  );
}
