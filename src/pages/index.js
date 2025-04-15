import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">Quarterhill Insurance</h1>
      <p className="text-gray-600 mb-6">Providing Affordable peer-to-peer Insurance.</p>

      <div className="flex space-x-4 mb-4">
        <Link href="/signup">
          <button className="bg-blue-500 text-white px-6 py-2 rounded-full text-xl">
            Sign Up
          </button>
        </Link>
        <Link href="/login">
          <button className="bg-cyan-500 text-white px-6 py-2 rounded-full text-xl">
            Login
          </button>
        </Link>
      </div>

      <div className="mt-4">
        <Link href="/claims">
          <button className="bg-orange-500 text-white px-6 py-2 rounded-full text-xl">
            Submit Claim
          </button>
        </Link>
      </div>
    </div>
  );
}
