import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Payment() {
  const [selectedPolicy, setSelectedPolicy] = useState('');
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchPremiumDetails() {
      try {
        const res = await fetch('/api/getUserPremium');
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Could not fetch premium details');
        }

        const { policy, pool, benefit } = data;

        const rateRes = await fetch('/api/getRate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pool })
        });

        const rateData = await rateRes.json();

        if (!rateRes.ok) {
          throw new Error(rateData.error || 'Could not fetch rate');
        }

        const qx_loess = rateData.qx_loess;

        const riskPremium = benefit * qx_loess;
        const reinsurancePremium = 0.1 * riskPremium;
        const regulatorFee = 0.01 * riskPremium;
        const opsFee = 0.002 * benefit; // 0.2% of sum assured
        const totalPremium = riskPremium + reinsurancePremium + regulatorFee + opsFee;

        // Save contribution details
        await fetch('/api/recordPaymentBreakdown', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            riskPremium,
            reinsurancePremium,
            regulatorFee,
            opsFee,
            totalPremium
          })
        });

        setSelectedPolicy(policy);
        setAmount(totalPremium);
      } catch (err) {
        console.error('⚠️ Failed to fetch premium details:', err);
        setError(err.message);
      }
    }

    fetchPremiumDetails();
  }, []);

  const handlePayment = async () => {
    if (!amount || !selectedPolicy) {
      alert('Missing payment details.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Simulate payment
      await new Promise(resolve => setTimeout(resolve, 2000));

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
            <p className="text-lg mt-4">Amount: ₦{amount.toFixed(2)}</p>
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
