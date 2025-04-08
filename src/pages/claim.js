import { useState } from 'react';

export default function ClaimPage() {
  const [claims, setClaims] = useState([
    { id: 1, status: 'Approved', date: '2025-03-30' },
    { id: 2, status: 'Pending', date: '2025-04-01' },
  ]);
  const [newClaim, setNewClaim] = useState('');
  const [file, setFile] = useState(null);
  const [notification, setNotification] = useState('');
  const [policyNumber, setPolicyNumber] = useState('');
  const [selectedName, setSelectedName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newClaim || !policyNumber || !selectedName) return;
    const newClaimEntry = { id: claims.length + 1, name: selectedName, policy: policyNumber, status: 'Pending', date: new Date().toISOString().split('T')[0] };
    setClaims([...claims, newClaimEntry]);
    setNewClaim('');
    setPolicyNumber('');
    setSelectedName('');
    setFile(null);
    setNotification('Claim submitted successfully!');
    setTimeout(() => setNotification(''), 3000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-4">Claims</h1>
      {notification && <div className="bg-green-500 text-white p-2 rounded mb-4">{notification}</div>}
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Previous Claims</h2>
        <ul>
          {claims.map((claim) => (
            <li key={claim.id} className="p-2 border-b">
              Claim ID: {claim.id} - Name: {claim.name} - Policy: {claim.policy} - Status: {claim.status} - Date: {claim.date}
            </li>
          ))}
        </ul>
      </div>
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg mt-4">
        <h2 className="text-2xl font-bold mb-4">Submit a New Claim</h2>
        <form onSubmit={handleSubmit}>
          <input
            className="w-full p-2 border rounded mb-2"
            type="text"
            placeholder="Your Name"
            value={selectedName}
            onChange={(e) => setSelectedName(e.target.value)}
          />
          <input
            className="w-full p-2 border rounded mb-2"
            type="text"
            placeholder="Policy Number"
            value={policyNumber}
            onChange={(e) => setPolicyNumber(e.target.value)}
          />
          <textarea
            className="w-full p-2 border rounded mb-2"
            placeholder="Describe your claim..."
            value={newClaim}
            onChange={(e) => setNewClaim(e.target.value)}
          />
          <input
            type="file"
            className="w-full p-2 border rounded mb-2"
            onChange={(e) => setFile(e.target.files[0])}
          />
          <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">Submit Claim</button>
        </form>
      </div>
    </div>
  );
}
