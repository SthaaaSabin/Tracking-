'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useInView, AnimatePresence, useScroll, useTransform } from 'framer-motion'

// ═══════════════════════════════════════════════════════════════════════════════
//  META PIXEL — TRACKING HELPERS
// ═══════════════════════════════════════════════════════════════════════════════
//
//  How the whole system works:
//
//  [ Facebook / Instagram Post or Paid Ad ]
//        │
//        │  Visitor sees the post and clicks your website link
//        ▼
//  [ This Landing Page Loads ]
//        │
//        │  The pixel script in layout.tsx has already been downloaded.
//        │  fbq('init', 'YOUR_PIXEL_ID') connected this visitor to YOUR pixel.
//        ▼
//  [ Meta Pixel Tracks Website Activity ONLY ]
//        │  ┌─ PageView        ← fires on load (see useEffect below)
//        │  ├─ LearnMoreClick  ← fires when "Learn More" hero button clicked
//        │  ├─ SupportInterest ← fires when "I'm Interested" hero button clicked
//        │  └─ LeadSubmitted   ← fires when the interest form is submitted
//        │
//        └─ All this data flows back to Meta Ads Manager so you can:
//             • See which ad drove the most form submissions
//             • Build Custom Audiences from page visitors
//             • Create Lookalike Audiences of people similar to your leads
//
// ═══════════════════════════════════════════════════════════════════════════════

declare global {
  interface Window {
    fbq: (...args: unknown[]) => void
  }
}

/** Fire a standard Meta Pixel event (e.g. 'PageView', 'Lead') */
const pixelTrack = (event: string, params?: Record<string, unknown>) => {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq('track', event, params)
  }
}

/** Fire a custom Meta Pixel event (e.g. 'LearnMoreClick', 'SupportInterest') */
const pixelTrackCustom = (event: string, params?: Record<string, unknown>) => {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq('trackCustom', event, params)
  }
}

// ─── Animation Variants ──────────────────────────────────────────────────────

const ease = [0.16, 1, 0.3, 1] as const

const fadeUp = {
  hidden:  { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease } },
}

const fadeIn = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } },
}

const stagger = (delay = 0.12) => ({
  hidden:  { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: delay, delayChildren: 0.05 },
  },
})

// ─── Static Data ─────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { id: 'about',      label: 'About'     },
  { id: 'priorities', label: 'Priorities'},
  { id: 'vision',     label: 'Vision'    },
  { id: 'involved',   label: 'Get Involved'},
]

