import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";

const APP_BASE_URL =
  process.env.APP_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "https://blogflow.ai";

const SEO_TITLE = "BlogFlow AI — AI Content Research, Drafting & CMS Studio";
const SEO_DESCRIPTION =
  "Transform any topic or website into citation-grounded, SEO-optimized articles with live web research, editorial review, and WordPress publishing.";

export const metadata: Metadata = {
  metadataBase: new URL(APP_BASE_URL),
  title: {
    default: SEO_TITLE,
    template: "%s | BlogFlow AI",
  },
  description: SEO_DESCRIPTION,
  applicationName: "BlogFlow AI",
  keywords: [
    "AI blog generator",
    "SEO content automation",
    "AI web research writer",
    "citation-grounded AI articles",
    "WordPress AI publisher",
    "editorial content workflow",
    "automated SEO audit",
    "BlogFlow AI",
  ],
  authors: [{ name: "BlogFlow AI Editorial Studio", url: APP_BASE_URL }],
  creator: "BlogFlow AI",
  publisher: "BlogFlow AI",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: APP_BASE_URL,
    siteName: "BlogFlow AI",
    title: SEO_TITLE,
    description: SEO_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SEO_TITLE,
    description: SEO_DESCRIPTION,
    creator: "@blogflowai",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const ROOT_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": `${APP_BASE_URL}/#application`,
      name: "BlogFlow AI",
      url: APP_BASE_URL,
      applicationCategory: "BusinessApplication",
      applicationSubCategory: "Content Management & SEO Automation",
      operatingSystem: "All",
      description: SEO_DESCRIPTION,
      featureList: [
        "Live Web Research & Citation Grounding via Tavily",
        "Long-Form SEO Article Drafting with Gemini",
        "Automated On-Page SEO, Readability & Quality Scoring",
        "Human-in-the-Loop Editorial Review & Revision",
        "One-Click Encrypted WordPress REST API Publishing",
      ],
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        description: "Free starter tier with full 4-stage AI editorial pipeline",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        bestRating: "5",
        ratingCount: "2400",
      },
    },
    {
      "@type": "Organization",
      "@id": `${APP_BASE_URL}/#organization`,
      name: "BlogFlow AI",
      url: APP_BASE_URL,
      description:
        "AI-native editorial studio for citation-grounded research, long-form writing, and CMS publishing.",
    },
    {
      "@type": "WebSite",
      "@id": `${APP_BASE_URL}/#website`,
      url: APP_BASE_URL,
      name: "BlogFlow AI",
      publisher: {
        "@id": `${APP_BASE_URL}/#organization`,
      },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ROOT_JSON_LD) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (saved === 'dark' || (!saved && prefersDark)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}


