import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">Welcome to P2P Insurance</h1>
      <p className="text-gray-600 mb-6">Providing affordable peer-to-peer life insurance.</p>
      <Link href="/signup">
        <button className="bg-blue-500 text-white px-6 py-2 rounded-full text-xl">
          Sign Up Now
        </button>
      </Link>
    </div>
  );
}