import { useState } from 'react';
import Link from 'next/link';

export default function PolicySelection() {
  const [selectedPolicy, setSelectedPolicy] = useState('');
  const [selectedBenefit, setSelectedBenefit] = useState('');
  const [startDate, setStartDate] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [occupation, setOccupation] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedPolicy || !selectedBenefit || !startDate || !dob || !gender || !occupation) {
      setError('Please complete all fields including DOB, gender, and occupation.');
      return;
    }

    try {
      setSubmitted(true);
      const response = await fetch('/api/setPolicy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          policy: selectedPolicy,
          benefit: selectedBenefit,
          startDate,
          dob,
          gender,
          occupation
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Policy update failed');

      setTimeout(() => {
        window.location.href = '/payment';
      }, 1000);
    } catch (err) {
      console.error('Policy update failed:', err);
      setError('An error occurred. Please try again.');
      setSubmitted(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-4">Select Your Insurance Options</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg">
        <div className="mb-4">
          <label htmlFor="policy" className="block text-lg">Choose Policy Type</label>
          <select
            id="policy"
            value={selectedPolicy}
            onChange={(e) => setSelectedPolicy(e.target.value)}
            required
            className="w-full p-2 mt-2 border border-gray-300 rounded"
          >
            <option value="">Select a policy</option>
            <option value="OneLife Policy">OneLife Policy</option>
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="benefit" className="block text-lg">Choose Benefit Value</label>
          <select
            id="benefit"
            value={selectedBenefit}
            onChange={(e) => setSelectedBenefit(e.target.value)}
            required
            className="w-full p-2 mt-2 border border-gray-300 rounded"
          >
            <option value="">Select a benefit</option>
            <option value="1000000">₦1,000,000</option>
            <option value="2000000">₦2,000,000</option>
            <option value="3000000">₦3,000,000</option>
            <option value="4000000">₦4,000,000</option>
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="startDate" className="block text-lg">Policy Start Date</label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            className="w-full p-2 mt-2 border border-gray-300 rounded"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="dob" className="block text-lg">Date of Birth</label>
          <input
            type="date"
            id="dob"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            required
            className="w-full p-2 mt-2 border border-gray-300 rounded"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="gender" className="block text-lg">Gender</label>
          <select
            id="gender"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            required
            className="w-full p-2 mt-2 border border-gray-300 rounded"
          >
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="occupation" className="block text-lg">Occupation</label>
          <select
            id="occupation"
            value={occupation}
            onChange={(e) => setOccupation(e.target.value)}
            required
            className="w-full p-2 mt-2 border border-gray-300 rounded"
          >
            <option value="">Select occupation</option>
            <option value="IT Executive">IT Executive</option>
            <option value="Creative Executive">Creative Executive</option>
            <option value="Health Executive">Health Executive</option>
            <option value="Business Executive">Business Executive</option>
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
