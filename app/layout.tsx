import type { Metadata } from "next";
import { Geist, Geist_Mono, Montserrat, Nunito, Inter, Jost, Saira, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const MontserratFont = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'], // Customize weights as needed
  variable: '--font-montserrat', // Optional, for CSS variable usage
  display: 'swap', // Optional, improves performance
});

const BricolageFont = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['400', '500', '700'], // Add the weights you want to use
  display: 'swap', // Optional but recommended for better UX
  variable: '--font-bricolage', // Optional: enables usage with CSS variables
});

const JostFont = Jost({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'], // you can customize the weights you need
  display: 'swap',
  variable: '--font-jost'
});

const SairaFont = Saira({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'], // customize as needed
  display: 'swap',
  variable: '--font-saira'
});

const NunitoSans = Nunito({
  subsets: ['latin'],
  weight: ['400', '600', '700'], // You can include other weights as needed
  variable: '--font-nunito',
  display: 'swap'
});

const InterFont = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
   variable: '--font-inter', // optional, choose weights you need
  display: 'swap',               // optional, improves performance
});


export const metadata = {
  icons: {
    icon: '/zeevo.png', // or '/favicon.svg' or '/favicon.png'
  },
}




export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${MontserratFont.variable} ${NunitoSans.variable} ${InterFont.variable} ${JostFont.variable} ${SairaFont.variable} ${BricolageFont.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
