import Link from "next/link";
import Footer from "@/components/Footer";

export const metadata = { title: "About Us — MyKolo Mysibi Collection" };

const TEAM = [
  { name: "Kolo Adeyemi", role: "Founder & Master Craftsman", image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&q=80" },
  { name: "Tunde Fashola", role: "Head of Design", image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80" },
  { name: "Amaka Obi", role: "Head of Sourcing", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80" },
  { name: "Seun Bello", role: "Operations Lead", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80" },
];

export default function AboutPage() {
  return (
    <div className="bg-white min-h-screen pt-[68px]">
      {/* Hero */}
      <section className="relative h-[60vh] min-h-[420px] overflow-hidden bg-[#f9fafb] flex items-end">
        <img
          src="https://images.unsplash.com/photo-1541123437800-1bb1317badc2?w=1600&q=85"
          alt="About us"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/45" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <p className="text-[11px] tracking-[0.5em] uppercase font-medium text-white/70 mb-3">Our story</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl text-white font-normal leading-tight max-w-2xl">
            Made from the earth, crafted with heart.
          </h1>
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-[11px] tracking-[0.5em] uppercase font-medium text-[#6b7280] mb-4">Our mission</p>
            <h2 className="text-3xl text-[#111111] mb-6 leading-tight">Wood that tells a story.</h2>
            <p className="text-[#6b7280] text-sm leading-relaxed mb-4">
              We started with a single belief: discarded wood deserves a second life. Every piece of timber we use has a history — salvaged from old buildings, fallen trees, and reclaimed materials that would otherwise end up as waste.
            </p>
            <p className="text-[#6b7280] text-sm leading-relaxed">
              Founded in Lagos, MyKolo Mysibi Collection has grown from a small workshop into a globally recognised brand — but our commitment to sustainable craft, artisan skill, and the beauty of natural wood remains unchanged.
            </p>
          </div>
          <div className="relative aspect-square bg-[#f3f4f6] overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1544457070-4cd773b4d71e?w=800&q=80"
              alt="Our workshop"
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
              { icon: "🌿", title: "Sustainability", body: "We use only reclaimed and responsibly sourced wood. Every purchase helps reduce deforestation and gives new purpose to discarded materials." },
              { icon: "✦", title: "Artisan Quality", body: "Every item is hand-shaped, sanded, and finished by skilled craftspeople. We take time because quality cannot be rushed." },
              { icon: "🪵", title: "Natural Beauty", body: "No two pieces are alike. The grain, texture, and character of each item reflects the unique history of the wood it came from." },
            ].map((v) => (
              <div key={v.title} className="text-center">
                <div className="text-3xl mb-5">{v.icon}</div>
                <h3 className="text-lg text-[#111111] mb-3">{v.title}</h3>
                <p className="text-[#6b7280] text-sm leading-relaxed">{v.body}</p>
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
          <h2 className="text-3xl text-white mb-4">Ready to bring handcrafted wood art into your home?</h2>
          <p className="text-white/60 text-sm mb-8">Explore our latest collection, each piece crafted just for you.</p>
          <Link href="/" className="inline-block bg-white text-[#111111] text-sm font-semibold px-10 py-4 hover:bg-white/90 transition-colors">
            Shop Now
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
