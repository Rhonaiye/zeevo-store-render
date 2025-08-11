// pages/privacy.tsx  (Next.js Pages Router)
// or app/privacy/page.tsx if using App Router

import Head from "next/head";

export default function PrivacyPolicy() {
  return (
    <>
      <Head>
        <title>Privacy Policy | Zeevo</title>
        <meta
          name="description"
          content="Read Zeevo's Privacy Policy to understand how we handle your data."
        />
      </Head>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-10">Effective Date: [Insert Date]</p>

        <section className="space-y-6 text-gray-700 leading-relaxed">
          <p>
            Zeevo (“we,” “our,” “us”) values your privacy. This Privacy Policy
            explains how we collect, use, and protect your information when you
            use our website, mobile application, and related services
            (collectively, the “Services”).
          </p>

          <h2 className="text-xl font-semibold">1. Information We Collect</h2>
          <p>We may collect the following types of information:</p>
          <ul className="list-disc ml-6">
            <li>
              <strong>Information You Provide:</strong> Name, email address,
              phone number, billing information, account details, business/store
              details you create.
            </li>
            <li>
              <strong>Automatically Collected:</strong> Device information, usage
              data, cookies.
            </li>
            <li>
              <strong>Third-Party Payment Data:</strong> Limited transaction
              details from payment processors like Paystack.
            </li>
          </ul>

          <h2 className="text-xl font-semibold">2. How We Use Your Information</h2>
          <ul className="list-disc ml-6">
            <li>Provide and improve our Services</li>
            <li>Process payments and manage subscriptions</li>
            <li>Communicate about your account and orders</li>
            <li>Prevent fraud and ensure platform security</li>
            <li>Comply with legal obligations</li>
          </ul>

          <h2 className="text-xl font-semibold">3. Sharing of Information</h2>
          <p>
            We do not sell your personal data. We may share it with service
            providers, legal authorities when required, and during business
            transfers such as mergers.
          </p>

          <h2 className="text-xl font-semibold">4. Data Security</h2>
          <p>
            We use industry-standard security measures, but no system is 100%
            secure. Use strong passwords and protect your account credentials.
          </p>

          <h2 className="text-xl font-semibold">5. Your Rights</h2>
          <p>
            Depending on your location, you may have the right to access, correct,
            delete, or request a copy of your data. Contact us at{" "}
            <a href="mailto:support@zeevo.com" className="text-blue-600 underline">
              support@zeevo.com
            </a>{" "}
            to exercise your rights.
          </p>

          <h2 className="text-xl font-semibold">6. Cookies and Tracking</h2>
          <p>
            We use cookies to keep you signed in, analyze site traffic, and
            personalize your experience. You can manage cookies in your browser
            settings.
          </p>

          <h2 className="text-xl font-semibold">7. Data Retention</h2>
          <p>
            We keep your information as long as your account is active or as
            needed to provide our Services. Some data may be retained for legal
            or tax purposes.
          </p>

          <h2 className="text-xl font-semibold">8. Third-Party Links</h2>
          <p>
            Our Services may contain links to other websites. We are not
            responsible for their privacy practices.
          </p>

          <h2 className="text-xl font-semibold">9. Updates to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Changes will be
            posted here with the updated date.
          </p>

          <h2 className="text-xl font-semibold">10. Contact Us</h2>
          <p>
            If you have questions, contact us at{" "}
            <a href="mailto:support@zeevo.com" className="text-blue-600 underline">
              support@zeevo.com
            </a>.
          </p>
        </section>
      </main>
    </>
  );
}
