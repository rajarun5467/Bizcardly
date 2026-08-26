import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import heroBg from '../assets/hero.png';
import {
  FaBars, FaTimes, FaQrcode, FaBox, FaConciergeBell, FaImages,
  FaVideo, FaUserCircle, FaArrowRight, FaCheck, FaChevronDown,
  FaTwitter, FaFacebook, FaInstagram, FaLinkedin, FaStar,
  FaChevronLeft, FaChevronRight,
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const CountUp = ({ target, suffix, decimals, visible, label }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const duration = 2000;
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(start + (target - start) * eased);
      if (progress < 1) requestAnimationFrame(animate);
      else setCount(target);
    };

    requestAnimationFrame(animate);
  }, [visible, target]);

  const display = decimals > 0 ? count.toFixed(decimals) : Math.floor(count).toLocaleString();

  return (
    <div className="text-center">
      <div className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
        {display}{suffix}
      </div>
      <div className="text-sm text-slate-500 mt-1">{label}</div>
    </div>
  );
};

const Home = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    { icon: FaUserCircle, title: 'Digital Business Card', desc: 'Create a stunning customizable profile that acts as your digital identity.' },
    { icon: FaBox, title: 'Products Showcase', desc: 'Display your products with images, prices, and descriptions.' },
    { icon: FaConciergeBell, title: 'Services Listing', desc: 'List your services so customers know exactly what you offer.' },
    { icon: FaImages, title: 'Photo Gallery', desc: 'Show your work through a beautiful image gallery.' },
    { icon: FaVideo, title: 'Video Embeds', desc: 'Add YouTube or video links to engage your audience.' },
    { icon: FaQrcode, title: 'QR Code Sharing', desc: 'Share your card instantly with a scannable QR code.' },
  ];

  const steps = [
    { num: '1', title: 'Sign Up & Create Profile', desc: 'Register for free and set up your business profile in minutes.' },
    { num: '2', title: 'Add Your Content', desc: 'Upload products, services, gallery images, and videos.' },
    { num: '3', title: 'Share Everywhere', desc: 'Get a unique URL and QR code to share your card anywhere.' },
  ];

  const stats = [
    { value: 5000, suffix: '+', label: 'Active Users' },
    { value: 12000, suffix: '+', label: 'Cards Created' },
    { value: 150, suffix: 'K+', label: 'Profile Views' },
    { value: 4.9, suffix: '/5', label: 'User Rating', decimals: 1 },
  ];

  const statsRef = useRef(null);
  const [statsVisible, setStatsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  const testimonials = [
    { name: 'Priya Sharma', role: 'Boutique Owner', text: 'BizCardly transformed how I share my business. The QR code feature is a game changer! Customers scan and instantly see my full catalog.', rating: 5 },
    { name: 'Rajesh Kumar', role: 'Freelance Photographer', text: 'I showcase my portfolio through the gallery feature. Clients love how professional it looks. Best decision I made for my business!', rating: 5 },
    { name: 'Anita Desai', role: 'Salon Owner', text: 'My services are clearly listed and customers can scan my QR code to see everything. Amazing platform, super easy to use!', rating: 5 },
    { name: 'Vikram Singh', role: 'Restaurant Owner', text: 'BizCardly helped me put my menu, photos, and contact info in one place. The QR code is printed on our tables. Brilliant!', rating: 5 },
    { name: 'Meera Reddy', role: 'Yoga Instructor', text: 'I share my class schedule, services, and demo videos all through my BizCardly card. It has simplified how I reach new students.', rating: 5 },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const slidesPerView = 3;
  const maxSlide = testimonials.length - slidesPerView;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev >= maxSlide ? 0 : prev + 1));
    }, 4000);
    return () => clearInterval(timer);
  }, [maxSlide]);

  const nextSlide = () => setCurrentSlide((prev) => (prev >= maxSlide ? 0 : prev + 1));
  const prevSlide = () => setCurrentSlide((prev) => (prev <= 0 ? maxSlide : prev - 1));

  const faqs = [
    { q: 'What is BizCardly?', a: 'BizCardly is a free digital business card platform that lets you create a professional online presence with products, services, gallery, videos, and QR code sharing.' },
    { q: 'Is BizCardly free to use?', a: 'Yes! BizCardly is completely free. You can create your digital business card, add products, services, gallery, and share via QR code at no cost.' },
    { q: 'Can I customize my business card?', a: 'Absolutely. You can add your logo, business name, description, contact details, social links, products, services, gallery images, and videos.' },
    { q: 'How do I share my business card?', a: 'Every card gets a unique URL and a QR code. You can share the link directly or print the QR code on physical materials.' },
    { q: 'Can I add products and services?', a: 'Yes, you can add unlimited products with images and prices, and list all your services with descriptions.' },
    { q: 'Is my data secure?', a: 'Your data is stored securely with encrypted authentication. Only you can edit your business card, and your public card is viewable by anyone with the link.' },
  ];

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
  ];

  const handleNavClick = (href) => {
    setMobileMenuOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCta = (path) => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate(path);
    }
  };

  const heroCopy = (
    <>
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium mb-6">
        <FaStar className="text-xs" /> Free Digital Business Card Platform
      </div>
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight tracking-tight">
        Create Your{' '}
        <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Digital Business Card</span>{' '}
        in Minutes
      </h1>
      <p className="mt-6 text-lg text-slate-600 max-w-xl mx-auto lg:mx-0">
        Build a professional online presence with products, services, gallery, videos, and a QR code. Share it anywhere, anytime.
      </p>
      <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
        <button onClick={() => handleCta('/register')} className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:from-indigo-700 hover:to-purple-700 transition shadow-lg shadow-indigo-200 text-base">
          Create Free Card <FaArrowRight />
        </button>
        <button onClick={() => navigate('/listing/salon/stylecraft-hair-studio')} className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white text-slate-700 font-semibold border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition text-base">
          View Demo
        </button>
      </div>
      <p className="mt-4 text-sm text-slate-400">No credit card required · Free forever</p>
    </>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-md py-3' : 'bg-white py-5'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg">
              <FaUserCircle className="text-lg text-white" />
            </div>
            <span className={`text-xl font-bold transition-colors ${scrolled ? 'text-slate-800' : 'text-slate-800'}`}>BizCardly</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button key={link.href} onClick={() => handleNavClick(link.href)} className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition">
                {link.label}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button onClick={() => handleCta('/login')} className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-lg border-2 border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 transition shadow-sm">
              Login
            </button>
            <button onClick={() => handleCta('/register')} className="text-sm font-semibold px-5 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 transition shadow-md">
              Get Started
            </button>
          </div>

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-slate-700">
            {mobileMenuOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 mt-3 px-4 py-4 space-y-3 shadow-lg">
            {navLinks.map((link) => (
              <button key={link.href} onClick={() => handleNavClick(link.href)} className="block w-full text-left text-sm font-medium text-slate-600 hover:text-indigo-600 transition py-2">
                {link.label}
              </button>
            ))}
            <div className="flex gap-3 pt-2 border-t border-slate-100">
              <button onClick={() => handleCta('/login')} className="flex-1 text-sm font-semibold py-2.5 rounded-lg border-2 border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 transition">Login</button>
              <button onClick={() => handleCta('/register')} className="flex-1 text-sm font-semibold py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white">Get Started</button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero - Mobile & Tablet */}
      <section className="lg:hidden relative overflow-hidden bg-gradient-to-br from-slate-50 via-indigo-50/50 to-purple-50/30 pt-28 pb-16 md:pt-32 md:pb-20">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-200/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">{heroCopy}</div>
          {/* Tablet-only image, shown in full below the text */}
          <div className="hidden md:flex justify-center mt-10">
            <img src={heroBg} alt="BizCardly digital business card preview" className="w-full max-w-2xl h-auto" />
          </div>
        </div>
      </section>

      {/* Hero - Laptop/Desktop: image in normal flow guarantees full width + full image, no cropping */}
      <section className="hidden lg:block relative overflow-hidden">
        <img src={heroBg} alt="BizCardly digital business card preview" className="w-full h-auto block" />
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-8 w-full">
            <div className="max-w-xl text-left">{heroCopy}</div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section ref={statsRef} className="py-12 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <CountUp key={stat.label} target={stat.value} suffix={stat.suffix} decimals={stat.decimals || 0} visible={statsVisible} label={stat.label} />
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">Everything You Need to Stand Out</h2>
            <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">Powerful features to create a complete digital presence for your business.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="group bg-white rounded-2xl p-6 border border-slate-100 hover:shadow-xl hover:border-indigo-200 transition-all duration-300">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="text-xl text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">How It Works</h2>
            <p className="mt-4 text-lg text-slate-600">Get your digital business card ready in 3 simple steps.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-indigo-200 to-purple-200"></div>
            {steps.map((step) => (
              <div key={step.num} className="relative text-center">
                <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-3xl font-extrabold shadow-xl mb-5 relative z-10">
                  {step.num}
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-600 max-w-xs mx-auto">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-slate-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">Loved by Businesses</h2>
            <p className="mt-4 text-lg text-slate-600">See what our users have to say about BizCardly.</p>
          </div>

          {/* Slider */}
          <div className="relative">
            {/* Track */}
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${currentSlide * (100 / slidesPerView)}%)` }}
              >
                {testimonials.map((t) => (
                  <div key={t.name} className="flex-shrink-0 w-full md:w-1/3 px-3">
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm h-full">
                      <div className="flex gap-1 mb-4">
                        {[...Array(t.rating)].map((_, i) => (
                          <FaStar key={i} className="text-amber-400 text-sm" />
                        ))}
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed mb-5">"{t.text}"</p>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-sm">
                          {t.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{t.name}</p>
                          <p className="text-xs text-slate-500">{t.role}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Arrows */}
            <button
              onClick={prevSlide}
              className="hidden md:flex absolute top-1/2 -left-5 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg border border-slate-200 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition"
            >
              <FaChevronLeft />
            </button>
            <button
              onClick={nextSlide}
              className="hidden md:flex absolute top-1/2 -right-5 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg border border-slate-200 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition"
            >
              <FaChevronRight />
            </button>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: maxSlide + 1 }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`h-2 rounded-full transition-all ${currentSlide === i ? 'w-8 bg-indigo-600' : 'w-2 bg-slate-300 hover:bg-slate-400'}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">Simple, Transparent Pricing</h2>
            <p className="mt-4 text-lg text-slate-600">Start free. Upgrade when you need more.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl p-8 border-2 border-slate-100 shadow-sm">
              <h3 className="text-xl font-bold text-slate-800">Free</h3>
              <p className="text-sm text-slate-500 mt-1">Perfect for getting started</p>
              <div className="mt-6">
                <span className="text-4xl font-extrabold text-slate-900">Rs. 0</span>
                <span className="text-slate-500">/forever</span>
              </div>
              <ul className="mt-6 space-y-3">
                {['Digital business card', 'Products & Services', 'Photo gallery', 'Video embeds', 'QR code sharing', 'Contact & social links'].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-slate-700">
                    <FaCheck className="text-green-500 flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <button onClick={() => handleCta('/register')} className="w-full mt-8 py-3 rounded-xl border-2 border-indigo-200 text-indigo-600 font-semibold hover:bg-indigo-50 transition">
                Get Started Free
              </button>
            </div>

            <div className="relative bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-2xl md:scale-105">
              <div className="absolute top-4 right-4 px-3 py-1 bg-white/20 backdrop-blur rounded-full text-xs font-medium">Popular</div>
              <h3 className="text-xl font-bold">Pro</h3>
              <p className="text-sm text-indigo-100 mt-1">For growing businesses</p>
              <div className="mt-6">
                <span className="text-4xl font-extrabold">Rs. 299</span>
                <span className="text-indigo-200">/month</span>
              </div>
              <ul className="mt-6 space-y-3">
                {['Everything in Free', 'Custom card templates', 'Remove BizCardly branding', 'Priority support', 'Advanced analytics', 'Unlimited everything'].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm">
                    <FaCheck className="text-green-300 flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <button onClick={() => handleCta('/register')} className="w-full mt-8 py-3 rounded-xl bg-white text-indigo-600 font-semibold hover:bg-indigo-50 transition">
                Upgrade to Pro
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">Frequently Asked Questions</h2>
            <p className="mt-4 text-lg text-slate-600">Everything you need to know about BizCardly.</p>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left"
                >
                  <span className="text-sm font-semibold text-slate-800">{faq.q}</span>
                  <FaChevronDown className={`text-slate-400 transition-transform flex-shrink-0 ml-4 ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4 text-sm text-slate-600 leading-relaxed">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-indigo-600 to-purple-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white">Ready to Create Your Digital Business Card?</h2>
          <p className="mt-4 text-lg text-indigo-100">Join thousands of businesses using BizCardly to grow their online presence.</p>
          <button onClick={() => handleCta('/register')} className="mt-8 inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-indigo-600 font-bold text-lg hover:bg-indigo-50 transition shadow-xl">
            Get Started Free <FaArrowRight />
          </button>
          <p className="mt-4 text-sm text-indigo-200">No credit card required · Setup in 2 minutes</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
                  <FaUserCircle className="text-lg text-white" />
                </div>
                <span className="text-xl font-bold text-white">BizCardly</span>
              </div>
              <p className="text-sm leading-relaxed">Create your free digital business card and share it with a unique QR code and URL.</p>
              <div className="flex gap-3 mt-5">
                {[FaTwitter, FaFacebook, FaInstagram, FaLinkedin].map((Icon, i) => (
                  <a key={i} href="#" className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 hover:bg-indigo-600 transition text-slate-400 hover:text-white">
                    <Icon className="text-sm" />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => handleNavClick('#features')} className="hover:text-indigo-400 transition">Features</button></li>
                <li><button onClick={() => handleNavClick('#pricing')} className="hover:text-indigo-400 transition">Pricing</button></li>
                <li><button onClick={() => handleNavClick('#faq')} className="hover:text-indigo-400 transition">FAQ</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-indigo-400 transition">About</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition">Blog</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">Get Started</h4>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => handleCta('/login')} className="hover:text-indigo-400 transition">Login</button></li>
                <li><button onClick={() => handleCta('/register')} className="hover:text-indigo-400 transition">Create Free Card</button></li>
                <li><Link to="/superadmin/login" className="hover:text-indigo-400 transition">Admin Portal</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm">© 2026 BizCardly. All rights reserved.</p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="hover:text-indigo-400 transition">Privacy Policy</a>
              <a href="#" className="hover:text-indigo-400 transition">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
