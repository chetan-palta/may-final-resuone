import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import {
  FileText,
  ArrowRight,
  CheckCircle,
  User,
  Menu,
  X,
  Sparkles,
  Download,
  Layout,
  Shield,
  Zap,
  Star,
  Github,
  Linkedin,
  Mail,
  BadgeCheck,
  CircleDashed,
  FileBarChart,
  Clock3
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "../context/AuthContext";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

const featureCards = [
  {
    icon: Shield,
    title: "ATS-optimized formatting",
    description: "Structure your resume with clean hierarchy, calm spacing, and parser-friendly layout rules."
  },
  {
    icon: Layout,
    title: "Live resume preview",
    description: "Watch the final layout update in real time while you refine content and structure."
  },
  {
    icon: Sparkles,
    title: "Real-time editing",
    description: "Make changes once and keep the resume preview, validator, and export flow in sync."
  },
  {
    icon: Download,
    title: "One-click PDF export",
    description: "Produce a polished PDF without fighting spacing, borders, or broken typography."
  },
  {
    icon: Zap,
    title: "Smart validation",
    description: "Spot weak structure and missing details before your resume reaches a recruiter."
  },
  {
    icon: FileText,
    title: "Resume standardization",
    description: "Keep one premium resume version that works across placements, internships, and applications."
  }
];

const workflow = [
  {
    icon: User,
    title: "Sign in",
    description: "Open your workspace and keep your resume saved in one place."
  },
  {
    icon: FileText,
    title: "Fill information",
    description: "Add your details, achievements, projects, and experience in a calm, guided flow."
  },
  {
    icon: Layout,
    title: "Live resume preview",
    description: "See how the resume reads before you export it or share it."
  },
  {
    icon: Download,
    title: "Download as PDF",
    description: "Export a clean final resume ready for campus placements and recruiter screening."
  }
];

const testimonials = [
  {
    name: "Harpreet Singh",
    role: "B.Tech CSE, GNDEC",
    quote: "ResuOne helped me standardize my resume before placements. The ATS score and live preview made the whole edit cycle much cleaner.",
    avatar: "HS"
  },
  {
    name: "Jasleen Kaur",
    role: "MCA, GNDEC",
    quote: "I used it for internship applications and the exported PDF stayed polished every time. The interface feels premium and focused.",
    avatar: "JK"
  },
  {
    name: "Gurkirat Singh",
    role: "BCA, GNDEC",
    quote: "It made one strong resume version easy to maintain across multiple drives. The layout feels built for real recruiter screening.",
    avatar: "GS"
  }
];

const faqItems = [
  {
    question: "Is ResuOne built for one resume only?",
    answer: "Yes. It is designed around a single polished resume so your content stays consistent and easy to maintain."
  },
  {
    question: "Is the resume ATS-friendly?",
    answer: "Yes. The layout uses clean hierarchy, readable typography, and a structure that is easy for applicant tracking systems to process."
  },
  {
    question: "Can I download the resume as PDF?",
    answer: "Yes. You can export a final PDF with stable spacing, clean formatting, and preserved links."
  },
  {
    question: "Do I need an account to start?",
    answer: "You can begin quickly, and signing in lets you keep your resume saved for later updates."
  },
  {
    question: "Can I use it for placements and internships?",
    answer: "Absolutely. It is tuned for student resumes, campus placements, internships, and recruiter screening."
  }
];

export const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleCreateResume = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/auth");
    }
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setMobileMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute right-[-5rem] top-40 h-80 w-80 rounded-full bg-violet-500/15 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <header
        className={`sticky top-0 z-50 border-b border-white/10 transition-all duration-300 ${scrolled ? "bg-slate-950/72 shadow-[0_8px_40px_rgba(15,23,42,0.35)] backdrop-blur-xl" : "bg-slate-950/45 backdrop-blur-xl"}`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-18 items-center justify-between py-4">
            <Link to="/" className="flex items-center gap-3 rounded-2xl px-2 py-1 transition-all duration-300 hover:bg-white/5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-blue-500 shadow-[0_10px_30px_rgba(99,102,241,0.35)]">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="block text-lg font-semibold tracking-tight text-white">ResuOne</span>
                <span className="block text-xs text-slate-400">ATS resume standardization</span>
              </div>
            </Link>

            <nav className="hidden items-center gap-1 md:flex">
              {[["Features", "features"], ["Process", "how-it-works"], ["Stories", "testimonials"], ["FAQ", "faq"]].map(([label, target]) => (
                <button
                  key={label}
                  onClick={() => scrollToSection(target)}
                  className="rounded-full px-4 py-2 text-sm font-medium text-slate-300 transition-all duration-300 hover:bg-white/6 hover:text-white"
                >
                  {label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button
                onClick={handleCreateResume}
                className="hidden sm:inline-flex group rounded-full border border-white/10 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-950/20 hover:border-white/20 hover:bg-white/15 hover:shadow-[0_20px_45px_rgba(79,70,229,0.22)]"
              >
                {user ? "Dashboard" : "Start your resume"}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden pb-5 animate-fade-in-up">
              <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-4 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
                <div className="flex flex-col gap-2">
                  {[["Features", "features"], ["Process", "how-it-works"], ["Stories", "testimonials"], ["FAQ", "faq"]].map(([label, target]) => (
                    <button
                      key={label}
                      onClick={() => scrollToSection(target)}
                      className="rounded-2xl px-4 py-3 text-left text-sm font-medium text-slate-300 transition-all duration-300 hover:bg-white/6 hover:text-white"
                    >
                      {label}
                    </button>
                  ))}
                  <Button
                    onClick={handleCreateResume}
                    className="mt-2 inline-flex w-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-blue-500 px-5 py-3 font-semibold text-white shadow-[0_20px_50px_rgba(79,70,229,0.30)] hover:scale-[1.01]"
                  >
                    {user ? "Open dashboard" : "Start your resume"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden px-4 pb-16 pt-16 sm:px-6 lg:px-8 lg:pb-24 lg:pt-24">
          <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/15 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200 shadow-[0_0_0_1px_rgba(34,211,238,0.12)]">
                <CircleDashed className="h-4 w-4 animate-pulse" />
                ATS ready resume studio
              </div>
              <h1 className="mt-6 text-5xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl lg:leading-[0.95]">
                Build a resume that feels
                <span className="block bg-gradient-to-r from-cyan-300 via-sky-300 to-violet-300 bg-clip-text text-transparent">
                  polished, modern, and recruiter-ready.
                </span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300 sm:text-xl">
                Create your ATS-ready resume with a premium editor, live preview, and clean export flow built for campus placements and job applications.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Button
                  onClick={handleCreateResume}
                  className="group inline-flex rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-blue-500 px-7 py-4 text-base font-semibold text-white shadow-[0_20px_60px_rgba(79,70,229,0.34)] hover:scale-[1.02] hover:shadow-[0_24px_70px_rgba(79,70,229,0.42)]"
                >
                  {user ? "Go to dashboard" : "Create your resume"}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
                <Button
                  onClick={() => scrollToSection("features")}
                  variant="outline"
                  className="rounded-full border border-white/10 bg-white/5 px-7 py-4 text-base font-semibold text-white backdrop-blur-md hover:border-white/20 hover:bg-white/10 hover:text-white"
                >
                  Explore features
                </Button>
              </div>

              <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate-300">
                {["ATS-safe structure", "Live preview", "Smooth PDF export"].map((item) => (
                  <div key={item} className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md">
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 -z-10 rounded-full bg-indigo-500/20 blur-3xl" />
              <div className="relative mx-auto max-w-xl rounded-[2rem] border border-white/10 bg-slate-900/70 p-5 shadow-[0_30px_80px_rgba(15,23,42,0.45)] backdrop-blur-2xl animate-float">
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">ATS snapshot</p>
                    <h3 className="mt-1 text-lg font-semibold text-white">Your resume at a glance</h3>
                  </div>
                  <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">Live</span>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_0.9fr]">
                  <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-slate-400">ATS score</p>
                        <p className="mt-2 text-5xl font-black tracking-tight text-white">94</p>
                      </div>
                      <BadgeCheck className="h-8 w-8 text-cyan-300" />
                    </div>
                    <div className="mt-4 space-y-3">
                      {[["Formatting", "92%"], ["Keywords", "89%"], ["Clarity", "96%"]].map(([label, value]) => (
                        <div key={label}>
                          <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
                            <span>{label}</span>
                            <span>{value}</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-white/8">
                            <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400" style={{ width: value }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-200">
                          <FileBarChart className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">Resume standardization</p>
                          <p className="text-sm text-slate-400">One clean version across every application.</p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-white/5 p-4 animate-float-delayed">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-200">
                          <Clock3 className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">Real-time edits</p>
                          <p className="text-sm text-slate-400">Update content and preview changes instantly.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-2xl text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-300 backdrop-blur-md">
                Premium features
              </div>
              <h2 className="mt-5 text-4xl font-black tracking-tight text-white sm:text-5xl">
                Everything you need to ship one strong resume
              </h2>
              <p className="mt-4 text-lg leading-8 text-slate-300">
                Each feature is tuned for an ATS-friendly, student-first workflow that feels modern and calm.
              </p>
            </div>

            <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {featureCards.map((feature, index) => (
                <div
                  key={feature.title}
                  className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.18)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-indigo-400/25 hover:bg-white/8 hover:shadow-[0_25px_70px_rgba(79,70,229,0.18)]"
                  style={{ animationDelay: `${index * 90}ms` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-indigo-500/0 to-violet-500/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="relative">
                    <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 via-violet-500/20 to-blue-500/20 text-indigo-200 ring-1 ring-white/10 transition-transform duration-300 group-hover:scale-105">
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-semibold tracking-tight text-white">{feature.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-300">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-2xl text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-300 backdrop-blur-md">
                Simple workflow
              </div>
              <h2 className="mt-5 text-4xl font-black tracking-tight text-white sm:text-5xl">
                Four steps, one polished resume
              </h2>
              <p className="mt-4 text-lg leading-8 text-slate-300">
                Build fast, refine calmly, and export with confidence.
              </p>
            </div>

            <div className="relative mt-14 grid gap-5 lg:grid-cols-4">
              <div className="absolute left-6 right-6 top-10 hidden h-px bg-gradient-to-r from-indigo-500 via-violet-500 to-blue-500 lg:block" />
              {workflow.map((item, index) => (
                <div key={item.title} className="group relative rounded-3xl border border-white/10 bg-slate-900/65 p-6 text-center shadow-[0_20px_50px_rgba(15,23,42,0.2)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_24px_70px_rgba(79,70,229,0.16)]">
                  <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-gradient-to-br from-indigo-500 via-violet-500 to-blue-500 shadow-[0_16px_40px_rgba(79,70,229,0.35)] transition-transform duration-300 group-hover:scale-105">
                    <item.icon className="h-9 w-9 text-white" />
                  </div>
                  <div className="mb-2 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                    Step {index + 1}
                  </div>
                  <h3 className="text-xl font-semibold tracking-tight text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="testimonials" className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-2xl text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-300 backdrop-blur-md">
                Student stories
              </div>
              <h2 className="mt-5 text-4xl font-black tracking-tight text-white sm:text-5xl">
                Trusted by students preparing for placements
              </h2>
              <p className="mt-4 text-lg leading-8 text-slate-300">
                Built for campus applications, internship screening, and cleaner recruiter review.
              </p>
            </div>

            <div className="mt-14 grid gap-5 md:grid-cols-3">
              {testimonials.map((testimonial) => (
                <div key={testimonial.name} className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.18)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-indigo-400/25 hover:shadow-[0_30px_80px_rgba(79,70,229,0.18)]">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="mt-5 text-sm leading-7 text-slate-300">“{testimonial.quote}”</p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-blue-500 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(79,70,229,0.30)]">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-white">{testimonial.name}</div>
                      <div className="text-sm text-slate-400">{testimonial.role}</div>
                    </div>
                  </div>
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="mx-auto max-w-2xl text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-300 backdrop-blur-md">
                FAQ
              </div>
              <h2 className="mt-5 text-4xl font-black tracking-tight text-white sm:text-5xl">
                Clean answers, no clutter
              </h2>
              <p className="mt-4 text-lg leading-8 text-slate-300">
                A premium accordion that stays smooth in dark mode and keeps the page visually calm.
              </p>
            </div>

            <div className="mt-12 space-y-4">
              <Accordion type="single" collapsible className="space-y-4">
                {faqItems.map((item, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/65 px-6 shadow-[0_18px_45px_rgba(15,23,42,0.2)] backdrop-blur-xl transition-all duration-300 hover:border-white/20">
                    <AccordionTrigger className="text-left text-base font-semibold text-white hover:no-underline">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm leading-7 text-slate-300">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative border-t border-white/10 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.18),_transparent_38%),linear-gradient(180deg,#020617_0%,#0f172a_100%)] px-4 py-16 text-slate-300 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[1.3fr_0.7fr_0.7fr]">
            <div>
              <Link to="/" className="inline-flex items-center gap-3 rounded-2xl px-2 py-1 transition-all duration-300 hover:bg-white/5">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-blue-500 shadow-[0_12px_30px_rgba(79,70,229,0.35)]">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div>
                  <span className="block text-xl font-semibold tracking-tight text-white">ResuOne</span>
                  <span className="block text-sm text-slate-400">Premium ATS resume platform</span>
                </div>
              </Link>
              <p className="mt-5 max-w-xl text-sm leading-7 text-slate-400">
                A focused resume standardization experience for students who want one elegant resume that works across placements, internships, and recruiter screening.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-200">Product</h3>
              <ul className="mt-5 space-y-3 text-sm text-slate-400">
                {[["Features", "features"], ["Workflow", "how-it-works"], ["FAQ", "faq"]].map(([label, target]) => (
                  <li key={label}>
                    <button onClick={() => scrollToSection(target)} className="group relative inline-flex items-center gap-2 transition-colors duration-300 hover:text-white">
                      <span>{label}</span>
                      <span className="h-px w-6 bg-white/25 transition-all duration-300 group-hover:w-10 group-hover:bg-white/80" />
                    </button>
                  </li>
                ))}
                <li>
                  <Link to="/resume" className="group inline-flex items-center gap-2 transition-colors duration-300 hover:text-white">
                    <span>Build resume</span>
                    <span className="h-px w-6 bg-white/25 transition-all duration-300 group-hover:w-10 group-hover:bg-white/80" />
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-200">Connect</h3>
              <div className="mt-5 flex items-center gap-3">
                {[
                  { href: "https://github.com/chetan-palta", icon: Github, label: "GitHub" },
                  { href: "https://www.linkedin.com/in/chetan-palta", icon: Linkedin, label: "LinkedIn" },
                  { href: "mailto:itzchetan0007@gmail.com", icon: Mail, label: "Email" }
                ].map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target={item.label === "Email" ? undefined : "_blank"}
                    rel={item.label === "Email" ? undefined : "noopener noreferrer"}
                    className="group flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-300 transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/10 hover:text-white hover:shadow-[0_18px_35px_rgba(79,70,229,0.18)]"
                  >
                    <item.icon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                  </a>
                ))}
              </div>
              <p className="mt-5 text-sm text-slate-400">
                © {new Date().getFullYear()} ResuOne. Built for polished placements.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
