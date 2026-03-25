export type SectionType =
  | "hero_banner"
  | "split_banner"
  | "product_grid"
  | "featured_product"
  | "text_block"
  | "image_gallery"
  | "video_banner"
  | "testimonials"
  | "stats_bar"
  | "brand_logos"
  | "newsletter"
  | "faq_accordion"
  | "two_column"
  | "full_width_image"
  | "countdown_timer"
  | "instagram_feed"
  | "category_showcase"
  | "team_section"
  | "contact_form"
  | "map_embed";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface Section {
  id: string;
  type: SectionType;
  visible: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  settings: Record<string, any>;
}

export interface BuilderPage {
  id: string;
  title: string;
  slug: string;
  seo_description: string;
  status: "draft" | "published";
  sections: Section[];
  created_at: string;
  updated_at: string;
}

export interface SectionMeta {
  type: SectionType;
  label: string;
  description: string;
  icon: string;
  category: "Layout" | "Commerce" | "Content" | "Media" | "Marketing" | "Social";
}

export const SECTION_LIBRARY: SectionMeta[] = [
  { type: "hero_banner",       label: "Hero Banner",        description: "Full-screen image with title and CTA",       icon: "🖼",  category: "Layout"    },
  { type: "split_banner",      label: "Split Banner",       description: "Image left, text right (or reverse)",        icon: "▪▪", category: "Layout"    },
  { type: "two_column",        label: "Two Column",         description: "Two text blocks side by side",               icon: "⬛⬛", category: "Layout"    },
  { type: "full_width_image",  label: "Full Width Image",   description: "Editorial full-bleed image",                 icon: "🌄",  category: "Media"     },
  { type: "image_gallery",     label: "Image Gallery",      description: "Grid of images with lightbox",               icon: "📷",  category: "Media"     },
  { type: "video_banner",      label: "Video Banner",       description: "YouTube/Vimeo embed with overlay text",      icon: "▶",   category: "Media"     },
  { type: "product_grid",      label: "Product Grid",       description: "Products in a responsive grid",              icon: "🛍",  category: "Commerce"  },
  { type: "featured_product",  label: "Featured Product",   description: "Single large product spotlight",             icon: "⭐",  category: "Commerce"  },
  { type: "category_showcase", label: "Category Showcase",  description: "Product categories with images",             icon: "🗂",  category: "Commerce"  },
  { type: "text_block",        label: "Text Block",         description: "Heading, subheading and body text",          icon: "📝",  category: "Content"   },
  { type: "faq_accordion",     label: "FAQ",                description: "Expandable questions and answers",           icon: "❓",  category: "Content"   },
  { type: "stats_bar",         label: "Stats Bar",          description: "Numbers with labels",                        icon: "📊",  category: "Content"   },
  { type: "team_section",      label: "Team Section",       description: "Team member cards",                          icon: "👥",  category: "Content"   },
  { type: "contact_form",      label: "Contact Form",       description: "Embedded contact form",                      icon: "📋",  category: "Content"   },
  { type: "map_embed",         label: "Map Embed",          description: "Google Maps iframe",                         icon: "🗺",  category: "Content"   },
  { type: "testimonials",      label: "Testimonials",       description: "Customer review carousel",                   icon: "💬",  category: "Social"    },
  { type: "brand_logos",       label: "Brand Logos",        description: "Scrolling logo strip",                       icon: "🏷",  category: "Social"    },
  { type: "instagram_feed",    label: "Instagram Feed",     description: "Grid of Instagram-style images",             icon: "📸",  category: "Social"    },
  { type: "newsletter",        label: "Newsletter",         description: "Email signup with background",               icon: "📧",  category: "Marketing" },
  { type: "countdown_timer",   label: "Countdown Timer",    description: "Sale countdown timer",                       icon: "⏱",  category: "Marketing" },
];

export const SECTION_CATEGORIES = ["Layout", "Commerce", "Content", "Media", "Marketing", "Social"] as const;

