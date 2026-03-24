import Footer from "@/components/Footer";

export const metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <div className="bg-white min-h-screen pt-[68px]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <p className="text-[11px] tracking-[0.5em] uppercase font-medium text-[#6b7280] mb-4">Legal</p>
        <h1 className="text-4xl sm:text-5xl text-[#111111] mb-4 leading-tight">Terms of Service</h1>
        <p className="text-[#6b7280] text-sm mb-16">Last updated: March 2026</p>

        <div className="space-y-10 text-[#6b7280]">
          {[
            {
              title: "1. Acceptance of Terms",
              body: "By accessing and using our website and services, you accept and agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use our services.",
            },
            {
              title: "2. Products and Pricing",
              body: "We reserve the right to modify product descriptions, prices, and availability at any time without notice. We make every effort to ensure product information is accurate, but we do not warrant that descriptions or prices are error-free. In the event of a pricing error, we reserve the right to cancel or refund orders placed at the incorrect price.",
            },
            {
              title: "3. Orders and Payment",
              body: "By placing an order, you represent that you are authorized to use the payment method provided. All orders are subject to acceptance and availability. We reserve the right to refuse any order. Payment is processed securely through Stripe.",
            },
            {
              title: "4. Shipping and Delivery",
              body: "Delivery times are estimates and not guaranteed. We are not responsible for delays caused by shipping carriers, customs clearance, or circumstances beyond our control. Risk of loss and title for items purchased pass to you upon delivery.",
            },
            {
              title: "5. Returns and Refunds",
              body: "Returns are subject to our Shipping & Returns policy. We reserve the right to refuse returns that do not meet our policy criteria. Refunds are issued to the original payment method only.",
            },
            {
              title: "6. Intellectual Property",
              body: "All content on this website, including text, images, logos, and design, is the property of MYSTORE and protected by copyright law. You may not reproduce, distribute, or use any content without our express written permission.",
            },
            {
              title: "7. User Accounts",
              body: "If you create an account, you are responsible for maintaining the confidentiality of your login credentials and for all activity that occurs under your account. Notify us immediately of any unauthorized use.",
            },
            {
              title: "8. Limitation of Liability",
              body: "To the maximum extent permitted by law, MYSTORE shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our services or products, even if we have been advised of the possibility of such damages.",
            },
            {
              title: "9. Governing Law",
              body: "These Terms of Service are governed by and construed in accordance with the laws of Nigeria. Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the courts of Nigeria.",
            },
            {
              title: "10. Changes to Terms",
              body: "We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting. Your continued use of our services constitutes acceptance of the modified terms.",
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
