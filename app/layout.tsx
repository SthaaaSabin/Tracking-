import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'James Hargrove for State Senate – A Neighbor. A Servant. A Leader.',
  description:
    'James Hargrove has spent three decades listening to and serving our community. Learn about his vision, values, and how you can get involved.',
  openGraph: {
    title: 'James Hargrove for State Senate',
    description:
      'Three decades of service. A steady hand. A future worth fighting for.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/*
         * ═══════════════════════════════════════════════════════════════════
         *  META PIXEL – HOW IT WORKS (READ THIS FIRST)
         * ═══════════════════════════════════════════════════════════════════
         *
         *  The flow this pixel tracks:
         *
         *  1. FACEBOOK / INSTAGRAM AD or POST
         *     └─ A supporter sees or shares a post about the campaign.
         *
         *  2. CLICK → WEBSITE LINK
         *     └─ They click the link in the post/ad (fb_source parameter is
         *        automatically appended by Meta's platform).
         *
         *  3. LAND ON THIS PAGE
         *     └─ Their browser loads this page. The pixel script below fires
         *        immediately and executes fbq('init', …).
         *
         *  4. PIXEL TRACKS WEBSITE ACTIVITY ONLY
         *     └─ From this point on the pixel only tracks what happens ON
         *        THIS WEBSITE — button clicks, form views, form submissions.
         *        It does NOT spy on what the visitor does elsewhere.
         *
         *  Events tracked:
         *    • PageView       – fires automatically on load (LandingPage.tsx)
         *    • LearnMoreClick – when visitor clicks "Learn More" in the hero
         *    • SupportInterest– when visitor clicks "I'm Interested" in the hero
         *    • LeadSubmitted  – when the interest form is successfully submitted
         *
         * ═══════════════════════════════════════════════════════════════════
         *  TO ACTIVATE:
         *    Replace  PLACEHOLDER_PIXEL_ID  with your actual Meta Pixel ID.
         *    You can find it in Meta Business Suite → Events Manager → Pixels.
         *    Example: fbq('init', '1234567890123456');
         * ═══════════════════════════════════════════════════════════════════
         */}
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

              /* ── Initialize your pixel (replace ID below) ── */
              fbq('init', 'PLACEHOLDER_PIXEL_ID');

              /* NOTE: PageView is fired inside LandingPage.tsx via useEffect
                 so it respects Next.js client-side rendering properly.       */
            `,
          }}
        />
        {/* NoScript fallback – still fires a PageView for non-JS browsers */}
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            alt=""
            src="https://www.facebook.com/tr?id=PLACEHOLDER_PIXEL_ID&ev=PageView&noscript=1"
          />
        </noscript>
      </head>
      <body className="bg-cream-50 text-stone-800 font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
