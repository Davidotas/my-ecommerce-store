import Link from "next/link";
import Footer from "@/components/Footer";

export const metadata = { title: "Shipping & Returns" };

export default function ShippingPage() {
  return (
    <div className="bg-white min-h-screen pt-[68px]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <p className="text-[11px] tracking-[0.5em] uppercase font-medium text-[#6b7280] mb-4">Policies</p>
        <h1 className="text-4xl sm:text-5xl text-[#111111] mb-4 leading-tight">Shipping & Returns</h1>
        <p className="text-[#6b7280] text-sm mb-16">Last updated: March 2026</p>

        <div className="space-y-14">
          {/* Shipping */}
          <section>
            <h2 className="text-xl text-[#111111] mb-6 pb-3 border-b border-[#f3f4f6]">Shipping Information</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-[#111111] mb-2">Domestic (United States)</h3>
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-[#f3f4f6]">
                      <th className="text-left py-3 text-[10px] tracking-wider uppercase text-[#9ca3af] font-medium">Method</th>
                      <th className="text-left py-3 text-[10px] tracking-wider uppercase text-[#9ca3af] font-medium">Timeframe</th>
                      <th className="text-left py-3 text-[10px] tracking-wider uppercase text-[#9ca3af] font-medium">Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f9fafb]">
                    <tr>
                      <td className="py-3 text-[#6b7280]">Standard</td>
                      <td className="py-3 text-[#6b7280]">5–7 business days</td>
                      <td className="py-3 text-[#6b7280]">Free over $100 / $8 flat</td>
                    </tr>
                    <tr>
                      <td className="py-3 text-[#6b7280]">Express</td>
                      <td className="py-3 text-[#6b7280]">2–3 business days</td>
                      <td className="py-3 text-[#6b7280]">$18</td>
                    </tr>
                    <tr>
                      <td className="py-3 text-[#6b7280]">Overnight</td>
                      <td className="py-3 text-[#6b7280]">Next business day</td>
                      <td className="py-3 text-[#6b7280]">$35</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div>
                <h3 className="text-sm font-medium text-[#111111] mb-2">International</h3>
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-[#f3f4f6]">
                      <th className="text-left py-3 text-[10px] tracking-wider uppercase text-[#9ca3af] font-medium">Region</th>
                      <th className="text-left py-3 text-[10px] tracking-wider uppercase text-[#9ca3af] font-medium">Timeframe</th>
                      <th className="text-left py-3 text-[10px] tracking-wider uppercase text-[#9ca3af] font-medium">Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f9fafb]">
                    <tr>
                      <td className="py-3 text-[#6b7280]">Europe</td>
                      <td className="py-3 text-[#6b7280]">7–10 business days</td>
                      <td className="py-3 text-[#6b7280]">$20</td>
                    </tr>
                    <tr>
                      <td className="py-3 text-[#6b7280]">Rest of World</td>
                      <td className="py-3 text-[#6b7280]">10–14 business days</td>
                      <td className="py-3 text-[#6b7280]">$25</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-[#f9fafb] border border-[#e5e7eb] p-5 text-sm text-[#6b7280] leading-relaxed">
                <strong className="text-[#111111]">Note:</strong> International orders may be subject to customs duties and taxes levied by the destination country. These charges are the responsibility of the customer.
              </div>
            </div>
          </section>

          {/* Returns */}
          <section>
            <h2 className="text-xl text-[#111111] mb-6 pb-3 border-b border-[#f3f4f6]">Returns & Exchanges</h2>
            <div className="space-y-5 text-sm text-[#6b7280] leading-relaxed">
              <p>We want you to love what you ordered. If you&apos;re not completely satisfied, we offer free returns within <strong className="text-[#111111]">30 days</strong> of delivery.</p>

              <h3 className="text-sm font-medium text-[#111111] mt-6 mb-2">Eligibility</h3>
              <ul className="list-disc list-inside space-y-1.5">
                <li>Items must be unworn and unwashed</li>
                <li>Original tags must be attached</li>
                <li>Items must be in original packaging</li>
                <li>Final sale items cannot be returned</li>
              </ul>

              <h3 className="text-sm font-medium text-[#111111] mt-6 mb-2">How to return</h3>
              <ol className="list-decimal list-inside space-y-2">
                <li>Go to our returns portal and enter your order number</li>
                <li>Select the items you want to return and the reason</li>
                <li>Download and print your prepaid return label</li>
                <li>Drop off at any carrier location within 7 days</li>
              </ol>

              <h3 className="text-sm font-medium text-[#111111] mt-6 mb-2">Refunds</h3>
              <p>Refunds are processed within 3–5 business days after we receive and inspect your return. Your bank may take an additional 2–3 days to post the refund.</p>

              <h3 className="text-sm font-medium text-[#111111] mt-6 mb-2">Exchanges</h3>
              <p>For the fastest exchange, return your item and place a new order for the correct size or color. This ensures availability.</p>
            </div>
          </section>

          {/* Contact */}
          <section className="border-t border-[#f3f4f6] pt-10">
            <p className="text-sm text-[#6b7280] mb-4">Have questions about your shipment or return?</p>
            <Link href="/contact" className="inline-block bg-[#111111] text-white text-xs tracking-[0.2em] uppercase font-medium px-8 py-3.5 hover:bg-[#333333] transition-colors">
              Contact Support
            </Link>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