export const DEFAULT_SETTINGS: Record<SectionType, Record<string, unknown>> = {
  hero_banner: {
    image: "", overlay_color: "#000000", overlay_opacity: 40,
    title: "New Season Arrivals", subtitle: "Discover our curated collection",
    button_text: "Shop Now", button_link: "/#products",
    text_align: "center", height: "full", custom_height: 600,
  },
  split_banner: {
    image: "", title: "Our Story",
    body: "Tell your brand story here. Share what makes your products special and unique.",
    button_text: "Learn More", button_link: "/about",
    image_position: "left", bg_color: "#ffffff",
  },
  product_grid: {
    title: "Featured Products", selection: "all",
    product_ids: [], category_id: "",
    columns: 3, show_price: true, limit: 6,
  },
  featured_product: {
    product_id: "", title: "", description: "", bg_color: "#f5f0eb",
  },
  text_block: {
    heading: "About Us", subheading: "", body: "Add your text content here.",
    align: "center", bg_color: "#ffffff", padding: "md",
  },
  image_gallery: {
    title: "", images: [], columns: 3, gap: "md", lightbox: true,
  },
  video_banner: {
    url: "", overlay_text: "", overlay_subtitle: "",
    overlay_color: "#000000", overlay_opacity: 50,
  },
  testimonials: {
    title: "What Our Customers Say",
    items: [
      { id: "1", name: "Jane D.",  text: "Amazing quality! I love every piece.",     rating: 5, photo: "" },
      { id: "2", name: "Mark S.", text: "Fast shipping and beautiful packaging.", rating: 5, photo: "" },
      { id: "3", name: "Sarah K.", text: "Unique designs, great craftsmanship.",      rating: 5, photo: "" },
    ],
  },
  stats_bar: {
    bg_color: "#111111", text_color: "#ffffff",
    items: [
      { id: "1", number: "500+",    label: "Products Sold" },
      { id: "2", number: "1,000+",  label: "Happy Customers" },
      { id: "3", number: "50+",     label: "Countries Shipped" },
      { id: "4", number: "4.9★",    label: "Average Rating" },
    ],
  },
  brand_logos: {
    title: "As Seen In", logos: [], speed: 30,
  },
  newsletter: {
    title: "Stay in the Loop",
    subtitle: "Get updates on new arrivals and exclusive offers.",
    bg_image: "", bg_color: "#111111", text_color: "#ffffff", button_text: "Subscribe",
  },
  faq_accordion: {
    title: "Frequently Asked Questions",
    items: [
      { id: "1", question: "What is your return policy?",        answer: "We accept returns within 30 days of purchase in original condition." },
      { id: "2", question: "How long does shipping take?",        answer: "Standard shipping takes 3–5 business days. Express options available." },
      { id: "3", question: "Do you ship internationally?",        answer: "Yes, we ship to over 50 countries worldwide." },
    ],
  },
  two_column: {
    left_heading: "Left Heading", left_body: "Add content for the left column.",
    right_heading: "Right Heading", right_body: "Add content for the right column.",
    bg_color: "#ffffff", gap: "md",
  },
  full_width_image: {
    image: "", height: 500, overlay_color: "#000000", overlay_opacity: 0,
    caption: "", object_position: "center",
  },
  countdown_timer: {
    title: "Sale Ends In", subtitle: "Don't miss our biggest sale of the year",
    end_date: "", bg_color: "#111111", text_color: "#ffffff",
  },
  instagram_feed: {
    title: "Follow Us", handle: "@yourstore", images: [], columns: 4, link: "",
  },
  category_showcase: {
    title: "Shop by Category", category_ids: [], columns: 3,
  },
  team_section: {
    title: "Meet the Team", subtitle: "", bg_color: "#ffffff",
    members: [
      { id: "1", name: "Jane Smith", role: "Founder & Creative Director", bio: "Passionate about sustainable design.", photo: "" },
    ],
  },
  contact_form: {
    title: "Get in Touch", subtitle: "We'd love to hear from you.",
    email_to: "", bg_color: "#ffffff",
  },
  map_embed: {
    embed_url: "", height: 400, title: "Find Us", address: "",
  },
};

export function createSection(type: SectionType): Section {
  return {
    id: crypto.randomUUID(),
    type,
    visible: true,
    settings: { ...DEFAULT_SETTINGS[type] },
  };
}
