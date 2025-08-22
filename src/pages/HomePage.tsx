import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Building2,
  Mail,
  Phone,
  CheckCircle2,
  MapPin,
  Shield,
  Star,
  Menu,
  X,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

// Brand palette per spec
const BRAND = {
  primary: "#0A2647", // Navy
  light: "#F5F6FA",
  accent: "#F5B700", // Gold
  accentAlt: "#00A896", // Teal
};

function Stars({ value = 5 }: { value?: number }) {
  return (
    <div className="flex items-center" aria-label={`${value} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < value ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
        />
      ))}
    </div>
  );
}

function CookieBanner() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const stored = localStorage.getItem("vo_uk_cookie_consent");
    if (!stored) setOpen(true);
  }, []);
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-50 m-4 rounded-2xl border bg-white/95 p-4 shadow-2xl backdrop-blur"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-slate-700">
          We use cookies to improve your experience and comply with GDPR. See our {" "}
          <a href="#" className="underline font-medium">Privacy Policy</a>.
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" className="rounded-xl border" onClick={() => setOpen(false)}>Only necessary</Button>
          <Button className="rounded-xl bg-[#F5B700] text-[#0A2647] hover:bg-[#e5aa00]" onClick={() => {localStorage.setItem("vo_uk_cookie_consent", JSON.stringify({ acceptedAt: new Date().toISOString() })); setOpen(false);}}>Accept all</Button>
        </div>
      </div>
    </div>
  );
}

function Header() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const nav = [
    { label: "Home", href: "#home" },
    { label: "Services", href: "#services" },
    { label: "Pricing", href: "#pricing" },
    { label: "Locations", href: "#locations" },
    { label: "About Us", href: "#about" },
    { label: "Contact", href: "#contact" },
  ];

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) setOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <nav aria-label="Primary" className="relative mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <a href="#home" className="flex items-center gap-2" aria-label="Virtual Office UK home">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: BRAND.primary }}>
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900">Virtual Office UK</span>
        </a>
        <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 gap-8 lg:flex">
          {nav.map((n) => (
            <a key={n.href} href={n.href} className="text-sm font-medium text-slate-700 hover:text-[#0A2647] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B700] focus-visible:ring-offset-2 rounded">
              {n.label}
            </a>
          ))}
        </div>
        <div className="hidden lg:block">
          <Button onClick={() => navigate("/login")} className="rounded-xl bg-[#F5B700] text-[#0A2647] hover:bg-[#e5aa00]">Get Started</Button>
        </div>
        <button
          className="inline-flex items-center justify-center rounded-xl border p-2 text-slate-700 hover:bg-slate-50 lg:hidden"
          aria-label="Open menu"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>
      {open && (
        <div id="mobile-nav" className="border-t bg-white lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3 sm:px-6">
            {nav.map((n) => (
              <a key={n.href} href={n.href} className="rounded-lg px-3 py-2 text-base font-medium text-slate-800 hover:bg-slate-50" onClick={() => setOpen(false)}>
                {n.label}
              </a>
            ))}
            <Button onClick={() => navigate("/login")} className="mt-2 w-full rounded-xl bg-[#F5B700] text-[#0A2647] hover:bg-[#e5aa00]">Get Started</Button>
          </div>
        </div>
      )}
    </header>
  );
}

function Hero() {
  const navigate = useNavigate();
  return (
    <section id="home" aria-labelledby="hero-heading" className="relative isolate">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2 focus:shadow-lg">Skip to content</a>
      <div className="absolute inset-0 -z-10">
        <img
          src="https://images.unsplash.com/photo-1505764706515-aa95265c5abc?q=80&w=1920&auto=format&fit=crop"
          alt="London skyline"
          className="h-full w-full object-cover"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/10" />
      </div>
      <div className="mx-auto flex max-w-7xl flex-col items-center px-4 pb-16 pt-28 text-center text-white sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="max-w-3xl">
          <Badge className="mb-4 rounded-full bg-white/90 text-[#0A2647] hover:bg-white">UK-Ready • GDPR Compliant</Badge>
          <h1 id="hero-heading" className="text-4xl font-extrabold tracking-tight drop-shadow-md sm:text-5xl">
            Establish Your <span className="text-[#F5B700]">Virtual Office</span> in the UK
          </h1>
          <p className="mt-4 text-lg text-slate-100 drop-shadow">
            A premium London business address, mail handling, and phone answering — all in minutes. Trusted by startups and global teams.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button onClick={() => navigate("/login")} className="h-11 rounded-xl bg-[#F5B700] px-6 text-[#0A2647] hover:bg-[#e5aa00]" aria-label="Get started with Virtual Office UK">Get Started</Button>
            <Button variant="outline" className="h-11 rounded-xl border-white bg-white/10 px-6 text-white hover:bg-white/20" aria-label="Book a free consultation">Book Free Consultation</Button>
          </div>
          <div className="mt-6 flex items-center justify-center gap-3 text-sm text-slate-200">
            <Shield className="h-4 w-4" />
            <span>Registered address • HMRC-ready • Same-day setup</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function WhyChooseUs() {
  const items = [
    {
      icon: <MapPin className="h-6 w-6 text-[#00A896]" />,
      title: "Legal UK Address",
      desc: "Use a central London address for Companies House, HMRC, and client-facing materials.",
    },
    {
      icon: <Shield className="h-6 w-6 text-[#00A896]" />,
      title: "Transparent Pricing",
      desc: "Simple monthly plans. No setup fees, no surprises, cancel anytime.",
    },
    {
      icon: <Clock className="h-6 w-6 text-[#00A896]" />,
      title: "Fast Setup",
      desc: "Get operational in minutes with instant address and same-day verification.",
    },
  ];

  return (
    <section aria-labelledby="why-heading" className="bg-[#F5F6FA] py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 id="why-heading" className="text-2xl font-bold text-slate-900 sm:text-3xl">Why Choose Us</h2>
        <p className="mt-2 max-w-2xl text-slate-600">Designed for founders, remote teams, and international businesses entering the UK market.</p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <Card key={it.title} className="rounded-2xl border-0 bg-white shadow-sm ring-1 ring-slate-100">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50">{it.icon}</div>
                  <CardTitle className="text-lg">{it.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">{it.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function Services() {
  const services = [
    {
      icon: <Building2 className="h-6 w-6 text-[#0A2647]" />,
      title: "Virtual Office",
      desc: "Prestigious business address with mail forwarding and document scanning.",
      features: ["Companies House compliant", "Mail forwarding", "Digital scans"],
    },
    {
      icon: <Mail className="h-6 w-6 text-[#0A2647]" />,
      title: "Mail Handling",
      desc: "Secure mail reception, same-day notifications, and flexible forwarding options.",
      features: ["Same-day alerts", "Open & scan on request", "Worldwide forwarding"],
    },
    {
      icon: <Phone className="h-6 w-6 text-[#0A2647]" />,
      title: "Phone Answering",
      desc: "UK phone number with professional receptionists and call routing.",
      features: ["Dedicated number", "Custom greeting", "Voicemail to email"],
    },
  ];

  return (
    <section id="services" aria-labelledby="services-heading" className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 id="services-heading" className="text-2xl font-bold text-slate-900 sm:text-3xl">Our Services</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <Card key={s.title} className="group rounded-2xl border-0 shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:shadow-md">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0A2647]/10">{s.icon}</div>
                  <CardTitle className="text-lg">{s.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">{s.desc}</p>
                <ul className="mt-4 space-y-2">
                  {s.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-700">
                      <CheckCircle2 className="h-4 w-4 text-[#00A896]" /> {f}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const navigate = useNavigate();
  const plans = [
    {
      name: "Starter",
      price: "£15",
      period: "/mo",
      tagline: "For solo founders",
      popular: false,
      features: ["London business address", "Mail notifications", "Pick-up on site"],
    },
    {
      name: "Business",
      price: "£29",
      period: "/mo",
      tagline: "Best for SMEs",
      popular: true,
      features: ["Address + mail forwarding", "Open & scan on request", "UK phone number (add-on)"],
    },
    {
      name: "Premium",
      price: "£49",
      period: "/mo",
      tagline: "Scale with support",
      popular: false,
      features: ["Priority forwarding", "Dedicated receptionist", "Meeting room credits"],
    },
  ];

  return (
    <section id="pricing" aria-labelledby="pricing-heading" className="bg-[#F5F6FA] py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 id="pricing-heading" className="text-2xl font-bold text-slate-900 sm:text-3xl">Pricing Plans</h2>
        <p className="mt-2 max-w-2xl text-slate-600">Simple monthly pricing. Upgrade or cancel anytime.</p>
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {plans.map((p) => (
            <Card key={p.name} className={`rounded-2xl border-0 shadow-sm ring-1 ring-slate-100 ${p.popular ? "relative bg-white" : "bg-white"}`}>
              {p.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="rounded-full bg-[#F5B700] text-[#0A2647]">Most Popular</Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-xl">{p.name}</CardTitle>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-slate-900">{p.price}</span>
                  <span className="text-slate-500">{p.period}</span>
                </div>
                <p className="text-sm text-slate-600">{p.tagline}</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-700">
                      <CheckCircle2 className="h-4 w-4 text-[#00A896]" /> {f}
                    </li>
                  ))}
                </ul>
                <Button onClick={() => navigate("/login")} className="mt-6 w-full rounded-xl bg-[#0A2647] text-white hover:bg-[#0b305f]" aria-label={`Choose ${p.name} plan`}>
                  Choose {p.name}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function SocialProof() {
  const testimonials = [
    { quote: "Smooth onboarding and reliable mail handling. Exactly what our UK entity needed.", name: "Amelia W.", role: "COO, FintechX" },
    { quote: "Fast setup, friendly team, and a great address in central London.", name: "Raj P.", role: "Founder, Qubo Labs" },
    { quote: "Professional phone answering that our clients love.", name: "Sarah K.", role: "Director, BrightLegal" },
  ];
  const partners = useMemo(() => [
    { name: "Stripe", src: "https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" },
    { name: "Xero", src: "https://upload.wikimedia.org/wikipedia/en/9/9f/Xero_software_logo.svg" },
    { name: "AWS", src: "https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg" },
    { name: "HubSpot", src: "https://upload.wikimedia.org/wikipedia/commons/3/3f/HubSpot_Logo.svg" },
  ], []);

  return (
    <section aria-labelledby="social-proof-heading" className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 id="social-proof-heading" className="text-2xl font-bold text-slate-900 sm:text-3xl">Trusted by growing teams</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {testimonials.map((t, idx) => (
            <Card key={idx} className="rounded-2xl border-0 bg-white shadow-sm ring-1 ring-slate-100">
              <CardContent className="p-6">
                <Stars value={5} />
                <p className="mt-3 text-slate-700">“{t.quote}”</p>
                <p className="mt-4 text-sm font-medium text-slate-900">{t.name}</p>
                <p className="text-xs text-slate-500">{t.role}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-12 grid grid-cols-2 items-center justify-items-center gap-6 sm:grid-cols-4">
          {partners.map((p) => (
            <img key={p.name} src={p.src} alt={`${p.name} logo`} className="h-10 w-auto opacity-70 saturate-0 hover:opacity-100 hover:saturate-100 transition" loading="lazy" decoding="async" />
          ))}
        </div>
      </div>
    </section>
  );
}

function Locations() {
  const locations = [
    { city: "London", address: "Level 39, One Canada Square, Canary Wharf, London E14 5AB", img: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?q=80&w=1200&auto=format&fit=crop" },
    { city: "Manchester", address: "No.1 Spinningfields, Quay St, Manchester M3 3JE", img: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=1200&auto=format&fit=crop" },
  ];
  return (
    <section id="locations" aria-labelledby="locations-heading" className="bg-[#F5F6FA] py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 id="locations-heading" className="text-2xl font-bold text-slate-900 sm:text-3xl">UK Locations</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {locations.map((l) => (
            <Card key={l.city} className="overflow-hidden rounded-2xl border-0 shadow-sm ring-1 ring-slate-100">
              <div className="grid md:grid-cols-2">
                <img src={l.img} alt={`${l.city} office building`} className="h-56 w-full object-cover md:h-full" loading="lazy" decoding="async" />
                <div className="p-6">
                  <div className="flex items-center gap-2 text-[#0A2647]">
                    <MapPin className="h-5 w-5" />
                    <h3 className="text-lg font-semibold">{l.city}</h3>
                  </div>
                  <p className="mt-2 text-slate-600">{l.address}</p>
                  <div className="mt-4 flex gap-2">
                    <Badge className="rounded-full bg-[#0A2647] text-white">Business Address</Badge>
                    <Badge variant="outline" className="rounded-full">Mail Handling</Badge>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const faqs = [
    { q: "Is the address accepted by Companies House and HMRC?", a: "Yes. Our addresses are fully compliant for company registration and tax correspondence." },
    { q: "How quickly can I start?", a: "You can sign up online and get an address instantly. Verification (KYC) is same-day in most cases." },
    { q: "Can I cancel anytime?", a: "Absolutely. Our plans are month-to-month with no long-term contracts." },
    { q: "Do you offer phone answering?", a: "Yes, as an add-on or included in the Premium plan with dedicated receptionists." },
  ];
  return (
    <section aria-labelledby="faq-heading" className="py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h2 id="faq-heading" className="text-2xl font-bold text-slate-900 sm:text-3xl">FAQ</h2>
        <Accordion type="single" collapsible className="mt-6">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left text-base">{f.q}</AccordionTrigger>
              <AccordionContent className="text-slate-600">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

function ContactForm() {
  return (
    <section id="contact" aria-labelledby="contact-heading" className="bg-[#0A2647] py-16 text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <h2 id="contact-heading" className="text-2xl font-bold sm:text-3xl">Ready to get started?</h2>
          <p className="mt-2 text-slate-200">Short form — name, email, and your needs. We’ll reply within 1 business day.</p>
          <ul className="mt-4 space-y-2 text-slate-200">
            <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#F5B700]" /> GDPR compliant</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#F5B700]" /> UK-based support</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#F5B700]" /> Same-day setup</li>
          </ul>
        </div>
        <form className="rounded-2xl bg-white/10 p-6 shadow-lg backdrop-blur" aria-label="Quick signup form">
          <div className="grid gap-4">
            <div>
              <label htmlFor="name" className="mb-1 block text-sm">Full Name</label>
              <Input id="name" name="name" placeholder="Jane Doe" className="rounded-xl bg-white text-slate-900" required aria-required="true" />
            </div>
            <div>
              <label htmlFor="email" className="mb-1 block text-sm">Work Email</label>
              <Input id="email" type="email" name="email" placeholder="you@company.com" className="rounded-xl bg-white text-slate-900" required aria-required="true" />
            </div>
            <div>
              <label htmlFor="needs" className="mb-1 block text-sm">What do you need?</label>
              <Textarea id="needs" name="needs" placeholder="Virtual office + mail forwarding" className="min-h-[96px] rounded-xl bg-white text-slate-900" />
            </div>
            <Button type="submit" className="h-11 rounded-xl bg-[#F5B700] text-[#0A2647] hover:bg-[#e5aa00]">Submit</Button>
            <p className="text-xs text-slate-200">By submitting, you agree to our <a href="#" className="underline">Terms</a> and <a href="#" className="underline">Privacy Policy</a>.</p>
          </div>
        </form>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t bg-white py-12" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">Footer</h2>
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 md:grid-cols-4 lg:px-8">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: BRAND.primary }}>
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold">Virtual Office UK</span>
          </div>
          <p className="mt-3 text-sm text-slate-600">Premium UK virtual office solutions for modern businesses.</p>
          <div className="mt-4 flex gap-3 text-slate-500">
            <a href="#" aria-label="Twitter" className="hover:text-[#0A2647]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19.633 7.997c.013.176.013.353.013.53 0 5.402-4.112 11.636-11.636 11.636-2.313 0-4.46-.676-6.266-1.84.321.038.63.051.964.051a8.224 8.224 0 0 0 5.1-1.754 4.11 4.11 0 0 1-3.836-2.846c.25.038.5.064.764.064.366 0 .732-.051 1.074-.14A4.104 4.104 0 0 1 2.8 9.948v-.051c.54.302 1.168.49 1.834.515A4.098 4.098 0 0 1 2.8 7.1c0-.764.203-1.47.558-2.083a11.667 11.667 0 0 0 8.47 4.297 4.626 4.626 0 0 1-.102-.94A4.105 4.105 0 0 1 15.83 4.27a8.066 8.066 0 0 0 2.604-.99 4.123 4.123 0 0 1-1.806 2.27 8.226 8.226 0 0 0 2.367-.64 8.834 8.834 0 0 1-2.362 2.087z"/></svg>
            </a>
            <a href="#" aria-label="LinkedIn" className="hover:text-[#0A2647]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM0 8.98h5V24H0V8.98zM8.98 8.98h4.78v2.05h.07c.67-1.26 2.32-2.6 4.78-2.6 5.11 0 6.05 3.36 6.05 7.72V24h-5v-6.73c0-1.6-.03-3.66-2.23-3.66-2.23 0-2.57 1.74-2.57 3.54V24h-5V8.98z"/></svg>
            </a>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Company</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li><a href="#about" className="hover:text-[#0A2647]">About Us</a></li>
            <li><a href="#" className="hover:text-[#0A2647]">Careers</a></li>
            <li><a href="#" className="hover:text-[#0A2647]">Press</a></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Legal</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li><a href="#" className="hover:text-[#0A2647]">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-[#0A2647]">Terms of Service</a></li>
            <li><a href="#" className="hover:text-[#0A2647]">Cookie Policy</a></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Registered Office</h3>
          <address className="mt-3 not-italic text-sm text-slate-600">
            Level 39, One Canada Square<br />
            Canary Wharf, London E14 5AB<br />
            Company No. 12345678
          </address>
        </div>
      </div>
      <div className="mx-auto mt-8 max-w-7xl px-4 text-xs text-slate-500 sm:px-6 lg:px-8">© {new Date().getFullYear()} Virtual Office UK. All rights reserved.</div>
    </footer>
  );
}

export default function HomePage() {
  return (
    <main id="main" className="font-sans text-[16px] leading-relaxed text-slate-900">
      <Header />
      <Hero />
      <WhyChooseUs />
      <Services />
      <Pricing />
      <SocialProof />
      <Locations />
      <FAQ />
      <ContactForm />
      <Footer />
      <CookieBanner />
    </main>
  );
}
