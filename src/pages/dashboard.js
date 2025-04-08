import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Dashboard() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalContributions, setTotalContributions] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user data (name, policy, etc.)
        const userResponse = await fetch('/api/getUserData');
        if (userResponse.status === 401) {
          router.push('/login');
          return;
        }
        const user = await userResponse.json();
        setUserData(user);

        // Fetch total contributions
        const contributionsResponse = await fetch('/api/getTotalContributions');
        const contributionsData = await contributionsResponse.json();
        setTotalContributions(contributionsData.totalContributions || 0);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (loading) return <p>Loading dashboard...</p>;
  if (!userData) return <p>Error: Unable to load user data.</p>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-4">Welcome, {userData.name}!</h1>

      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg mb-6">
        <h2 className="text-2xl font-bold">Policy Details</h2>
        <p><strong>Policy Type:</strong> {userData.policy}</p>
        <p><strong>Total Contributions:</strong> ₦{totalContributions}</p>
      </div>

      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg mb-6">
        <h2 className="text-2xl font-bold">Manage Your Account</h2>
        <div className="flex flex-col space-y-4">
          <a href="/update-profile" className="text-blue-500">Update Profile</a>
          <a href="/claim" className="text-blue-500">Submit a Claim</a>
          <a href="/payment" className="text-blue-500">Make a Payment</a>
        </div>
      </div>

      <div className="mt-6">
        <a href="/" className="text-blue-500">Logout</a>
      </div>
    </div>
  );
}
