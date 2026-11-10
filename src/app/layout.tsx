import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/frontend/context/LanguageContext";
import { BRANDING } from "@/constants/branding";

export const metadata: Metadata = {
  title: `${BRANDING.brandNameTamil} | ${BRANDING.brandName} - ${BRANDING.taglineTamil}`,
  description: `${BRANDING.brandName} - ${BRANDING.subTaglineTamil}. 100% சரிபார்க்கப்பட்ட வரன்கள் மற்றும் இலவச மேட்ரிமோனி சேவை.`,
  keywords: ["Namma Matrimony", "Tamil Matrimony", "நம்ம மேட்ரிமோனி", "தமிழ் மேட்ரிமோனி", "Jathagam Matching", "Tamil Bride Groom"],
  openGraph: {
    title: `${BRANDING.brandNameTamil} | ${BRANDING.brandName}`,
    description: `${BRANDING.taglineTamil} - ${BRANDING.subTaglineTamil}`,
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ta"
      className="h-full w-full max-w-full overflow-x-hidden antialiased"
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+Tamil:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full w-full max-w-full flex flex-col font-sans bg-background text-foreground selection:bg-primary/20 selection:text-primary overflow-x-hidden">
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
