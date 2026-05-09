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
  Lightbulb,
  Eye,
  Workflow,
  Check,
  ChevronRight,
  ArrowUpRight
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "../context/AuthContext";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

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
    <div className="min-h-screen bg-white dark:bg-gradient-to-b dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-white overflow-hidden">
      {/* Animated Background Gradient */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-white dark:from-slate-950 dark:via-indigo-950/20 dark:to-slate-950" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-200 dark:bg-indigo-900/30 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-violet-200 dark:bg-violet-900/30 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
      </div>

      {/* Premium Navbar */}
      <header
        className={`sticky top-0 z-50 transition-all duration-500 backdrop-blur-xl ${
          scrolled
            ? "bg-white/70 dark:bg-slate-950/80 border-b border-slate-200/50 dark:border-slate-800/50 shadow-lg"
            : "bg-white/30 dark:bg-transparent border-b border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-violet-400">
                ResuOne
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              <button
                onClick={() => scrollToSection("features")}
                className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium relative group"
              >
                Features
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-600 to-violet-600 group-hover:w-full transition-all duration-300" />
              </button>
              <button
                onClick={() => scrollToSection("how-it-works")}
                className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium relative group"
              >
                How it Works
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-600 to-violet-600 group-hover:w-full transition-all duration-300" />
              </button>
              <button
                onClick={() => scrollToSection("testimonials")}
                className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium relative group"
              >
                Testimonials
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-600 to-violet-600 group-hover:w-full transition-all duration-300" />
              </button>
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <button
                onClick={handleCreateResume}
                className="hidden sm:flex px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group items-center gap-2"
              >
                {user ? "Dashboard" : "Get Started"}
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>

              {/* Mobile Menu Button */}
              <button
                className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-slate-200/50 dark:border-slate-800/50 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => scrollToSection("features")}
                  className="text-left px-4 py-2.5 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors font-medium"
                >
                  Features
                </button>
                <button
                  onClick={() => scrollToSection("how-it-works")}
                  className="text-left px-4 py-2.5 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors font-medium"
                >
                  How it Works
                </button>
                <button
                  onClick={() => scrollToSection("testimonials")}
                  className="text-left px-4 py-2.5 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors font-medium"
                >
                  Testimonials
                </button>
                <button
                  onClick={handleCreateResume}
                  className="w-full px-4 py-2.5 mt-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                >
                  {user ? "Dashboard" : "Get Started"}
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-28 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            {/* ATS Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-100 to-violet-100 dark:from-indigo-950/40 dark:to-violet-950/40 border border-indigo-200/50 dark:border-indigo-800/50 mb-8 animate-pulse">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm font-semibold text-indigo-900 dark:text-indigo-300">AI-Powered ATS Optimization</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tighter mb-8 leading-none">
              <span className="bg-gradient-to-r from-slate-900 via-indigo-600 to-violet-600 dark:from-white dark:via-indigo-300 dark:to-violet-300 bg-clip-text text-transparent animate-pulse">
                Build Your ATS-Ready
              </span>
              <br />
              <span className="bg-gradient-to-r from-violet-600 to-purple-600 dark:from-violet-300 dark:to-purple-300 bg-clip-text text-transparent">
                Resume Instantly
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-xl sm:text-2xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed font-light">
              Create a professional resume that passes ATS screening and impresses recruiters. 
              Built with smart formatting, real-time feedback, and expert suggestions.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button
                onClick={handleCreateResume}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 text-white font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 group text-lg"
              >
                {user ? "Open Dashboard" : "Create Your Resume"}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => scrollToSection("features")}
                className="px-8 py-4 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300 flex items-center justify-center gap-2 text-lg"
              >
                See Features
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-8 text-sm sm:text-base">
              {[
                { icon: CheckCircle, text: "ATS Optimized", color: "text-green-500" },
                { icon: Shield, text: "Secure & Private", color: "text-blue-500" },
                { icon: Zap, text: "Instant Feedback", color: "text-yellow-500" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                  <span className="font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl sm:text-6xl font-black tracking-tight mb-6 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
              Everything to Build Your Perfect Resume
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-light">
              Powerful features designed for ATS success and recruiter engagement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: "ATS Optimization",
                description: "Perfectly formatted resumes that pass applicant tracking systems with clean semantic structure.",
                color: "from-blue-600 to-cyan-600"
              },
              {
                icon: Eye,
                title: "Live Preview",
                description: "See your resume update in real-time as you type. Instant visual feedback on formatting.",
                color: "from-indigo-600 to-blue-600"
              },
              {
                icon: Sparkles,
                title: "AI Suggestions",
                description: "Smart recommendations to improve wording, highlight achievements, and optimize keywords.",
                color: "from-violet-600 to-indigo-600"
              },
              {
                icon: Download,
                title: "Multiple Formats",
                description: "Export as PDF or DOCX with all formatting preserved. Download and apply instantly.",
                color: "from-purple-600 to-violet-600"
              },
              {
                icon: Lightbulb,
                title: "Smart Validation",
                description: "Real-time ATS scoring and suggestions to help you craft the perfect resume.",
                color: "from-orange-500 to-red-500"
              },
              {
                icon: Workflow,
                title: "Resume Standardization",
                description: "Consistent formatting across all sections ensures no recruiter misses your qualifications.",
                color: "from-pink-600 to-rose-600"
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                {/* Gradient Border */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{
                  backgroundImage: `linear-gradient(135deg, ${feature.color} 0%, transparent 50%)`
                }} />
                <div className="absolute inset-0.5 rounded-2xl bg-white dark:bg-slate-900/50 pointer-events-none" />
                
                {/* Content */}
                <div className="relative z-10">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative py-32 bg-gradient-to-b from-transparent via-indigo-50/50 dark:via-indigo-950/20 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl sm:text-6xl font-black tracking-tight mb-6 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
              Get Started in 4 Steps
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-light">
              Build your professional resume in minutes with our streamlined process.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {/* Animated Gradient Line */}
            <div className="hidden lg:block absolute top-24 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 via-violet-500 to-purple-500 rounded-full opacity-50" />

            {[
              { step: "1", title: "Sign In", icon: User, description: "Create your free account or log in securely", color: "from-blue-600 to-cyan-600" },
              { step: "2", title: "Fill Information", icon: FileText, description: "Enter your experience, skills, and achievements", color: "from-indigo-600 to-blue-600" },
              { step: "3", title: "Live Preview", icon: Eye, description: "See your resume formatted in real-time", color: "from-violet-600 to-indigo-600" },
              { step: "4", title: "Download PDF", icon: Download, description: "Export and start applying instantly", color: "from-purple-600 to-violet-600" }
            ].map((item, index) => (
              <div key={index} className="relative group">
                {/* Card */}
                <div className="text-center relative z-10">
                  <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-300`}>
                    <item.icon className="w-10 h-10 text-white" />
                  </div>
                  <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mb-2">Step {item.step}</div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{item.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Connecting Arrow */}
                {index < 3 && (
                  <div className="hidden lg:block absolute top-20 -right-6 w-12 h-1 bg-gradient-to-r from-slate-300 dark:from-slate-700 to-transparent opacity-50" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="relative py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl sm:text-6xl font-black tracking-tight mb-6 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
              Loved by GNDEC Students
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-light">
              Join students from Guru Nanak Dev Engineering College who got placements and internships.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Harpreet Singh",
                role: "B.Tech CSE, GNDEC",
                quote: "ResuOne helped me structure my resume perfectly for ATS screening. Got selected in campus placement on first attempt!",
                avatar: "HS",
                color: "from-blue-500 to-cyan-500"
              },
              {
                name: "Jasleen Kaur",
                role: "MCA, GNDEC",
                quote: "The real-time ATS feedback was game-changing. My resume passed screening for multiple companies in 2024 placement drive.",
                avatar: "JK",
                color: "from-indigo-500 to-blue-500"
              },
              {
                name: "Gurkirat Singh",
                role: "BCA, GNDEC",
                quote: "Landed my internship at a startup thanks to the smart formatting and keyword optimization suggestions.",
                avatar: "GS",
                color: "from-violet-500 to-indigo-500"
              },
              {
                name: "Priya Sharma",
                role: "B.Tech IT, GNDEC",
                quote: "Best resume builder I've used. The AI suggestions helped me highlight my achievements in a recruiter-friendly way.",
                avatar: "PS",
                color: "from-purple-500 to-violet-500"
              },
              {
                name: "Rajveer Patel",
                role: "B.Tech ECE, GNDEC",
                quote: "Got 3 interview calls within a week using my ResuOne resume. The ATS optimization really works!",
                avatar: "RP",
                color: "from-pink-500 to-rose-500"
              },
              {
                name: "Amandeep Kaur",
                role: "B.Tech CSE, GNDEC",
                quote: "ResuOne's templates are modern and professional. Helped me stand out in a competitive recruitment process.",
                avatar: "AK",
                color: "from-orange-500 to-red-500"
              }
            ].map((testimonial, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                {/* Star Rating */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-slate-700 dark:text-slate-200 mb-6 italic leading-relaxed text-base">
                  "{testimonial.quote}"
                </p>

                {/* User Info */}
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${testimonial.color} flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">{testimonial.name}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="relative py-32 bg-gradient-to-b from-transparent via-indigo-50/50 dark:via-indigo-950/20 to-transparent">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl sm:text-6xl font-black tracking-tight mb-6 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 font-light">
              Everything you need to know about ResuOne.
            </p>
          </div>

          <div className="space-y-3">
            <Accordion type="single" collapsible className="w-full">
              {[
                {
                  question: "Is ResuOne really free to use?",
                  answer: "Yes! ResuOne is completely free forever. You can create unlimited resumes, access all features, and export in multiple formats without paying anything."
                },
                {
                  question: "Are the resumes guaranteed to pass ATS screening?",
                  answer: "Our templates use proven ATS-friendly formatting with clean structure, proper semantic HTML, and optimal keyword placement. While no tool guarantees 100% success, our resumes are specifically designed to maximize ATS compatibility."
                },
                {
                  question: "Can I download my resume in different formats?",
                  answer: "Absolutely! You can export your resume as PDF or DOCX. All formatting, colors, and styling are perfectly preserved in both formats."
                },
                {
                  question: "How many resumes can I save?",
                  answer: "With a free account, you can save multiple resumes. You can create tailored versions for different job applications and keep them all organized in your dashboard."
                },
                {
                  question: "Does ResuOne help with content improvements?",
                  answer: "Yes! Our AI suggestions help you improve wording, highlight achievements, identify keywords, and optimize your resume content for better recruiter engagement."
                },
                {
                  question: "Is my data secure and private?",
                  answer: "Your resume data is encrypted and stored securely. We never share your information with third parties. You have full control over your data."
                }
              ].map((item, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="border-0 overflow-hidden"
                >
                  <div className="rounded-xl bg-white dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 shadow-sm hover:shadow-md transition-shadow duration-300 mb-1">
                    <AccordionTrigger className="px-6 py-4 text-left font-semibold text-slate-900 dark:text-white hover:no-underline hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-300">
                      <div className="flex items-center gap-3 w-full">
                        <span className="text-indigo-600 dark:text-indigo-400 font-bold">+</span>
                        {item.question}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-4 pt-0 text-slate-600 dark:text-slate-300 leading-relaxed">
                      {item.answer}
                    </AccordionContent>
                  </div>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-slate-200/50 dark:border-slate-800/50 bg-gradient-to-b from-white dark:from-slate-950 to-slate-50 dark:to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Brand Section */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 flex items-center justify-center shadow-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-black bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
                  ResuOne
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Build professional, ATS-optimized resumes that help you land your dream job.
              </p>
              {/* Social Links */}
              <div className="flex items-center gap-4 mt-6">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-indigo-100 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-300"
                >
                  <Github className="w-5 h-5" />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-indigo-100 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-300"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
                <a
                  href="mailto:support@resumone.com"
                  className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-indigo-100 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-300"
                >
                  <Mail className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Product Links */}
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-4 text-sm uppercase tracking-wider">Product</h3>
              <ul className="space-y-3">
                {[
                  { label: "Features", action: () => scrollToSection("features") },
                  { label: "How it Works", action: () => scrollToSection("how-it-works") },
                  { label: "Testimonials", action: () => scrollToSection("testimonials") }
                ].map((item, i) => (
                  <li key={i}>
                    <button
                      onClick={item.action}
                      className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-300 text-sm font-medium"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources Links */}
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-4 text-sm uppercase tracking-wider">Resources</h3>
              <ul className="space-y-3">
                {[
                  { label: "Build Resume", href: "/resume" },
                  { label: "Dashboard", href: "/dashboard" },
                  { label: "FAQ", action: () => scrollToSection("faq") }
                ].map((item, i) => (
                  <li key={i}>
                    {item.href ? (
                      <Link
                        to={item.href}
                        className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-300 text-sm font-medium"
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <button
                        onClick={item.action}
                        className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-300 text-sm font-medium"
                      >
                        {item.label}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-4 text-sm uppercase tracking-wider">Company</h3>
              <ul className="space-y-3">
                {[
                  "About Us",
                  "Contact",
                  "Privacy Policy",
                  "Terms of Service"
                ].map((item, i) => (
                  <li key={i}>
                    <button className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-300 text-sm font-medium">
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-200/50 dark:border-slate-800/50 pt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                © {new Date().getFullYear()} ResuOne. Built for dreamers and doers.
              </p>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Designed with ❤️ for GNDEC students
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
