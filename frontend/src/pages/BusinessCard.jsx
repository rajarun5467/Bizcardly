import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../api/config';
import { getImageUrl } from '../utils/imageUrl';
import Particles from '../components/Particles';
import Cursor from '../components/Cursor';
import { useScrollReveal } from '../hooks/useScrollReveal';
import logoNgo from '../assets/logo_ngo.jpeg';
import {
  FaPhone, FaEnvelope, FaGlobe, FaMapMarkerAlt, FaWhatsapp,
  FaHome, FaAddressCard, FaStar, FaHeadset, FaShare, FaDownload,
  FaPaperPlane, FaStore, FaCalendarAlt, FaTags, FaCheckCircle,
  FaBox, FaConciergeBell, FaImages, FaVideo, FaUserLock,
  FaFacebook, FaInstagram, FaTwitter, FaLinkedin, FaCommentDots,
  FaEye, FaRupeeSign, FaTimes,
} from 'react-icons/fa';
import '../styles/businessCard.css';

const assetUrl = (path, context = 'eCard') => {
  if (!path) return '';
  if (/^https?:\/\//i.test(path) || path.startsWith('data:') || path.startsWith('blob:')) {
    return path;
  }
  return getImageUrl(path, context);
};

const paymentQrUrl = (business) => {
  if (business.paymentQrCode) return assetUrl(business.paymentQrCode, 'paymentQR');
  if (business.paymentSettings?.qrCode) return assetUrl(business.paymentSettings.qrCode, 'paymentQR');
  if (business.platformSettings?.paymentQrCode) return assetUrl(business.platformSettings.paymentQrCode, 'platformQR');
  return '';
};

