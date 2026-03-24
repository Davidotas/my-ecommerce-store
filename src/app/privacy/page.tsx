import Footer from "@/components/Footer";

export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <div className="bg-white min-h-screen pt-[68px]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <p className="text-[11px] tracking-[0.5em] uppercase font-medium text-[#6b7280] mb-4">Legal</p>
        <h1 className="text-4xl sm:text-5xl text-[#111111] mb-4 leading-tight">Privacy Policy</h1>
        <p className="text-[#6b7280] text-sm mb-16">Last updated: March 2026</p>

        <div className="prose prose-sm max-w-none space-y-10 text-[#6b7280]">
          {[
            {
              title: "1. Information We Collect",
              body: "We collect information you provide directly to us, such as when you create an account, place an order, or contact us for support. This includes your name, email address, shipping address, payment information (processed securely by Stripe), and any communications you send us.",
            },
            {
              title: "2. How We Use Your Information",
              body: "We use the information we collect to process and fulfill your orders, send order confirmations and shipping updates, respond to your questions and support requests, improve our products and services, and send marketing communications (only if you opt in).",
            },
            {
              title: "3. Information Sharing",
              body: "We do not sell, rent, or trade your personal information. We share information only with trusted service providers who assist us in operating our website (e.g., Stripe for payments, shipping carriers for delivery), and only as necessary to provide these services.",
            },
            {
              title: "4. Cookies",
              body: "We use cookies and similar tracking technologies to enhance your browsing experience, remember your preferences, and analyze site traffic. You can control cookie settings through your browser. Disabling cookies may affect some features of our website.",
            },
            {
              title: "5. Data Security",
              body: "We implement industry-standard security measures to protect your personal information. Payment information is encrypted via TLS and processed by Stripe, a PCI DSS compliant payment processor. We never store full payment card details.",
            },
            {
              title: "6. Your Rights",
              body: "You have the right to access, correct, or delete your personal information at any time. You may also opt out of marketing emails at any time using the unsubscribe link in our emails. To exercise these rights, contact us at privacy@mystore.com.",
            },
            {
              title: "7. Data Retention",
              body: "We retain your personal information for as long as necessary to fulfill the purposes outlined in this policy, comply with legal obligations, and resolve disputes. Order data is retained for 7 years for accounting purposes.",
            },
            {
              title: "8. Changes to This Policy",
              body: "We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the 'Last updated' date. Your continued use of our services after changes constitutes acceptance.",
            },
            {
              title: "9. Contact Us",
              body: "If you have any questions about this Privacy Policy or our data practices, please contact us at privacy@mystore.com or write to us at: MYSTORE, 123 Fashion Street, Lagos, Nigeria.",
            },
          ].map((section) => (
            <section key={section.title}>
              <h2 className="text-base font-medium text-[#111111] mb-3">{section.title}</h2>
              <p className="text-sm leading-relaxed">{section.body}</p>
            </section>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
