import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
      <div className="max-w-md w-full text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to HeightenTheHustle Portal
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Your one-stop destination for amazing things.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/login">
            <a className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors">
              Login
            </a>
          </Link>
          <Link href="/create-account">
            <a className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-colors">
              Create an account
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}