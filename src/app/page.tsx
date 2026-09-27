import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Brand panel */}
      <section className="relative lg:w-1/2 bg-[#2b2b2b] text-white flex flex-col justify-between p-8 lg:p-14 overflow-hidden">
        {/* Background photo with a dark gradient so the copy stays readable */}
        <Image
          src="/hero.jpg"
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover object-center opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2b2b2b] via-[#2b2b2b]/70 to-[#2b2b2b]/30" />
        <div className="absolute inset-0 hth-stripes" />
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-[#910000] opacity-40 blur-3xl" />
        <div className="absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-[#910000] opacity-30 blur-3xl" />

        <div className="relative hth-fade-up">
          <Image src="/hthlogo.svg" alt="Heighten The Hustle" width={220} height={220} priority />
        </div>

        <div className="relative mt-12 lg:mt-0">
          <p className="text-[#ff8a8a] uppercase tracking-[0.3em] text-xs font-semibold mb-4 hth-fade-up hth-fade-up-delay-1">
            Business Portal
          </p>
          <h1 className="text-6xl lg:text-8xl leading-[0.9] hth-fade-up hth-fade-up-delay-1">
            Elevate<br />your<br /><span className="text-[#ff5c5c]">hustle.</span>
          </h1>
          <p className="mt-6 max-w-md text-lg text-gray-300 hth-fade-up hth-fade-up-delay-2">
            Funding, tools, classes and a community built to take your business to the next level.
          </p>
        </div>

        <div className="relative mt-12 lg:mt-0 hth-accent-bar w-32 hth-fade-up hth-fade-up-delay-3" />
      </section>

      {/* Action panel */}
      <section className="flex-1 flex items-center justify-center p-8 lg:p-14 bg-[#f6f6f6]">
        <div className="w-full max-w-md hth-card p-8 lg:p-10 hth-fade-up hth-fade-up-delay-2">
          <h2 className="text-4xl text-gray-900 mb-2">Welcome back</h2>
          <p className="text-[#606060] mb-8">
            Sign in to manage your businesses, connect with our team and access HTH benefits.
          </p>

          <div className="flex flex-col gap-3">
            <Link
              href="/login"
              className="w-full text-center px-6 py-3 bg-[#910000] text-white font-semibold rounded-lg shadow-md hover:bg-[#7a0000] hover:shadow-lg transition-all"
            >
              Login
            </Link>
            <Link
              href="/create-account"
              className="w-full text-center px-6 py-3 bg-white text-[#910000] font-semibold rounded-lg border-2 border-[#910000] hover:bg-[#910000] hover:text-white transition-all"
            >
              Create an account
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl text-[#910000]">Funding</p>
              <p className="text-xs text-[#606060]">Grants &amp; capital</p>
            </div>
            <div>
              <p className="text-2xl text-[#910000]">Classes</p>
              <p className="text-xs text-[#606060]">HTH curriculum</p>
            </div>
            <div>
              <p className="text-2xl text-[#910000]">Network</p>
              <p className="text-xs text-[#606060]">Mentors &amp; peers</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
