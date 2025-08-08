import { Geist, Geist_Mono, Montserrat, Nunito, Inter, Jost, Saira, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import SeoProvider from "@/components/SeoProvider";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const MontserratFont = Montserrat({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-montserrat', display: 'swap' });
const BricolageFont = Bricolage_Grotesque({ subsets: ['latin'], weight: ['400', '500', '700'], display: 'swap', variable: '--font-bricolage' });
const JostFont = Jost({ subsets: ['latin'], weight: ['400', '500', '600', '700'], display: 'swap', variable: '--font-jost' });
const SairaFont = Saira({ subsets: ['latin'], weight: ['400', '500', '600', '700'], display: 'swap', variable: '--font-saira' });
const NunitoSans = Nunito({ subsets: ['latin'], weight: ['400', '600', '700'], variable: '--font-nunito', display: 'swap' });
const InterFont = Inter({ subsets: ['latin'], weight: ['400', '500', '700'], variable: '--font-inter', display: 'swap' });

export const metadata = {
  icons: {
    icon: '/zeevo.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${MontserratFont.variable} ${NunitoSans.variable} ${InterFont.variable} ${JostFont.variable} ${SairaFont.variable} ${BricolageFont.variable} antialiased`}>
        <SeoProvider /> {/* ✅ client-side SEO config */}
        {children}
      </body>
    </html>
  );
}
