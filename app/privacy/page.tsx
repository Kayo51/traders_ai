import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — TradeSpeak',
  description: 'How TradeSpeak collects, uses, and protects personal data under UK GDPR.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-zinc-300">
      {/* Minimal nav */}
      <header className="border-b border-white/[0.06] bg-black/70 backdrop-blur-xl sticky top-0 z-50">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-sm font-semibold text-white hover:text-zinc-300 transition-colors">
            TradeSpeak
          </Link>
          <Link href="/" className="text-sm text-zinc-500 hover:text-white transition-colors">
            &larr; Back to home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
        <p className="text-sm text-zinc-500 mb-12">Last updated: July 2026</p>

        <div className="space-y-12 text-sm leading-7">

          <section>
            <h2 className="text-base font-semibold text-white mb-3">1. Who we are</h2>
            <p>
              TradeSpeak (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) provides an AI-powered voice receptionist
              service for UK trade businesses. We are the data controller for the personal data
              we process in connection with this service.
            </p>
            <p className="mt-3">
              You can contact us at:{' '}
              <a href="mailto:hello@tradespeakai.co.uk" className="text-white underline underline-offset-2 hover:text-zinc-300">
                hello@tradespeakai.co.uk
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">2. The data we collect and why</h2>

            <h3 className="text-sm font-semibold text-zinc-200 mb-2 mt-5">From callers (members of the public calling a TradeSpeak number)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-2 pr-4 font-medium text-zinc-400 w-1/3">Data</th>
                    <th className="text-left py-2 pr-4 font-medium text-zinc-400 w-1/3">Purpose</th>
                    <th className="text-left py-2 font-medium text-zinc-400">Lawful basis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  <tr>
                    <td className="py-3 pr-4">Name</td>
                    <td className="py-3 pr-4">Identify the caller and personalise the call</td>
                    <td className="py-3">Legitimate interests of the trade business</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4">Phone number</td>
                    <td className="py-3 pr-4">Follow-up contact, SMS notifications to the business</td>
                    <td className="py-3">Legitimate interests of the trade business</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4">Job description</td>
                    <td className="py-3 pr-4">Capture the nature of the work requested</td>
                    <td className="py-3">Legitimate interests of the trade business</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4">Call transcript</td>
                    <td className="py-3 pr-4">Provide a written record of the conversation to the trade business</td>
                    <td className="py-3">Legitimate interests of the trade business</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4">Call recording (audio)</td>
                    <td className="py-3 pr-4">Quality assurance and dispute resolution</td>
                    <td className="py-3">Legitimate interests — callers are informed at the start of every call</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-sm font-semibold text-zinc-200 mb-2 mt-8">From trade business owners (our customers)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-2 pr-4 font-medium text-zinc-400 w-1/3">Data</th>
                    <th className="text-left py-2 pr-4 font-medium text-zinc-400 w-1/3">Purpose</th>
                    <th className="text-left py-2 font-medium text-zinc-400">Lawful basis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  <tr>
                    <td className="py-3 pr-4">Name &amp; email</td>
                    <td className="py-3 pr-4">Account creation and service communications</td>
                    <td className="py-3">Contract performance</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4">Business name &amp; trade type</td>
                    <td className="py-3 pr-4">Configure the AI receptionist correctly</td>
                    <td className="py-3">Contract performance</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4">Payment information</td>
                    <td className="py-3 pr-4">Billing for the subscription</td>
                    <td className="py-3">Contract performance — processed by Stripe, not stored by us</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4">Phone number (notification)</td>
                    <td className="py-3 pr-4">SMS lead alerts</td>
                    <td className="py-3">Contract performance</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">3. Call recording disclosure</h2>
            <p>
              Every call handled by TradeSpeak includes a spoken disclosure at the start informing
              the caller that their call is being handled by an AI system and may be recorded. This
              disclosure is delivered before any personal information is collected.
            </p>
            <p className="mt-3">
              Callers who do not wish to have their call recorded may end the call at any point.
              Call recordings are stored for the period set by the trade business owner (default
              90 days) and then automatically and permanently deleted.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">4. Who we share data with</h2>
            <p className="mb-4">
              We use a small number of trusted third-party services to operate TradeSpeak. Each
              acts as a data processor under our instruction.
            </p>
            <div className="space-y-3">
              {[
                { name: 'Twilio', role: 'Voice call routing, phone number provisioning, and call recording', location: 'USA (standard contractual clauses in place)' },
                { name: 'ElevenLabs', role: 'Text-to-speech generation for the AI voice', location: 'USA (standard contractual clauses in place)' },
                { name: 'Anthropic', role: 'AI language model powering the receptionist conversation', location: 'USA (standard contractual clauses in place)' },
                { name: 'Neon / Vercel', role: 'Database and application hosting', location: 'EU / USA (standard contractual clauses in place)' },
                { name: 'Clerk', role: 'User authentication', location: 'USA (standard contractual clauses in place)' },
                { name: 'Stripe', role: 'Payment processing — they are an independent data controller for payment data', location: 'USA / EU' },
                { name: 'Resend', role: 'Transactional email delivery', location: 'USA (standard contractual clauses in place)' },
              ].map(p => (
                <div key={p.name} className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                  <p className="font-medium text-zinc-200">{p.name}</p>
                  <p className="text-zinc-400 mt-0.5">{p.role}</p>
                  <p className="text-zinc-500 text-xs mt-1">{p.location}</p>
                </div>
              ))}
            </div>
            <p className="mt-5">
              We do not sell personal data to any third party. We do not share data with
              advertisers or marketing networks.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">5. How long we keep data</h2>
            <p>
              Caller data (name, phone, job description, transcript, recording) is retained for
              the period configured by the trade business owner, with a maximum of 12 months.
              Data is automatically and permanently deleted when the retention period expires.
            </p>
            <p className="mt-3">
              Business owner account data is retained for the duration of the subscription and
              deleted within 30 days of account closure, except where we are required to retain
              it for legal or tax purposes (typically 6 years under UK law).
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">6. Your rights under UK GDPR</h2>
            <p className="mb-4">You have the following rights regarding your personal data:</p>
            <ul className="space-y-2 list-none">
              {[
                ['Right of access', 'Request a copy of the personal data we hold about you.'],
                ['Right to rectification', 'Ask us to correct inaccurate data.'],
                ['Right to erasure', 'Ask us to delete your data, subject to legal obligations.'],
                ['Right to restriction', 'Ask us to limit how we use your data.'],
                ['Right to data portability', 'Receive your data in a structured, machine-readable format.'],
                ['Right to object', 'Object to processing based on legitimate interests.'],
              ].map(([right, desc]) => (
                <li key={right} className="flex gap-3">
                  <span className="text-white font-medium shrink-0">{right}:</span>
                  <span className="text-zinc-400">{desc}</span>
                </li>
              ))}
            </ul>
            <p className="mt-5">
              To exercise any of these rights, email us at{' '}
              <a href="mailto:hello@tradespeakai.co.uk" className="text-white underline underline-offset-2 hover:text-zinc-300">
                hello@tradespeakai.co.uk
              </a>
              . We will respond within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">7. Cookies</h2>
            <p>
              We use only essential cookies required to keep you signed in and secure your
              session. We do not use tracking or advertising cookies.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">8. Security</h2>
            <p>
              All data is encrypted in transit (TLS) and at rest. Access to personal data is
              restricted to systems that need it to deliver the service. We follow industry-standard
              security practices and review them regularly.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">9. Complaints</h2>
            <p>
              If you are unhappy with how we handle your data, you have the right to lodge a
              complaint with the UK Information Commissioner&apos;s Office (ICO):
            </p>
            <p className="mt-3">
              <a
                href="https://ico.org.uk/make-a-complaint"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white underline underline-offset-2 hover:text-zinc-300"
              >
                ico.org.uk/make-a-complaint
              </a>
              {' '}— 0303 123 1113
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">10. Changes to this policy</h2>
            <p>
              We may update this policy from time to time. If we make material changes, we will
              notify business account holders by email. Continued use of the service after
              changes take effect constitutes acceptance of the updated policy.
            </p>
          </section>

        </div>
      </main>

      <footer className="border-t border-white/[0.06] mt-16 py-8">
        <div className="mx-auto max-w-3xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-600">
          <span>&copy; 2026 TradeSpeak. All rights reserved.</span>
          <Link href="/" className="hover:text-zinc-400 transition-colors">Back to TradeSpeak</Link>
        </div>
      </footer>
    </div>
  )
}