const BusinessCard = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('dark');
  const [activeSection, setActiveSection] = useState('home');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewForm, setReviewForm] = useState({ name: '', email: '', review: '' });
  const [enquiryForm, setEnquiryForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [submittingEnquiry, setSubmittingEnquiry] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const sectionsRef = useRef({});
  const [revealRefs, setRevealRefs] = useState({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('ecard-wow-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
    );

    document.querySelectorAll('.ecard-wow').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [business]);

  const showToast = useCallback((title, message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  const dismissToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ecard-theme') || 'dark';
      setTheme(saved);
    } catch (e) {}
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    try { localStorage.setItem('ecard-theme', newTheme); } catch (e) {}
  };

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/business/slug/${slug}`);
        const data = await res.json();
        if (data.success && data.business) {
          setBusiness({
            ...data.business,
            products: data.products || [],
            services: data.services || [],
            gallery: data.gallery || [],
            videos: data.videos || [],
          });
        } else {
          showToast('Not Found', 'Business card not found.', 'error');
        }
      } catch (err) {
        console.error('Fetch business error:', err);
        showToast('Error', 'Failed to load business card.', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchBusiness();
    } else {
      setLoading(false);
    }
  }, [slug, showToast]);

  useEffect(() => {
    if (slug) {
      fetch(`${API_BASE_URL}/visitors/${slug}`, { method: 'POST' })
        .then(() => {
          setBusiness(prev => prev ? { ...prev, views: (prev.views || 0) + 1 } : prev);
        })
        .catch(() => {});
    }
  }, [slug]);

  const scrollToSection = (sectionId) => {
    const el = sectionsRef.current[sectionId];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(sectionId);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + window.innerHeight / 3;
    const sectionIds = ['home', 'about', 'services', 'feedback', 'enquiry'];
      for (const id of sectionIds) {
        const el = sectionsRef.current[id];
        if (el) {
          const top = el.offsetTop;
          const bottom = top + el.offsetHeight;
          if (scrollPos >= top && scrollPos < bottom) {
            setActiveSection(id);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [business]);

  const handleCall = () => {
    if (business?.phone) window.location.href = `tel:${business.phone}`;
  };

  const handleEmail = () => {
    if (business?.email) window.location.href = `mailto:${business.email}`;
  };

  const handleWhatsapp = () => {
    const num = business?.whatsapp || business?.socialLinks?.whatsapp || business?.phone;
    if (num) window.open(`https://wa.me/${num.replace(/[^0-9]/g, '')}`, '_blank');
  };

  const handleMaps = () => {
    const addr = business?.address || business?.location?.mapUrl;
    if (business?.location?.mapUrl) {
      window.open(business.location.mapUrl, '_blank');
    } else if (addr) {
      window.open(`https://maps.google.com?q=${encodeURIComponent(addr)}`, '_blank');
    }
  };

  const handleWebsite = () => {
    const url = business?.website || business?.socialLinks?.website;
    if (url) window.open(url.startsWith('http') ? url : `https://${url}`, '_blank');
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: business?.name || 'Business Card', url: shareUrl });
      } catch (e) {}
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        showToast('Link Copied', 'Card link copied to clipboard!', 'success');
      } catch (e) {
        showToast('Share', 'Please copy the link from the address bar.', 'warning');
      }
    }
  };

  const handleWhatsappShare = () => {
    const num = whatsappNumber.replace(/[^0-9]/g, '');
    if (!num) {
      showToast('Missing Number', 'Please enter a WhatsApp number.', 'warning');
      return;
    }
    const url = window.location.href;
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(url)}`, '_blank');
  };

  const handleReviewSubmit = async (e) => {
    e?.preventDefault();
    if (!reviewForm.name.trim() || !rating || !reviewForm.review.trim()) {
      showToast('Validation Failed', 'Please complete all fields and select a rating.', 'warning');
      return;
    }
    setSubmittingReview(true);
    try {
      if (business?._id) {
        await fetch(`${API_BASE_URL}/reviews/${business._id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: reviewForm.name,
            email: reviewForm.email,
            rating,
            review: reviewForm.review,
          }),
        }).catch(() => {});
      }
      showToast('Review Posted', 'Thank you! Your review has been submitted.', 'success');
      setReviewForm({ name: '', email: '', review: '' });
      setRating(0);
    } catch (err) {
      showToast('Review Posted', 'Thank you! Your review has been submitted.', 'success');
      setReviewForm({ name: '', email: '', review: '' });
      setRating(0);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleEnquirySubmit = async (e) => {
    e?.preventDefault();
    if (!enquiryForm.name.trim() || !enquiryForm.phone.trim()) {
      showToast('Missing Info', 'Name and Phone are required.', 'warning');
      return;
    }
    setSubmittingEnquiry(true);
    try {
      if (business?._id) {
        await fetch(`${API_BASE_URL}/business/${business._id}/enquiry`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(enquiryForm),
        }).catch(() => {});
      }
      showToast('Enquiry Sent', 'Your details have been submitted. We will contact you soon.', 'success');
      setEnquiryForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      showToast('Enquiry Sent', 'Your details have been submitted. We will contact you soon.', 'success');
      setEnquiryForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } finally {
      setSubmittingEnquiry(false);
    }
  };

  const socialLinks = [];
  if (business?.socialLinks?.facebook) socialLinks.push({ key: 'facebook', url: business.socialLinks.facebook, icon: FaFacebook });
  if (business?.socialLinks?.instagram) socialLinks.push({ key: 'instagram', url: business.socialLinks.instagram, icon: FaInstagram });
  if (business?.socialLinks?.twitter) socialLinks.push({ key: 'twitter', url: business.socialLinks.twitter, icon: FaTwitter });
  if (business?.socialLinks?.linkedin) socialLinks.push({ key: 'linkedin', url: business.socialLinks.linkedin, icon: FaLinkedin });

  const businessTitle = business?.name || business?.businessName || 'Your Business';
  const businessTagline = business?.tagline || '';
  const aboutText = business?.description || business?.about || '';
  const ownerName = business?.ownerName || business?.userId?.name || '';
  const phoneNumbers = business?.phone ? [business.phone, business?.phone2, business?.phone3].filter(Boolean) : [];
  const qr = business ? paymentQrUrl(business) : '';

  const navItems = [
    { id: 'home', label: 'Home', icon: FaHome },
    { id: 'about', label: 'About', icon: FaAddressCard },
    ...(business?.services?.length > 0 ? [{ id: 'services', label: 'Services', icon: FaConciergeBell }] : []),
    { id: 'feedback', label: 'Reviews', icon: FaStar },
    { id: 'enquiry', label: 'Enquiry', icon: FaHeadset },
  ];

  if (loading) {
    return (
      <div className="ecard-root" data-theme="dark" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--black-color)', fontSize: '18px', fontFamily: 'Quicksand, sans-serif' }}>Loading card...</div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="ecard-root" data-theme="dark" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--black-color)', fontSize: '18px', fontFamily: 'Quicksand, sans-serif' }}>Business card not found.</div>
      </div>
    );
  }

  return (
    <div className="ecard-root" data-theme={theme}>
      <Particles theme={theme} />
      <Cursor theme={theme} />

      {/* Toast Container */}
      <div className="ecard-toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`ecard-toast ${t.type} show`}>
            <div className="ecard-toast-header">
              <span className="ecard-toast-title">{t.title}</span>
              <button className="ecard-toast-close" onClick={() => dismissToast(t.id)}><FaTimes /></button>
            </div>
            <div className="ecard-toast-body">{t.message}</div>
          </div>
        ))}
      </div>

      <main>
        {/* Bottom Navigation */}
        <header>
          <nav className="ecard-sidebar-menu">
            <ul className="ecard-menu">
              {navItems.map(item => {
                const Icon = item.icon;
                return (
                  <li key={item.id} className={activeSection === item.id ? 'active' : ''} onClick={() => scrollToSection(item.id)}>
                    <a>
                      <Icon />
                      <span>{item.label}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        </header>

        {/* Theme Toggle */}
        <aside className="ecard-theme-changer">
          <input
            type="checkbox"
            id="ecard-theme-color"
            className="ecard-theme-toggle-input"
            checked={theme === 'light'}
            onChange={toggleTheme}
          />
          <label className="ecard-switch" htmlFor="ecard-theme-color" />
        </aside>

        <article className="ecard-container-custom">
          {/* Views Counter */}
          <div className="ecard-views">
            <FaEye />
            <span>Views: {business.views || 0}</span>
          </div>

          {/* ===== HOME SECTION ===== */}
          <section
            id="ecard-home"
            ref={el => sectionsRef.current['home'] = el}
            className="ecard-box ecard-box-dark ecard-wow"
          >
            <div>
              <div className="ecard-profile">
                {business.profileImage || business.logo ? (
                  <img
                    src={assetUrl(business.profileImage || business.logo)}
                    alt={businessTitle}
                    className="ecard-profile-img"
                  />
                ) : (
                  <div className="ecard-profile-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', fontWeight: 700, color: 'var(--accent-color)' }}>
                    {businessTitle.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <h2 className="ecard-business-name">{businessTitle}</h2>
              {businessTagline && (
                <h3 className="ecard-owner-name">{businessTagline}</h3>
              )}
              {business?.description && (
                <div className="ecard-person-type">
                  <div
                    className="ecard-ticker-track"
                    style={{ animationDuration: `${Math.min(60, Math.max(20, (business.description || '').length * 0.05))}s` }}
                  >
                    <span className="ecard-ticker-text">{business.description}</span>
                    <span className="ecard-ticker-text" aria-hidden="true">{business.description}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="ecard-divider" />

            {/* Contact Action Buttons */}
            <div className="ecard-contact-info">
              {business.phone && (
                <button className="ecard-myBtn" onClick={handleCall}>Call <FaHeadset /></button>
              )}
              {business.email && (
                <button className="ecard-myBtn" onClick={handleEmail}>Email <FaEnvelope /></button>
              )}
              {(business.website || business.socialLinks?.website) && (
                <button className="ecard-myBtn" onClick={handleWebsite}>Website <FaGlobe /></button>
              )}
            </div>

            <div className="ecard-container-custom-1" style={{ marginTop: '20px' }}>
              {/* Contact Details List */}
              <ul className="ecard-contact-detail">
                {phoneNumbers.length > 0 && (
                  <li>
                    {phoneNumbers.map((num, i) => (
                      <a key={i} href={`tel:${num}`} style={{ display: 'inline-flex', marginRight: i < phoneNumbers.length - 1 ? '15px' : '0' }}>
                        <span className="ecard-contact-icon"><FaPhone /></span>
                        {num}
                      </a>
                    ))}
                  </li>
                )}
                {business.email && (
                  <li>
                    <a href={`mailto:${business.email}`} target="_blank" rel="noopener noreferrer">
                      <span className="ecard-contact-icon"><FaEnvelope /></span>
                      {business.email}
                    </a>
                  </li>
                )}
                {(business.whatsapp || business.socialLinks?.whatsapp || business.phone) && (
                  <li>
                    <a
                      href={`https://wa.me/${(business.whatsapp || business.socialLinks?.whatsapp || business.phone).replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span className="ecard-contact-icon"><FaWhatsapp /></span>
                      {business.whatsapp || business.socialLinks?.whatsapp || business.phone}
                    </a>
                  </li>
                )}
                {(business.address || business.location?.address) && (
                  <li>
                    <a
                      href={business.location?.mapUrl || `https://maps.google.com?q=${encodeURIComponent(business.address || business.location?.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span className="ecard-contact-icon"><FaMapMarkerAlt /></span>
                      {business.address || business.location?.address}
                    </a>
                  </li>
                )}
              </ul>

              <div className="ecard-divider" />

              {/* Share on WhatsApp */}
              <div className="ecard-share-whatsapp">
                <input
                  maxLength={12}
                  placeholder="Enter Number with country code"
                  type="tel"
                  pattern="[0-9]*"
                  inputMode="numeric"
                  value={whatsappNumber}
                  onChange={e => setWhatsappNumber(e.target.value)}
                />
                <button onClick={handleWhatsappShare}>Share on WhatsApp</button>
              </div>

              {/* Save & Share Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button className="ecard-myBtn-1" onClick={handleShare}>
                  <FaDownload /> Save to Contacts
                </button>
                <button className="ecard-myBtn-1" onClick={handleShare}>
                  <FaShare /> Share
                </button>
              </div>

              <div className="ecard-divider" />

              {/* Social Links */}
              {socialLinks.length > 0 && (
                <div className="ecard-social-share">
                  {socialLinks.map(s => {
                    const Icon = s.icon;
                    return (
                      <a key={s.key} href={s.url} target="_blank" rel="noopener noreferrer">
                        <Icon />
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* ===== ABOUT SECTION ===== */}
          <section
            id="ecard-about"
            ref={el => sectionsRef.current['about'] = el}
            className="ecard-box ecard-box-dark ecard-about ecard-wow"
          >
            <h2 className="ecard-heading">About us <span>Know More</span></h2>
            <div className="ecard-divider" style={{ marginBottom: '30px' }} />

            <div className="ecard-about-info-row">
              <div className="ecard-about-info-item">
                <FaStore />
                <div className="ecard-info-content">
                  <span className="ecard-label">Business Name</span>
                  <span className="ecard-value">{businessTitle}</span>
                </div>
              </div>
              {business.establishedYear && (
                <div className="ecard-about-info-item">
                  <FaCalendarAlt />
                  <div className="ecard-info-content">
                    <span className="ecard-label">Established</span>
                    <span className="ecard-value">{business.establishedYear}</span>
                  </div>
                </div>
              )}
              {business.businessType && (
                <div className="ecard-about-info-item">
                  <FaTags />
                  <div className="ecard-info-content">
                    <span className="ecard-label">Nature</span>
                    <span className="ecard-value">{business.businessType}</span>
                  </div>
                </div>
              )}
            </div>

            {aboutText && <p className="ecard-about-intro">{aboutText}</p>}

            {/* Services as checklist */}
            {business.services?.length > 0 && (
              <>
                <h4 className="ecard-about-subheading">Our Services</h4>
                <ul className="ecard-about-checklist">
                  {business.services.slice(0, 6).map(service => (
                    <li key={service._id}>
                      <FaCheckCircle />
                      <span>
                        <strong>{service.name}</strong>
                        {service.price && ` - Rs. ${service.price}`}
                        {service.description && `: ${service.description}`}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>

          {/* ===== SERVICES SECTION (full list) ===== */}
          {business.services?.length > 6 && (
            <section
              id="ecard-services"
              ref={el => sectionsRef.current['services'] = el}
              className="ecard-box ecard-box-dark ecard-wow"
            >
              <h2 className="ecard-heading">Services <span>What We Do</span></h2>
              <div className="ecard-divider" style={{ marginBottom: '30px' }} />
              <div className="ecard-products-grid">
                {business.services.map(service => (
                  <div key={service._id} className="ecard-product-card">
                    <div className="ecard-product-icon"><FaConciergeBell /></div>
                    <h6>{service.name}</h6>
                    {service.price && (
                      <p className="ecard-product-price">
                        <FaRupeeSign style={{ fontSize: '12px' }} />{service.price}
                      </p>
                    )}
                    {service.description && <p>{service.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ===== PAYMENT QR SECTION ===== */}
          {qr && (
            <section className="ecard-box ecard-box-dark ecard-wow">
              <h2 className="ecard-heading">Payment <span>Scan & Pay</span></h2>
              <div className="ecard-divider" style={{ marginBottom: '30px' }} />
              <div className="ecard-payment-section">
                <img src={qr} alt="Payment QR" className="ecard-payment-qr" />
                <h5>Scan to Pay</h5>
                {business.upiId && <p className="ecard-payment-upi">{business.upiId}</p>}
              </div>
            </section>
          )}

          {/* ===== FEEDBACK / REVIEWS SECTION ===== */}
          <section
            id="ecard-feedback"
            ref={el => sectionsRef.current['feedback'] = el}
            className="ecard-box ecard-box-dark ecard-wow"
          >
            <h2 className="ecard-heading">Reviews <span>Feedback</span></h2>
            <div className="ecard-divider" style={{ marginBottom: '30px' }} />

            <div className="ecard-feedback-card">
              <h4 className="ecard-feedback-title">
                <FaCommentDots /> Share Your Experience
              </h4>

              <div className="ecard-feedback-field">
                <label>Your Rating</label>
                <div className="ecard-fiverating">
                  {[1, 2, 3, 4, 5].map(n => (
                    <FaStar
                      key={n}
                      className={(hoverRating || rating) >= n ? 'ecard-checked' : ''}
                      style={{ color: (hoverRating || rating) >= n ? 'orange' : 'var(--secondary-text)' }}
                      onClick={() => setRating(n)}
                      onMouseEnter={() => setHoverRating(n)}
                      onMouseLeave={() => setHoverRating(0)}
                    />
                  ))}
                </div>
              </div>

              <div className="ecard-feedback-field">
                <label htmlFor="ecard-review-name">Name</label>
                <input
                  id="ecard-review-name"
                  type="text"
                  className="ecard-txt"
                  placeholder="Your Name"
                  value={reviewForm.name}
                  onChange={e => setReviewForm({ ...reviewForm, name: e.target.value })}
                />
              </div>

              <div className="ecard-feedback-field">
                <label htmlFor="ecard-review-email">Email</label>
                <input
                  id="ecard-review-email"
                  type="email"
                  className="ecard-txt"
                  placeholder="Your Email"
                  value={reviewForm.email}
                  onChange={e => setReviewForm({ ...reviewForm, email: e.target.value })}
                />
              </div>

              <div className="ecard-feedback-field">
                <label htmlFor="ecard-review-text">Write a Review</label>
                <textarea
                  id="ecard-review-text"
                  className="ecard-txt"
                  placeholder="Tell us about your experience..."
                  value={reviewForm.review}
                  onChange={e => setReviewForm({ ...reviewForm, review: e.target.value })}
                />
              </div>

              <button
                className="ecard-btn-submit"
                onClick={handleReviewSubmit}
                disabled={submittingReview}
              >
                <FaPaperPlane /> {submittingReview ? 'Submitting...' : 'Publish Review'}
              </button>
            </div>
          </section>

          {/* ===== ENQUIRY SECTION ===== */}
          <section
            id="ecard-enquiry"
            ref={el => sectionsRef.current['enquiry'] = el}
            className="ecard-box ecard-box-dark ecard-wow"
          >
            <h2 className="ecard-heading">Enquiry <span>Contact</span></h2>
            <div className="ecard-divider" style={{ marginBottom: '30px' }} />

            <form onSubmit={handleEnquirySubmit}>
              <div className="ecard-form-row">
                <input
                  required
                  type="text"
                  className="ecard-txt"
                  placeholder="Enter Your Full Name"
                  value={enquiryForm.name}
                  onChange={e => setEnquiryForm({ ...enquiryForm, name: e.target.value })}
                />
                <input
                  required
                  type="email"
                  className="ecard-txt"
                  placeholder="Enter Your Email"
                  value={enquiryForm.email}
                  onChange={e => setEnquiryForm({ ...enquiryForm, email: e.target.value })}
                />
              </div>
              <div className="ecard-form-row">
                <input
                  required
                  type="text"
                  className="ecard-txt"
                  placeholder="Enter Your Phone"
                  pattern="[0-9]*"
                  inputMode="numeric"
                  value={enquiryForm.phone}
                  onChange={e => setEnquiryForm({ ...enquiryForm, phone: e.target.value })}
                />
                <input
                  type="text"
                  className="ecard-txt"
                  placeholder="Enter Your Subject"
                  value={enquiryForm.subject}
                  onChange={e => setEnquiryForm({ ...enquiryForm, subject: e.target.value })}
                />
              </div>
              <textarea
                required
                className="ecard-txt"
                placeholder="Enter Your Message"
                value={enquiryForm.message}
                onChange={e => setEnquiryForm({ ...enquiryForm, message: e.target.value })}
              />
              <button
                type="submit"
                className="ecard-btn-submit"
                disabled={submittingEnquiry}
              >
                {submittingEnquiry ? 'Sending...' : 'Send Your Enquiry'}
              </button>
            </form>
          </section>

          {/* Admin Login */}
          <div className="ecard-admin-login">
            <button onClick={() => navigate('/login')}>
              <img src={logoNgo} alt="Logo" className="ecard-admin-logo" style={{ width: '60px', height: '60px', marginRight: '10px' }} />
              <FaUserLock /> Admin Login
            </button>
          </div>
        </article>
      </main>

      {/* Footer */}
      <footer className="ecard-footer">
        <p>
          &copy;{new Date().getFullYear()} {businessTitle}<br />
          Powered By <a href="https://bizcardly.vercel.app" target="_blank" rel="noopener noreferrer">BizCardly</a>
        </p>
      </footer>
    </div>
  );
};

export default BusinessCard;
