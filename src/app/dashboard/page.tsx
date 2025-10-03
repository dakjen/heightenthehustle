import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
          Welcome to Your Business Hub
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Elevate your hustle into a thriving business venture. Our portal provides the tools, resources, and guidance you need to take your business to the next level.
        </p>



        {/* How We Help Section */}
        <div className="bg-white shadow-lg rounded-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">How We Help</h2>
          <p className="text-lg text-gray-700">
            Discover our process for supporting entrepreneurs. Learn how to get involved, gain access to funding, and leverage a network built to grow your business.
          </p>
        </div>

        {/* Our Resources Section */}
        <div className="bg-white shadow-lg rounded-lg p-8 mb-12 text-left">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Resources</h2>
          <ul className="text-lg text-gray-700 space-y-4">
            <li>
              <span className="font-semibold">Funding & Grants:</span> Access startup capital and grants tailored for small businesses.
            </li>
            <li>
              <span className="font-semibold">Business Tools:</span> Navigate forms, regulations, and potential fees with confidence.
            </li>
            <li>
              <span className="font-semibold">Networking:</span> Connect with a community of experienced entrepreneurs and mentors.
            </li>
          </ul>
        </div>

        {/* Our Expertise Section */}
        <div className="bg-white shadow-lg rounded-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Expertise</h2>
          <p className="text-lg text-gray-700">
            Our team has hands-on experience in business administration and entrepreneurship. We understand the challenges, opportunities, and strategies that help small businesses thrive.
          </p>
        </div>

        {/* Stay Connected Section */}
        <div className="bg-white shadow-lg rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Important Information</h2>
          <p className="text-lg text-gray-700">
            We will periodically send you resources, notes, and alerts to help your business grow and thrive. If you'd like to stop receiving these communications, you can opt out below.
          </p>
          <button className="mt-6 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition-colors">
            Opt Out
          </button>
        </div>
      </div>
    </div>
  );
}
