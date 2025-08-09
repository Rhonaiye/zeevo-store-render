import { Geist, Geist_Mono, Montserrat, Nunito, Inter, Jost, Saira, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";


const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const MontserratFont = Montserrat({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-montserrat', display: 'swap' });
const BricolageFont = Bricolage_Grotesque({ subsets: ['latin'], weight: ['400', '500', '700'], display: 'swap', variable: '--font-bricolage' });
const JostFont = Jost({ subsets: ['latin'], weight: ['400', '500', '600', '700'], display: 'swap', variable: '--font-jost' });
const SairaFont = Saira({ subsets: ['latin'], weight: ['400', '500', '600', '700'], display: 'swap', variable: '--font-saira' });
const NunitoSans = Nunito({ subsets: ['latin'], weight: ['400', '600', '700'], variable: '--font-nunito', display: 'swap' });
const InterFont = Inter({ subsets: ['latin'], weight: ['400', '500', '700'], variable: '--font-inter', display: 'swap' });



export const metadata = {
  title: 'Zeevo — Create Your Online Store in Minutes',
  description:
    'Zeevo lets you build and manage your online store easily. Sell products, accept payments, and grow your business with powerful e-commerce tools.',
  keywords: [
    'Zeevo',
    'E-commerce',
    'Online Store Builder',
    'Sell Online',
    'No Code Store Builder',
    'Shop Builder',
    'Create Online Store',
    'Business Tools',
  ],
  authors: [{ name: 'Zeevo', url: 'https://zeevo.shop' }],
  metadataBase: new URL('https://zeevo.shop'),

  openGraph: {
    title: 'Zeevo — Create Your Online Store in Minutes',
    description:
      'Zeevo lets you build and manage your online store easily. Sell products, accept payments, and grow your business with powerful e-commerce tools.',
    url: 'https://zeevo.shop',
    siteName: 'Zeevo',
    images: [
      {
        url: 'https://zeevo.shop/zeevo-fb.png',
        width: 1200,
        height: 630,
        alt: 'Zeevo — Create Your Online Store in Minutes',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Zeevo — Create Your Online Store in Minutes',
    description:
      'Zeevo lets you build and manage your online store easily. Sell products, accept payments, and grow your business with powerful e-commerce tools.',
    creator: '@ZeevoHQ',
    images: ['https://zeevo.shop/zeevo-fb.png'],
  },

  icons: {
    icon: '/zeevo.png',
    shortcut: '/zeevo.png',
    apple: '/zeevo.png',
  },

  alternates: {
    canonical: 'https://zeevo.shop',
  },

  robots: {
    index: true,
    follow: true,
    nocache: false,
  },
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${MontserratFont.variable} ${NunitoSans.variable} ${InterFont.variable} ${JostFont.variable} ${SairaFont.variable} ${BricolageFont.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
