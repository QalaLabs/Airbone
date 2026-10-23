'use client'

import { useState, useEffect } from 'react'
import { WHATSAPP_HREF, WHATSAPP_DISPLAY, whatsappHref } from '@/lib/whatsapp'

export default function StickyMobileCTA({ onBookDemo }) {
  const handleBook = () => {
    if (onBookDemo) {
      onBookDemo('Free Counselling Call')
      return
    }
    if (typeof window !== 'undefined') {
      // Dispatch custom event for homepage or pages with active booking modal
      window.dispatchEvent(
        new CustomEvent('airborne:open-booking', {
          detail: { course: 'Free Counselling Call' },
        })
      )
      // If on a page without modal handler, redirect to contact
      if (window.location.pathname !== '/') {
        window.location.href = '/contact'
      }
    }
  }

  const defaultWhatsAppUrl =
    whatsappHref('Hi Airborne Aviation Academy, I would like to enquire about DGCA CPL pilot ground school and upcoming batch admissions.') ||
    WHATSAPP_HREF

  return (
    <div
      id="bottom-cta-strip"
      className="sticky-mobile-cta"
      role="region"
      aria-label="Quick Contact and Admissions Strip"
    >
      {/* ── DESKTOP DOCKED BAR (>= 768px) ── */}
      <div className="bottom-cta-desktop">
        <div className="bottom-cta-desktop-inner">
          {/* Left: Live status badge & Academy identity */}
          <div className="bottom-cta-left">
            <span className="live-dot" />
            <span className="live-badge-text">Admissions Open · Upcoming Batch</span>
            <span className="divider-bullet">•</span>
            <span className="campus-text">Airborne Aviation Academy · Ramphal Chowk, Dwarka</span>
          </div>

          {/* Right: Action Buttons */}
          <div className="bottom-cta-actions">
            {/* Call Line */}
            <a
              href="tel:+919953777320"
              className="bottom-cta-btn btn-call"
              aria-label="Call Admissions at +91 9953 777 320"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.43 10.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012.35 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006 6l1.27-.76a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 15.22z"/>
              </svg>
              <span>+91 9953 777 320</span>
            </a>

            {/* WhatsApp Support (8796524733) */}
            <a
              href={defaultWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bottom-cta-btn btn-whatsapp"
              aria-label="Chat on WhatsApp at +91 87965 24733"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              <span>WhatsApp Us</span>
            </a>

            {/* Primary Action Button */}
            <button
              type="button"
              onClick={handleBook}
              className="bottom-cta-btn btn-primary-cta"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <span>Book Free Counselling / Demo</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── MOBILE TOUCH BAR (< 768px) ── */}
      <div className="bottom-cta-mobile">
        {/* Call (9953777320) */}
        <a
          href="tel:+919953777320"
          className="mobile-cta-item item-call"
          aria-label="Call Admissions"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="mobile-cta-icon">
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.43 10.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012.35 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006 6l1.27-.76a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 15.22z"/>
          </svg>
          <span className="mobile-cta-text">Call</span>
        </a>

        {/* WhatsApp (8796524733) */}
        <a
          href={defaultWhatsAppUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mobile-cta-item item-whatsapp"
          aria-label="Chat on WhatsApp"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="mobile-cta-icon icon-green">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
          <span className="mobile-cta-text">WhatsApp</span>
        </a>

        {/* Book Demo */}
        <button
          type="button"
          onClick={handleBook}
          className="mobile-cta-item item-book"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="mobile-cta-icon">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <span className="mobile-cta-text">Book Demo</span>
        </button>
      </div>

      <style jsx>{`
        .sticky-mobile-cta {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 850;
          background: #000c1a;
          border-top: 1px solid rgba(216, 160, 39, 0.28);
          box-shadow: 0 -8px 30px rgba(0, 0, 0, 0.45);
          display: block;
        }

        /* Desktop Layout */
        .bottom-cta-desktop {
          display: none;
        }

        @media (min-width: 768px) {
          .bottom-cta-desktop {
            display: block;
          }
          .bottom-cta-mobile {
            display: none !important;
          }
        }

        .bottom-cta-desktop-inner {
          max-width: 1320px;
          margin: 0 auto;
          height: 52px;
          padding: 0 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }

        .bottom-cta-left {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-family: var(--font-h);
          font-size: 0.76rem;
          color: rgba(255, 255, 255, 0.85);
          letter-spacing: 0.04em;
        }

        .live-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 8px #10b981;
          animation: pulseDot 2s infinite;
        }

        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.85); }
        }

        .live-badge-text {
          font-weight: 800;
          color: #D8A027;
          text-transform: uppercase;
        }

        .divider-bullet {
          color: rgba(255, 255, 255, 0.25);
        }

        .campus-text {
          color: rgba(255, 255, 255, 0.65);
        }

        .bottom-cta-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .bottom-cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.45rem 0.95rem;
          border-radius: 6px;
          font-family: var(--font-h);
          font-size: 0.74rem;
          font-weight: 700;
          letter-spacing: 0.03em;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
          white-space: nowrap;
        }

        .btn-call {
          background: rgba(255, 255, 255, 0.07);
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.15);
        }
        .btn-call:hover {
          background: rgba(255, 255, 255, 0.14);
          color: #D8A027;
        }

        .btn-whatsapp {
          background: rgba(37, 211, 102, 0.12);
          color: #25D366;
          border: 1px solid rgba(37, 211, 102, 0.35);
        }
        .btn-whatsapp:hover {
          background: #25D366;
          color: #000000;
        }

        .btn-primary-cta {
          background: #DB241E;
          color: #ffffff;
          box-shadow: 0 4px 14px rgba(219, 36, 30, 0.35);
          text-transform: uppercase;
          font-weight: 800;
        }
        .btn-primary-cta:hover {
          background: #b51c17;
          transform: translateY(-1px);
        }

        /* Mobile Layout */
        .bottom-cta-mobile {
          display: grid;
          grid-template-columns: 1fr 1fr 1.25fr;
          padding-bottom: env(safe-area-inset-bottom, 0px);
        }

        @media (min-width: 768px) {
          .bottom-cta-mobile {
            display: none !important;
          }
        }

        .mobile-cta-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 0.75rem 0.5rem;
          text-decoration: none;
          cursor: pointer;
          border: none;
          background: transparent;
          transition: background 0.2s;
        }

        .item-call {
          color: #ffffff;
          border-right: 1px solid rgba(255, 255, 255, 0.08);
        }
        .item-call:active {
          background: rgba(255, 255, 255, 0.08);
        }

        .item-whatsapp {
          color: #25D366;
          border-right: 1px solid rgba(255, 255, 255, 0.08);
        }
        .item-whatsapp:active {
          background: rgba(37, 211, 102, 0.1);
        }

        .item-book {
          background: #DB241E;
          color: #ffffff;
          font-family: var(--font-h);
        }
        .item-book:active {
          background: #b51c17;
        }

        .mobile-cta-icon {
          width: 19px;
          height: 19px;
          margin-bottom: 3px;
        }

        .icon-green {
          color: #25D366;
        }

        .mobile-cta-text {
          font-family: var(--font-h);
          font-size: 0.64rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
      `}</style>
    </div>
  )
}