const PRIORITIES = [
  {
    number: '01',
    title:  'Healthcare for Every Family',
    body:   'No family should go without care because of cost. I will fight to expand community health centres, lower prescription prices, and protect coverage for pre-existing conditions.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
  {
    number: '02',
    title:  'Strong Neighbourhood Schools',
    body:   'Our children deserve well-funded classrooms, experienced teachers, and modern resources. I will defend public education and push back against cuts that hurt our kids.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
          d="M12 14l9-5-9-5-9 5 9 5zm0 0v6m-3-3h6" />
      </svg>
    ),
  },
  {
    number: '03',
    title:  'Economic Dignity & Security',
    body:   'Working people and retirees deserve a stable future. I will support local small businesses, push for fair wages, and protect the social safety nets families depend on.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
]

// ─── Section Wrapper with scroll-triggered entry ──────────────────────────────

function Section({
  id,
  children,
  className = '',
  ref: _ref,
}: {
  id: string
  children: React.ReactNode
  className?: string
  ref?: React.Ref<HTMLElement>
}) {
  const ref = useRef<HTMLElement>(null)
  return (
    <section id={id} ref={ref} className={className}>
      {children}
    </section>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function LandingPage() {

  // --- UI state ---
  const [scrolled,       setScrolled]       = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [formSubmitted,  setFormSubmitted]  = useState(false)
  const [isSubmitting,   setIsSubmitting]   = useState(false)
  const [formData, setFormData] = useState({
    name:    '',
    email:   '',
    phone:   '',
    consent: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // --- Scroll tracking for nav shadow ---
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // ─────────────────────────────────────────────────────────────────────────
  //  META PIXEL: PageView
  //  Fires once when the page first mounts.
  //  Tells Meta: "Someone landed on this page — start measuring."
  //  Use this to build retargeting audiences of all visitors.
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    pixelTrack('PageView')
  }, [])

  // --- Smooth scroll helper ---
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMobileMenuOpen(false)
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  META PIXEL: LearnMoreClick (Custom Event)
  //  Fires when the visitor clicks "Learn More" in the Hero section.
  //  Indicates curiosity / top-of-funnel engagement.
  //  Use this audience for nurturing retargeting campaigns.
  // ─────────────────────────────────────────────────────────────────────────
  const handleLearnMore = () => {
    scrollTo('about')
    pixelTrackCustom('LearnMoreClick', {
      content_name:     'Hero – Learn More CTA',
      content_category: 'engagement',
      location:         'hero',
    })
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  META PIXEL: SupportInterest (Custom Event)
  //  Fires when the visitor clicks "I'm Interested" in the Hero section.
  //  Indicates high intent — this person wants to get involved.
  //  Use this audience for volunteer / donor outreach campaigns.
  // ─────────────────────────────────────────────────────────────────────────
  const handleInterestedClick = () => {
    scrollTo('involved')
    pixelTrackCustom('SupportInterest', {
      content_name:     'Hero – I\'m Interested CTA',
      content_category: 'high_intent',
      location:         'hero',
    })
  }

  // --- Form validation ---
  const validate = () => {
    const e: Record<string, string> = {}
    if (!formData.name.trim())   e.name  = 'Please enter your full name.'
    if (!formData.email.trim())  e.email = 'Please enter your email address.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      e.email = 'Please enter a valid email address.'
    if (!formData.consent)
      e.consent = 'Please check the consent box to continue.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  META PIXEL: LeadSubmitted (Standard + Custom)
  //  Fires when the interest form is successfully submitted.
  //  This is the primary CONVERSION event for the campaign.
  //  Optimise your ads for this event to get more form completions.
  //
  //  We fire both:
  //   • 'Lead'          – standard Meta event (use in ad optimisation)
  //   • 'LeadSubmitted' – custom event (extra detail for reporting)
  // ─────────────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    // Simulated async submission — replace with your own API call
    await new Promise(r => setTimeout(r, 1200))

    pixelTrack('Lead', {
      content_name:  'Campaign Interest Form',
      content_category: 'lead_generation',
    })

    pixelTrackCustom('LeadSubmitted', {
      content_name:     'Campaign Interest Form',
      method:           'website_form',
      has_phone:        !!formData.phone.trim(),
      lead_source:      'landing_page',
    })

    setIsSubmitting(false)
    setFormSubmitted(true)
  }

  // --- Input field classes ---
  const inputBase =
    'w-full rounded-lg border bg-white px-4 py-3 text-[17px] text-stone-800 placeholder-stone-400 ' +
    'transition-all duration-200 focus:ring-2 focus:ring-navy-300/50 focus:border-navy-400 focus:outline-none'
  const inputNormal = `${inputBase} border-stone-200`
  const inputError  = `${inputBase} border-red-400 focus:ring-red-200/60 focus:border-red-400`

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-cream-50 overflow-x-hidden">

      {/* ═══════════════════════════════════════════════════════
          NAVIGATION
      ══════════════════════════════════════════════════════ */}
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease }}
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-cream-50/95 backdrop-blur-sm shadow-sm border-b border-stone-200/60'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          {/* Wordmark */}
          <button
            onClick={() => scrollTo('hero')}
            className="flex items-center gap-3 group"
            aria-label="Back to top"
          >
            <div className="w-9 h-9 rounded-full bg-navy-700 flex items-center justify-center shadow-md group-hover:bg-navy-600 transition-colors">
              <span className="text-cream-50 font-serif text-sm font-semibold tracking-wider">JH</span>
            </div>
            <div className="hidden sm:block">
              <p className="font-serif text-navy-800 text-[15px] leading-none font-semibold">James Hargrove</p>
              <p className="text-stone-500 text-[11px] mt-0.5 tracking-wide uppercase">State Senate · District 14</p>
            </div>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-7" aria-label="Primary navigation">
            {NAV_LINKS.map(link => (
              <button
                key={link.id}
                id={`nav-${link.id}`}
                onClick={() => scrollTo(link.id)}
                className="text-stone-600 hover:text-navy-700 text-[15px] font-medium transition-colors duration-200"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <motion.button
              id="nav-cta-involved"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleInterestedClick}
              className="hidden sm:inline-flex btn-shimmer items-center gap-2 bg-navy-700 hover:bg-navy-600 text-cream-50 text-[14px] font-medium px-5 py-2.5 rounded-lg shadow-md transition-colors"
            >
              I&apos;m Interested
            </motion.button>

            {/* Mobile hamburger */}
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-9 h-9 flex flex-col items-center justify-center gap-1.5"
              aria-label="Toggle menu"
            >
              <motion.span
                animate={mobileMenuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                className="block w-5 h-0.5 bg-stone-700 origin-center"
              />
              <motion.span
                animate={mobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                className="block w-5 h-0.5 bg-stone-700"
              />
              <motion.span
                animate={mobileMenuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
                className="block w-5 h-0.5 bg-stone-700 origin-center"
              />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden bg-cream-50/98 border-t border-stone-100 overflow-hidden"
            >
              <div className="px-6 py-5 flex flex-col gap-4">
                {NAV_LINKS.map(link => (
                  <button
                    key={link.id}
                    onClick={() => scrollTo(link.id)}
                    className="text-left text-stone-700 text-lg font-medium py-1"
                  >
                    {link.label}
                  </button>
                ))}
                <button
                  onClick={handleInterestedClick}
                  className="mt-2 bg-navy-700 text-cream-50 text-base font-medium px-5 py-3 rounded-lg text-center"
                >
                  I&apos;m Interested
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* ═══════════════════════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════════════════════ */}
      <section
        id="hero"
        className="relative min-h-screen flex items-center pt-20 overflow-hidden"
      >
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-800 to-navy-700" />
        {/* Subtle texture */}
        <div className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}
        />
        {/* Glowing orbs */}
        <motion.div
          className="absolute top-[15%] left-[10%] w-[500px] h-[500px] bg-navy-400/10 rounded-full blur-3xl pointer-events-none"
          animate={{ x: [0, 20, 0], y: [0, -15, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-[10%] right-[5%] w-[400px] h-[400px] bg-gold-400/8 rounded-full blur-3xl pointer-events-none"
          animate={{ x: [0, -20, 0], y: [0, 20, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 w-full py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Text */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger(0.14)}
            >
              {/* Badge */}
              <motion.div variants={fadeUp} className="mb-6">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-cream-200 text-sm font-medium backdrop-blur-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse" />
                  Candidate for State Senate · District 14
                </span>
              </motion.div>

              {/* Name */}
              <motion.h1
                variants={fadeUp}
                className="font-serif text-5xl md:text-6xl xl:text-7xl text-white leading-[1.07] mb-4"
              >
                James
                <br />
                <span className="italic text-cream-200">Hargrove</span>
              </motion.h1>

              {/* Slogan */}
              <motion.p
                variants={fadeUp}
                className="font-body text-gold-300 text-xl md:text-2xl italic mb-6 leading-relaxed"
              >
                &ldquo;A Neighbour. A Servant. A Leader.&rdquo;
              </motion.p>

              {/* Body copy */}
              <motion.p
                variants={fadeUp}
                className="text-cream-300 text-lg md:text-xl leading-relaxed mb-10 max-w-lg"
              >
                For thirty years James has walked these streets, listened at kitchen tables,
                and fought for the people who make this district home. Now he&apos;s asking
                for the honour of continuing that work in the State Senate.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4">
                {/* ── Meta Pixel: LearnMoreClick fires on this button ── */}
                <motion.button
                  id="hero-learn-more"
                  whileHover={{ scale: 1.03, boxShadow: '0 8px 32px rgba(255,255,255,0.15)' }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleLearnMore}
                  className="btn-shimmer flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-white text-navy-800 font-semibold text-base px-8 py-4 rounded-xl shadow-lg transition-all"
                >
                  Learn More
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </motion.button>

                {/* ── Meta Pixel: SupportInterest fires on this button ── */}
                <motion.button
                  id="hero-im-interested"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleInterestedClick}
                  className="btn-shimmer flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-transparent text-white font-semibold text-base px-8 py-4 rounded-xl border-2 border-white/30 hover:border-white/60 hover:bg-white/10 transition-all"
                >
                  I&apos;m Interested
                </motion.button>
              </motion.div>
            </motion.div>

            {/* Photo */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, delay: 0.3, ease }}
              className="flex justify-center lg:justify-end"
            >
              <div className="relative">
                {/* Photo frame */}
                <div className="relative w-72 h-[420px] md:w-80 md:h-[480px] rounded-2xl overflow-hidden shadow-card-lg border border-white/10">
                  {/* Placeholder — replace src with real photo */}
                  <div className="absolute inset-0 bg-gradient-to-br from-navy-600 to-navy-800 flex flex-col items-center justify-center gap-4">
                    <div className="w-28 h-28 rounded-full bg-navy-500/60 border-2 border-white/20 flex items-center justify-center">
                      <svg className="w-14 h-14 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <p className="text-white/50 text-sm text-center px-4">
                      Replace with<br/>candidate&rsquo;s photo
                    </p>
                  </div>
                  {/* To use a real photo, replace the placeholder above with:
                      <Image src="/candidate.jpg" alt="James Hargrove" fill className="object-cover object-top" />
                      (Add `import Image from 'next/image'` at the top)
                  */}
                </div>
                {/* Accent block */}
                <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-2xl bg-gold-400/20 border border-gold-400/30 -z-10" />
                <div className="absolute -top-4 -left-4 w-16 h-16 rounded-xl bg-navy-400/20 border border-navy-300/20 -z-10" />
                {/* Small quote badge */}
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -left-10 top-1/3 bg-white rounded-xl px-4 py-3 shadow-card-lg border border-stone-100 max-w-[170px]"
                >
                  <p className="text-navy-800 text-[13px] font-medium leading-snug italic">
                    &ldquo;People over politics, always.&rdquo;
                  </p>
                  <p className="text-stone-400 text-[11px] mt-1.5">— James Hargrove</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <p className="text-white/40 text-xs uppercase tracking-widest">Scroll</p>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity }}
            className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center pt-1.5"
          >
            <div className="w-1 h-1.5 rounded-full bg-white/50" />
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          ABOUT SECTION
      ══════════════════════════════════════════════════════ */}
      <section id="about" className="py-24 md:py-32 bg-cream-50">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger(0.15)}
            className="grid lg:grid-cols-2 gap-12 md:gap-20 items-start"
          >
            {/* Left column — text */}
            <div>
              <motion.span variants={fadeUp} className="text-navy-500 font-medium text-sm uppercase tracking-[0.18em]">
                About James
              </motion.span>
              <motion.h2
                variants={fadeUp}
                className="font-serif text-4xl md:text-5xl text-navy-900 mt-3 mb-6 leading-tight"
              >
                Rooted in This<br />
                <span className="italic">Community</span>
              </motion.h2>

              <motion.div variants={fadeUp} className="space-y-5 text-[17px] font-body text-stone-600 leading-[1.85]">
                <p>
                  James Hargrove was raised by a schoolteacher mother and a railwayman father in the
                  very streets he now hopes to represent. He learned early that real change doesn&apos;t
                  come from promises — it comes from showing up, year after year, week after week.
                </p>
                <p>
                  After earning a degree in Public Administration and working a decade in housing
                  advocacy, James returned home to start a family. He spent the next fifteen years
                  on the City Planning Commission, chair of the hospital board, and volunteering
                  with the local food bank every Saturday.
                </p>
                <p>
                  This campaign is not about a title. It is about carrying forward a lifetime of work —
                  and ensuring the next generation inherits a district they are proud to call home.
                </p>
              </motion.div>

              {/* Stats */}
              <motion.div variants={fadeUp} className="mt-10 grid grid-cols-3 gap-4">
                {[
                  { num: '30+', label: 'Years Serving' },
                  { num: '15k', label: 'Doors Knocked' },
                  { num: '4',   label: 'Civic Boards' },
                ].map(s => (
                  <div key={s.num} className="text-center bg-white rounded-2xl py-5 px-3 shadow-card border border-stone-100">
                    <p className="font-serif text-3xl text-navy-700 font-semibold">{s.num}</p>
                    <p className="text-stone-500 text-sm mt-1">{s.label}</p>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right column — pull quotes / story accents */}
            <motion.div variants={fadeUp} className="space-y-6">
              {/* Large quote */}
              <div className="relative bg-navy-900 text-white rounded-2xl p-8 md:p-10 shadow-card-lg overflow-hidden">
                <div className="absolute top-4 right-6 font-serif text-[120px] leading-none text-white/5 select-none pointer-events-none">&ldquo;</div>
                <p className="font-body italic text-xl md:text-2xl leading-relaxed text-cream-200 relative z-10">
                  &ldquo;I don&apos;t believe in politics as usual.
                  I believe in sitting at your kitchen table,
                  hearing your worries, and going back to
                  the chamber to do something about them.&rdquo;
                </p>
                <p className="mt-5 text-gold-400 font-medium text-sm relative z-10">— James Hargrove</p>
              </div>

              {/* Two smaller value cards */}
              {[
                {
                  emoji: '🏡',
                  title: 'Born & Raised Here',
                  text: 'Not a career politician transplanted from the capital. James grew up here and his family still lives here.',
                },
                {
                  emoji: '🤝',
                  title: 'Non-partisan Record',
                  text: 'James has consistently worked across lines to get things done — because good policy doesn\'t have a party colour.',
                },
              ].map(card => (
                <div key={card.title} className="flex items-start gap-4 bg-white rounded-2xl p-6 shadow-card border border-stone-100">
                  <span className="text-3xl mt-0.5 shrink-0">{card.emoji}</span>
                  <div>
                    <p className="font-semibold text-navy-800 mb-1">{card.title}</p>
                    <p className="text-stone-500 text-[15px] leading-relaxed">{card.text}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          PRIORITIES SECTION
      ══════════════════════════════════════════════════════ */}
      <section id="priorities" className="py-24 md:py-32 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger(0.12)}
          >
            {/* Heading */}
            <motion.div variants={fadeUp} className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-navy-500 font-medium text-sm uppercase tracking-[0.18em]">
                Priorities
              </span>
              <h2 className="font-serif text-4xl md:text-5xl text-navy-900 mt-3 mb-4 leading-tight">
                What James Stands For
              </h2>
              <p className="text-stone-500 text-[17px] font-body leading-relaxed">
                These are the issues heard most around dinner tables, at community meetings,
                and in letters sent to the campaign office.
              </p>
            </motion.div>

            {/* Cards */}
            <div className="grid md:grid-cols-3 gap-7">
              {PRIORITIES.map((p, i) => (
                <motion.div
                  key={p.number}
                  variants={fadeUp}
                  whileHover={{ y: -6, boxShadow: '0 20px 50px rgba(9,24,48,0.12)' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                  className="group relative bg-cream-50 rounded-2xl p-8 border border-stone-100 shadow-card cursor-default overflow-hidden"
                >
                  {/* Number watermark */}
                  <span className="absolute top-4 right-5 font-serif text-[64px] leading-none text-stone-100 select-none group-hover:text-navy-50 transition-colors duration-300">
                    {p.number}
                  </span>

                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl bg-navy-100 text-navy-600 flex items-center justify-center mb-6 group-hover:bg-navy-700 group-hover:text-white transition-all duration-300 shadow-sm">
                    {p.icon}
                  </div>

                  <h3 className="font-serif text-xl text-navy-900 mb-3 leading-snug">
                    {p.title}
                  </h3>
                  <p className="text-stone-500 text-[15px] leading-relaxed font-body">
                    {p.body}
                  </p>

                  {/* Bottom accent bar */}
                  <div className="mt-6 h-0.5 w-10 bg-gold-400 rounded-full group-hover:w-full transition-all duration-500" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          VISION / CAMPAIGN MESSAGE
      ══════════════════════════════════════════════════════ */}
      <section id="vision" className="py-24 md:py-32 bg-navy-950 relative overflow-hidden">
        {/* Texture */}
        <div className="absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}
        />
        <motion.div
          className="absolute -top-32 -right-32 w-96 h-96 bg-navy-600/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 12, repeat: Infinity }}
        />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger(0.14)}
          >
            <motion.span variants={fadeUp}
              className="text-gold-400 font-medium text-sm uppercase tracking-[0.2em]">
              Our Vision
            </motion.span>

            <motion.h2 variants={fadeUp}
              className="font-serif text-4xl md:text-5xl xl:text-6xl text-white mt-4 mb-8 leading-tight">
              A District That Works<br />
              <span className="italic text-cream-300">for Everyone</span>
            </motion.h2>

            <motion.div variants={fadeUp}
              className="ornament-divider mb-8">
              <span className="text-gold-400 text-xl">✦</span>
            </motion.div>

            <motion.p variants={fadeUp}
              className="font-body text-cream-300 text-lg md:text-xl leading-[1.9] mb-6 max-w-3xl mx-auto">
              James Hargrove&apos;s campaign is built on a simple belief: government works best
              when it stays close to the people it serves. Not grand ideology, not partisan
              warfare — just steady, honest, competent service.
            </motion.p>
            <motion.p variants={fadeUp}
              className="font-body text-cream-400 text-lg leading-[1.9] max-w-3xl mx-auto mb-12">
              His vision is a district where every family can afford the doctor, every child
              walks into a school that believes in them, and every senior can retire with
              dignity. That is not a dream. That is a plan — and it starts with your voice.
            </motion.p>

            <motion.button
              variants={fadeUp}
              id="vision-get-involved"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleInterestedClick}
              className="btn-shimmer inline-flex items-center gap-2 bg-gold-400 hover:bg-gold-300 text-navy-950 font-semibold text-base px-9 py-4 rounded-xl shadow-lg transition-colors"
            >
              Join the Campaign
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          INTEREST FORM SECTION
          Meta Pixel events:
            • LeadSubmitted fires on successful submit
            • Lead (standard) also fires for ad optimisation
      ══════════════════════════════════════════════════════ */}
      <section id="involved" className="py-24 md:py-32 bg-cream-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-14 items-start">

            {/* Left — copy */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              variants={stagger(0.13)}
            >
              <motion.span variants={fadeUp}
                className="text-navy-500 font-medium text-sm uppercase tracking-[0.18em]">
                Get Involved
              </motion.span>
              <motion.h2 variants={fadeUp}
                className="font-serif text-4xl md:text-5xl text-navy-900 mt-3 mb-5 leading-tight">
                Your Voice<br />
                <span className="italic">Matters Here</span>
              </motion.h2>
              <motion.p variants={fadeUp}
                className="font-body text-stone-500 text-[17px] leading-relaxed mb-8">
                Whether you want to volunteer, stay informed, or simply let James know
                what matters most to you — this form is the first step. No pressure,
                no spam. Just a genuine conversation.
              </motion.p>

              {/* Trust signals */}
              <motion.div variants={fadeUp} className="space-y-4">
                {[
                  { icon: '🔒', text: 'Your information is kept private and never sold.' },
                  { icon: '📬', text: 'You can unsubscribe from any email at any time.' },
                  { icon: '🤲', text: 'This campaign is funded by people, not corporations.' },
                ].map(item => (
                  <div key={item.text} className="flex items-start gap-3">
                    <span className="text-xl mt-0.5 shrink-0">{item.icon}</span>
                    <p className="text-stone-500 text-[15px] leading-relaxed font-body">{item.text}</p>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right — form */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7, ease }}
            >
              <div className="bg-white rounded-3xl shadow-card-lg border border-stone-100 p-8 md:p-10">
                <AnimatePresence mode="wait">

                  {/* ── Thank-you state ── */}
                  {formSubmitted ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.45 }}
                      className="text-center py-8"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', delay: 0.15, stiffness: 200 }}
                        className="w-20 h-20 bg-navy-50 rounded-full flex items-center justify-center mx-auto mb-5 border border-navy-100"
                      >
                        <svg className="w-10 h-10 text-navy-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 13l4 4L19 7" />
                        </svg>
                      </motion.div>
                      <h3 className="font-serif text-2xl text-navy-900 mb-3">Thank You!</h3>
                      <p className="text-stone-500 font-body text-[16px] leading-relaxed max-w-sm mx-auto">
                        Your message has been received. A member of James&apos;s team will
                        be in touch soon. We&apos;re glad you&apos;re with us.
                      </p>
                    </motion.div>

                  ) : (
                    /* ── Form state ── */
                    <motion.form
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onSubmit={handleSubmit}
                      noValidate
                      className="space-y-5"
                    >
                      <h3 className="font-serif text-2xl text-navy-900 mb-1">Stay in Touch</h3>
                      <p className="text-stone-400 text-[14px] mb-5">Fields marked * are required.</p>

                      {/* Full Name */}
                      <div>
                        <label htmlFor="form-name" className="block text-[15px] font-medium text-stone-700 mb-1.5">
                          Full Name <span className="text-red-500 ml-0.5">*</span>
                        </label>
                        <input
                          id="form-name"
                          type="text"
                          autoComplete="name"
                          value={formData.name}
                          onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                          placeholder="e.g. Margaret Williams"
                          className={errors.name ? inputError : inputNormal}
                        />
                        {errors.name && (
                          <p className="mt-1.5 text-[13px] text-red-500">{errors.name}</p>
                        )}
                      </div>

                      {/* Email */}
                      <div>
                        <label htmlFor="form-email" className="block text-[15px] font-medium text-stone-700 mb-1.5">
                          Email Address <span className="text-red-500 ml-0.5">*</span>
                        </label>
                        <input
                          id="form-email"
                          type="email"
                          autoComplete="email"
                          value={formData.email}
                          onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                          placeholder="your@email.com"
                          className={errors.email ? inputError : inputNormal}
                        />
                        {errors.email && (
                          <p className="mt-1.5 text-[13px] text-red-500">{errors.email}</p>
                        )}
                      </div>

                      {/* Phone (optional) */}
                      <div>
                        <label htmlFor="form-phone" className="block text-[15px] font-medium text-stone-700 mb-1.5">
                          Phone Number
                          <span className="text-stone-400 font-normal text-[13px] ml-2">(optional)</span>
                        </label>
                        <input
                          id="form-phone"
                          type="tel"
                          autoComplete="tel"
                          value={formData.phone}
                          onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                          placeholder="+1 (555) 000-0000"
                          className={inputNormal}
                        />
                      </div>

                      {/* Consent checkbox */}
                      <div className="pt-1">
                        <label className="custom-checkbox flex items-start gap-3 cursor-pointer">
                          <input
                            id="form-consent"
                            type="checkbox"
                            checked={formData.consent}
                            onChange={e => setFormData(p => ({ ...p, consent: e.target.checked }))}
                          />
                          <span className="text-[14px] text-stone-500 leading-relaxed font-body">
                            I agree to receive campaign updates and occasional emails from the
                            Hargrove for Senate campaign. I understand I can unsubscribe at any time.
                          </span>
                        </label>
                        {errors.consent && (
                          <p className="mt-1.5 text-[13px] text-red-500 ml-7">{errors.consent}</p>
                        )}
                      </div>

                      {/* Submit */}
                      {/* ── Meta Pixel: LeadSubmitted event fires inside handleSubmit ── */}
                      <motion.button
                        id="form-submit"
                        type="submit"
                        disabled={isSubmitting}
                        whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                        whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                        className={`btn-shimmer w-full py-4 rounded-xl font-semibold text-[16px] shadow-md transition-all duration-200 ${
                          isSubmitting
                            ? 'bg-stone-300 text-stone-400 cursor-not-allowed'
                            : 'bg-navy-700 hover:bg-navy-600 text-white'
                        }`}
                      >
                        {isSubmitting ? (
                          <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Sending…
                          </span>
                        ) : (
                          'Send My Details'
                        )}
                      </motion.button>

                      <p className="text-center text-stone-400 text-[12px] font-body leading-relaxed">
                        By submitting this form you agree to our privacy practices.
                        We never sell or share your data.
                      </p>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════════ */}
      <footer className="bg-navy-950 text-cream-400 py-12 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-navy-700 border border-navy-500 flex items-center justify-center">
              <span className="text-cream-100 font-serif text-xs font-semibold">JH</span>
            </div>
            <div>
              <p className="text-cream-200 font-serif text-sm font-semibold">James Hargrove</p>
              <p className="text-navy-400 text-[11px] tracking-widest uppercase">State Senate · District 14</p>
            </div>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap justify-center gap-6 text-[13px]" aria-label="Footer navigation">
            {NAV_LINKS.map(link => (
              <button
                key={link.id}
                onClick={() => scrollTo(link.id)}
                className="text-navy-400 hover:text-cream-300 transition-colors"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Legal */}
          <p className="text-navy-500 text-[12px] text-center">
            Paid for by Hargrove for Senate. &copy;{new Date().getFullYear()}.
            <br className="sm:hidden" />
            <span className="sm:ml-1">Privacy&nbsp;·&nbsp;Disclaimer</span>
          </p>
        </div>
      </footer>

    </div>
  )
}
