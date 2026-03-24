import Link from "next/link";
import Footer from "@/components/Footer";

export const metadata = { title: "About Us" };

const TEAM = [
  { name: "Amara Okonkwo", role: "Founder & Creative Director", image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&q=80" },
  { name: "Liam Chen", role: "Head of Design", image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80" },
  { name: "Sofia Reyes", role: "Head of Sourcing", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80" },
  { name: "Marcus Webb", role: "Operations Lead", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80" },
];

export default function AboutPage() {
  return (
    <div className="bg-white min-h-screen pt-[68px]">
      {/* Hero */}
      <section className="relative h-[60vh] min-h-[420px] overflow-hidden bg-[#f9fafb] flex items-end">
        <img
          src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1600&q=85"
          alt="About us"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <p className="text-[11px] tracking-[0.5em] uppercase font-medium text-white/70 mb-3">Our story</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl text-white font-normal leading-tight max-w-2xl">
            Made with purpose, worn with pride.
          </h1>
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-[11px] tracking-[0.5em] uppercase font-medium text-[#6b7280] mb-4">Our mission</p>
            <h2 className="text-3xl text-[#111111] mb-6 leading-tight">Clothing that speaks before you do.</h2>
            <p className="text-[#6b7280] text-sm leading-relaxed mb-4">
              We started with one belief: fashion should feel as good as it looks. Not just aesthetically, but ethically. Every piece in our collection is designed with intention — from the hands that make it to the person who wears it.
            </p>
            <p className="text-[#6b7280] text-sm leading-relaxed">
              Founded in 2021, we&apos;ve grown from a small Lagos studio to a global brand — but our commitment to craft, sustainability, and community remains unchanged.
            </p>
          </div>
          <div className="relative aspect-square bg-[#f3f4f6] overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80"
              alt="Our story"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-[#f9fafb] border-y border-[#e5e7eb] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[11px] tracking-[0.5em] uppercase font-medium text-[#6b7280] mb-4 text-center">What drives us</p>
          <h2 className="text-3xl text-[#111111] text-center mb-16">Our values</h2>
          <div className="grid sm:grid-cols-3 gap-12">
            {[
              { icon: "🌱", title: "Sustainability", body: "We source only from certified ethical manufacturers who share our commitment to fair wages and environmental responsibility." },
              { icon: "✦", title: "Quality First", body: "Every garment is tested for durability and comfort. We&apos;d rather make fewer pieces and make them perfectly." },
              { icon: "🤝", title: "Community", body: "Our customers are collaborators. We listen, we iterate, and we build the brand together with every person who wears us." },
            ].map((v) => (
              <div key={v.title} className="text-center">
                <div className="text-3xl mb-5">{v.icon}</div>
                <h3 className="text-lg text-[#111111] mb-3">{v.title}</h3>
                <p className="text-[#6b7280] text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: v.body }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <p className="text-[11px] tracking-[0.5em] uppercase font-medium text-[#6b7280] mb-4">The people</p>
        <h2 className="text-3xl text-[#111111] mb-16">Meet the team</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          {TEAM.map((member) => (
            <div key={member.name}>
              <div className="aspect-square bg-[#f3f4f6] overflow-hidden mb-4">
                <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
              </div>
              <h3 className="text-sm font-medium text-[#111111] mb-0.5">{member.name}</h3>
              <p className="text-xs text-[#6b7280]">{member.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#111111] py-20">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl text-white mb-4">Ready to discover your next favourite piece?</h2>
          <p className="text-white/60 text-sm mb-8">Explore our latest collection, thoughtfully curated for you.</p>
          <Link href="/" className="inline-block bg-[#d2ff1f] text-[#111111] text-sm font-semibold px-10 py-4 hover:opacity-90 transition-opacity">
            Shop Now
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
