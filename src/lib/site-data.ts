// Central content source for Big My Business website.
// NOTE: All copy is original / re-authored for "Big My Business".
// The reference site's brand name does NOT appear anywhere.

export const SITE = {
  brand: "Big My Business",
  brandShort: "BMB",
  tagline: "Connect. Collaborate. Grow Big.",
  phone: "9424242043",
  phoneDisplay: "+91 94242 42043",
  email: "info@bigmybusiness.in",
  addressLines: [
    "Karma Bhawan, 1st Floor",
    "Near Shastri Government Hospital",
    "G.E. Road, Supela",
    "Bhilai, Chhattisgarh",
  ],
  addressSingle:
    "Karma Bhawan, 1st Floor, Near Shastri Government Hospital, G.E. Road, Supela, Bhilai (Chhattisgarh)",
  establishedYear: 2019,
  social: {
    facebook: "#",
    instagram: "#",
    linkedin: "#",
    youtube: "#",
    whatsapp: "https://wa.me/919424242043",
  },
};

export type NavItem = {
  label: string;
  href: string;
  children?: { label: string; href: string; desc?: string }[];
};

export const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "#home" },
  {
    label: "Memberships",
    href: "#memberships",
    children: [
      { label: "Prime Membership", href: "#memberships", desc: "Life membership for active entrepreneurs" },
      { label: "Privilege Membership", href: "#memberships", desc: "City-chapter powered premium plan" },
    ],
  },
  { label: "Events", href: "#events" },
  { label: "Awards", href: "#awards" },
  { label: "Blog", href: "#blog" },
  { label: "About", href: "#about" },
  { label: "FAQ", href: "#faq" },
];

// Animated hero / journey statistics
export const HERO_STATS = [
  { value: 90, suffix: "+", label: "Cities", sub: "across India" },
  { value: 6500, suffix: "+", label: "Members", sub: "and growing" },
  { value: 200, suffix: "+", label: "Chapters", sub: "active meetings" },
  { value: 250, suffix: " Cr+", label: "Business Done", sub: "through referrals" },
];

// "What Result We Get" grid
export const RESULTS_GRID = [
  { label: "States", value: 12, suffix: "+" },
  { label: "Cities", value: 90, suffix: "+" },
  { label: "Chapters", value: 200, suffix: "+" },
  { label: "Members", value: 6500, suffix: "+" },
  { label: "V2V Connects", value: 18000, suffix: "+" },
  { label: "Reference Pass", value: 45000, suffix: "+" },
  { label: "Cr Business Done", value: 250, suffix: "+" },
  { label: "Business Categories", value: 320, suffix: "+" },
  { label: "Collaborations", value: 1200, suffix: "+" },
  { label: "Joint Ventures", value: 380, suffix: "+" },
  { label: "Completed Webinars", value: 540, suffix: "+" },
  { label: "Inter-City Meets", value: 260, suffix: "+" },
];

// Benefits of joining
export type Benefit = {
  title: string;
  desc: string;
  icon: string; // lucide icon name
};

export const BENEFITS: Benefit[] = [
  {
    title: "Application Access",
    desc: "Unlock the Big My Business app to connect with members across 90+ cities from your phone.",
    icon: "Smartphone",
  },
  {
    title: "On-Boarding Training",
    desc: "Dive into structured onboarding that builds your networking knowledge from day one.",
    icon: "GraduationCap",
  },
  {
    title: "Get a Referral",
    desc: "Tap into abundant business references and unlock more qualified opportunities every week.",
    icon: "Share2",
  },
  {
    title: "Business Expansion",
    desc: "Nurture growth and expand your network into new cities and new categories.",
    icon: "TrendingUp",
  },
  {
    title: "Inter-City Connection",
    desc: "Drive collaboration across cities and build a truly pan-India presence.",
    icon: "MapPin",
  },
  {
    title: "Collaboration",
    desc: "Access diverse opportunities and foster growth through meaningful partnerships.",
    icon: "Handshake",
  },
  {
    title: "Regular Business Webinars",
    desc: "Stay updated with industry webinars and strengthen your business knowledge.",
    icon: "MonitorPlay",
  },
  {
    title: "Leadership Development",
    desc: "Lead with impact, empower others and seize chapter leadership opportunities.",
    icon: "Crown",
  },
  {
    title: "Skill Development",
    desc: "Numerous skill-building chances to enhance your expertise for lasting success.",
    icon: "Sparkles",
  },
];

// Membership plans
export type Plan = {
  id: "prime" | "privilege";
  name: string;
  badge: string;
  price: string;
  priceNote: string;
  period: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  cta: string;
};

