import Link from 'next/link';
import WelcomeModal from '@/app/components/WelcomeModal';

export default function DashboardPage() {
  return (
    <div className="w-full max-w-5xl mx-auto">
      <WelcomeModal />

      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-[#2b2b2b] hth-stripes text-white p-8 lg:p-12 hth-fade-up">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[#910000] opacity-50 blur-3xl" />
        <div className="relative">
          <p className="text-[#ff8a8a] uppercase tracking-[0.3em] text-xs font-semibold mb-3">Your Business Hub</p>
          <h1 className="text-5xl lg:text-7xl leading-none">
            Elevate your hustle into a <span className="text-[#ff5c5c]">thriving business.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-gray-300">
            Our portal provides the tools, resources, and guidance you need to take your business to the next level.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link
              href="/dashboard/businesses"
              className="inline-flex justify-center px-6 py-3 bg-[#910000] text-white font-semibold rounded-lg shadow-md hover:bg-[#7a0000] hover:shadow-lg transition-all"
            >
              Get Started
            </Link>
            <Link
              href="/dashboard/intake-form"
              className="inline-flex justify-center px-6 py-3 bg-white/10 text-white font-semibold rounded-lg border border-white/20 hover:bg-white/20 transition-all"
            >
              Complete Intake Form
            </Link>
          </div>
        </div>
      </section>

      {/* Welcome */}
      <section className="mt-6 hth-card p-8 border-l-4 border-l-[#910000] hth-fade-up hth-fade-up-delay-1">
        <h2 className="text-3xl text-gray-900 mb-2">Welcome</h2>
        <p className="text-lg text-gray-700">
          Please add your business details and complete your profile to gain access to our HTH benefits!
        </p>
      </section>

      {/* Three-up */}
      <div className="mt-6 grid gap-6 md:grid-cols-3 hth-fade-up hth-fade-up-delay-2">
        <section className="hth-card p-7">
          <p className="text-4xl text-[#910000] leading-none mb-3">01</p>
          <h2 className="text-2xl text-gray-900 mb-2">How We Help</h2>
          <p className="text-gray-700">
            Discover our process for supporting entrepreneurs. Learn how to get involved, gain access to funding, and leverage a network built to grow your business.
          </p>
        </section>

        <section className="hth-card p-7">
          <p className="text-4xl text-[#910000] leading-none mb-3">02</p>
          <h2 className="text-2xl text-gray-900 mb-2">Our Resources</h2>
          <ul className="text-gray-700 space-y-3">
            <li>
              <span className="font-semibold text-gray-900">Funding &amp; Grants:</span> Access startup capital and grants tailored for small businesses.
            </li>
            <li>
              <span className="font-semibold text-gray-900">Business Tools:</span> Navigate forms, regulations, and potential fees with confidence.
            </li>
            <li>
              <span className="font-semibold text-gray-900">Networking:</span> Connect with a community of experienced entrepreneurs and mentors.
            </li>
          </ul>
        </section>

        <section className="hth-card p-7">
          <p className="text-4xl text-[#910000] leading-none mb-3">03</p>
          <h2 className="text-2xl text-gray-900 mb-2">Our Expertise</h2>
          <p className="text-gray-700">
            Our team has hands-on experience in business administration and entrepreneurship. We understand the challenges, opportunities, and strategies that help small businesses thrive.
          </p>
        </section>
      </div>

      {/* Stay Connected */}
      <section className="mt-6 hth-card p-8 flex flex-col md:flex-row md:items-center gap-6 hth-fade-up hth-fade-up-delay-3">
        <div className="flex-1">
          <h2 className="text-3xl text-gray-900 mb-2">Important Information</h2>
          <p className="text-gray-700">
            We will periodically send you resources, notes, and alerts to help your business grow and thrive. If you&apos;d like to stop receiving these communications, you can opt out below.
          </p>
        </div>
        <Link
          href="/dashboard/settings"
          className="shrink-0 px-6 py-3 bg-white text-[#910000] font-semibold rounded-lg border-2 border-[#910000] hover:bg-[#910000] hover:text-white transition-colors text-center"
        >
          Opt Out
        </Link>
      </section>
    </div>
  );
}
