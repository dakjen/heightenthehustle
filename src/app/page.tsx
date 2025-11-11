import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
      <div className="max-w-md w-full text-center">
        <h1 className="text-4xl font-bold text-black mb-4">
          Welcome to HeightenTheHustle Portal
        </h1>
        <p className="text-lg text-[#606060] mb-8">
          Your one-stop destination for amazing things.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/login" className="px-6 py-3 bg-[#910000] text-white font-semibold rounded-lg shadow-md hover:bg-[#7a0000] transition-colors">
            Login
          </Link>
          <Link href="/create-account" className="px-6 py-3 bg-[#910000] text-white font-semibold rounded-lg shadow-md hover:bg-[#7a0000] transition-colors">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}