export const MEMBERSHIP_PLANS: Plan[] = [
  {
    id: "prime",
    name: "Prime Membership",
    badge: "Most Popular",
    price: "₹2,499",
    priceNote: "*exclusive of GST",
    period: "Life Membership",
    description:
      "The most popular choice for active entrepreneurs who want to grow through structured networking.",
    features: [
      "Exclusive Mobile Application access",
      "Welcome Kit delivered to your doorstep",
      "Access to business growth video series",
      "WhatsApp group promotion (every 15 days)",
      "Business promotion inside the application",
      "Inter-city networking on Zoom (twice a month)",
      "1 business webinar on Zoom every month",
      "Special discounts on central events & exhibitions",
    ],
    cta: "Join Prime Membership",
  },
  {
    id: "privilege",
    name: "Privilege Membership",
    badge: "Premium",
    price: "City-Specific",
    priceNote: "fee set by city executive director",
    period: "One Year Membership",
    description:
      "A premium city-chapter powered plan for entrepreneurs who want weekly in-person networking and leadership.",
    features: [
      "Welcome post + Welcome Kit with name badge",
      "Includes Prime Membership & all its benefits",
      "City-specific WhatsApp chapter community",
      "Open conversations on the chapter group",
      "Post your ask & give anytime on app/WhatsApp",
      "Category-wise member search in application",
      "Physical chapter meetings every 15 days",
      "Leadership, substitutes & business seminars",
    ],
    highlighted: true,
    cta: "Join Privilege Membership",
  },
];

// Events
export type EventItem = {
  title: string;
  date: string;
  dateShort: { day: string; month: string };
  time: string;
  location: string;
  type: "Physical" | "Online";
  status: "Upcoming" | "Completed";
  desc: string;
};

export const EVENTS: EventItem[] = [
  {
    title: "Supela Chapter Power Meet",
    date: "Oct 12, 2025",
    dateShort: { day: "12", month: "Oct" },
    time: "10:00 AM - 12:00 PM",
    location: "Karma Bhawan, Supela, Bhilai",
    type: "Physical",
    status: "Upcoming",
    desc: "Bi-weekly chapter meeting with member introductions, referral exchange and a featured speaker.",
  },
  {
    title: "Inter-City Networking Summit",
    date: "Oct 26, 2025",
    dateShort: { day: "26", month: "Oct" },
    time: "04:00 PM - 06:00 PM",
    location: "Hotel Grand Dhillon, Durg",
    type: "Physical",
    status: "Upcoming",
    desc: "Members from Raipur, Bhilai, Durg and Bilaspur connect for cross-city collaboration.",
  },
  {
    title: "Business Growth Webinar",
    date: "Nov 03, 2025",
    dateShort: { day: "03", month: "Nov" },
    time: "07:00 PM - 08:30 PM",
    location: "Zoom (Online)",
    type: "Online",
    status: "Upcoming",
    desc: "Expert-led session on scaling SMEs with structured referrals and digital presence.",
  },
  {
    title: "Annual Awards & Recognition Night",
    date: "Dec 20, 2025",
    dateShort: { day: "20", month: "Dec" },
    time: "06:00 PM onwards",
    location: "Bhilai Mahotsav Ground, Bhilai",
    type: "Physical",
    status: "Upcoming",
    desc: "Celebrating the year's most collaborative members, leaders and high-growth businesses.",
  },
];

// Awards
export const AWARD_CATEGORIES = [
  "Business Leader of the Year",
  "Rising Entrepreneur Award",
  "Most Collaborative Member",
  "Chapter Excellence Award",
  "Women Entrepreneur of the Year",
  "Innovation & Growth Award",
  "Best Cross-City Collaboration",
  "Mentor of the Year",
];

// Blog / Expert Insights
export type BlogPost = {
  title: string;
  category: string;
  date: string;
  readTime: string;
  excerpt: string;
  content: string[];
};

export const BLOG_POSTS: BlogPost[] = [
  {
    title: "Cash Flow vs. Creativity — Balancing discipline with innovation",
    category: "Finance",
    date: "Sep 12, 2025",
    readTime: "6 min read",
    excerpt:
      "Innovation drives growth but cash flow keeps the engine running. Here's how successful entrepreneurs balance both.",
    content: [
      "Keep creativity within a budget — set clear limits so new ideas never endanger your cash flow.",
      "Invest in ideas that create real value: better products, happier customers, lower costs, new revenue.",
      "Healthy cash flow gives you the confidence to take calculated creative risks.",
      "Think big, start small — test a mini version before committing heavy investment.",
      "Balance today's bills with tomorrow's vision — both need funding.",
      "Make creativity financially sustainable — ask how each idea grows the business.",
    ],
  },
  {
    title: "How Networking Keeps Entrepreneurs Motivated and Growing",
    category: "Motivation",
    date: "Aug 10, 2025",
    readTime: "5 min read",
    excerpt:
      "Networking is more than meeting people. It's a daily source of ideas, encouragement and opportunity.",
    content: [
      "Find support and encouragement by sharing challenges with peers who get it.",
      "Discover new ideas and strategies from entrepreneurs with different experiences.",
      "Create new opportunities — referrals, partnerships and customers you'd never find alone.",
      "Stay motivated being around ambitious, growth-focused people.",
      "Learn and grow together — networking is a two-way exchange of knowledge.",
    ],
  },
  {
    title: "Every Challenge Creates a New Business Opportunity",
    category: "Motivation",
    date: "May 09, 2025",
    readTime: "4 min read",
    excerpt:
      "Challenges aren't roadblocks — they're the raw material for innovation, experience and growth.",
    content: [
      "Challenges help you grow — they sharpen decisions, leadership and problem-solving.",
      "Problems create innovation — many businesses started by solving a common pain.",
      "Change creates new opportunities — adapting quickly uncovers fresh growth.",
      "Failure builds experience — practical lessons that shape stronger strategy.",
      "A solution-focused mindset is the real currency of success.",
    ],
  },
];

