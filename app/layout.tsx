import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'James Hargrove for State Senate – A Neighbor. A Servant. A Leader.',
  description:
    'James Hargrove has spent three decades listening to and serving our community. Learn about his vision, values, and how you can get involved.',
  openGraph: {
    title: 'James Hargrove for State Senate',
    description: 'Three decades of service. A steady hand. A future worth fighting for.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/*
         * ═══════════════════════════════════════════════════════════════════
         *  META PIXEL — TEMPORARILY DISABLED (Demo / Mock Mode Active)
         * ═══════════════════════════════════════════════════════════════════
         *
         *  The Meta Pixel script below is commented out because the Meta
         *  Business/Ad account is currently restricted.
         *
         *  A LOCAL MOCK TRACKER is active instead (see LandingPage.tsx).
         *  It simulates the same event flow and stores events in localStorage.
         *
         *  TO RESTORE REAL META PIXEL:
         *   1. Uncomment the <script> block below
         *   2. Replace PLACEHOLDER_PIXEL_ID with your real Meta Pixel ID
         *   3. In LandingPage.tsx, set DEMO_MODE = false (or swap trackEvent
         *      calls back to the Meta Pixel helpers)
         *
         *  The flow this pixel tracks (for reference):
         *   Facebook/Instagram ad → user clicks link → lands here
         *   → Pixel fires: PageView, LearnMoreClick, SupportInterest, LeadSubmitted
         *
         * ═══════════════════════════════════════════════════════════════════
         */}

        {/* --- Uncomment below when Meta account is restored ---
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', 'PLACEHOLDER_PIXEL_ID');
            `,
          }}
        />
        <noscript>
          <img height="1" width="1" style={{ display: 'none' }} alt=""
            src="https://www.facebook.com/tr?id=PLACEHOLDER_PIXEL_ID&ev=PageView&noscript=1" />
        </noscript>
        --- End Meta Pixel block --- */}
      </head>
      <body className="bg-cream-50 text-stone-800 font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