// Testimonials
export type Testimonial = {
  name: string;
  role: string;
  city: string;
  quote: string;
  initials: string;
};

export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Adarsh Sangani",
    role: "Founder, Textile Exports",
    city: "Surat Region",
    quote:
      "Big My Business is more than a networking platform — it's a circle of trust, growth and opportunity. The relationships I've built here have added immense value to my professional journey.",
    initials: "AS",
  },
  {
    name: "Dhruv Dave",
    role: "Director, agro-supply chain",
    city: "Surat Region",
    quote:
      "Every entrepreneur needs a platform that helps them grow beyond their business. Big My Business connected me with visionary owners and created opportunities far beyond traditional networking.",
    initials: "DD",
  },
  {
    name: "Ketan Kathiriya",
    role: "Owner, manufacturing unit",
    city: "Surat Region",
    quote:
      "I've gained more than business connections — I've gained a trusted circle that genuinely cares about each other's success. Every meeting is worth the time.",
    initials: "KK",
  },
  {
    name: "Umesh Khivasara",
    role: "Real estate consultant",
    city: "Nashik Region",
    quote:
      "The support, trust and collaboration among members make this a unique and rewarding community. The networking opportunities have added tremendous value to my business journey.",
    initials: "UK",
  },
  {
    name: "Ujjaval Shah",
    role: "CA & financial advisor",
    city: "Anand Region",
    quote:
      "Thank you for creating such a valuable and well-organised community. The opportunities for collaboration and growth have been truly exceptional.",
    initials: "US",
  },
];

// FAQ
export const FAQS = [
  {
    q: "What is Big My Business?",
    a: "Big My Business is one of India's fastest-growing business networking communities. We help entrepreneurs, startups and business owners connect, collaborate and grow through structured, meaningful and result-oriented networking across 90+ cities.",
  },
  {
    q: "Who can become a member?",
    a: "Any business owner, entrepreneur, startup founder, freelancer or professional committed to growing through genuine referrals and collaboration can apply. Membership is reviewed to maintain chapter quality.",
  },
  {
    q: "What is the difference between Prime and Privilege membership?",
    a: "Prime is a one-time life membership (₹2,499, exclusive of GST) ideal for those who want app-based networking and online webinars. Privilege is a city-chapter powered annual plan with physical meetings every 15 days, leadership opportunities and a dedicated WhatsApp community — its fee is city-specific.",
  },
  {
    q: "How do referrals work inside the community?",
    a: "Members share their 'ask' and 'give' on the app and chapter WhatsApp groups. Category-wise search helps you find the right partner, and bi-weekly meetings formalise the referrals exchanged.",
  },
  {
    q: "Can I attend a meeting before joining?",
    a: "Yes. Visitors can attend one chapter meeting as a guest (subject to seat availability) to experience the format first-hand. Contact us to reserve your visitor seat.",
  },
  {
    q: "Is the membership fee refundable?",
    a: "Membership fees are non-refundable. Prime is a lifetime plan and Privilege is annual — both grant immediate access to the app, welcome kit and all listed benefits.",
  },
  {
    q: "Where is the head office located?",
    a: "Our office is at Karma Bhawan, 1st Floor, Near Shastri Government Hospital, G.E. Road, Supela, Bhilai (Chhattisgarh). You can reach us at +91 94242 42043.",
  },
];

// Marquee partners / categories strip
export const PARTNER_CATEGORIES = [
  "Manufacturing",
  "Real Estate",
  "Finance & CA",
  "IT & Software",
  "Healthcare",
  "Education",
  "Hospitality",
  "Retail",
  "Logistics",
  "Textiles",
  "Agro & Foods",
  "Legal & Compliance",
  "Marketing",
  "Architecture",
  "Automotive",
  "Jewellery",
];
