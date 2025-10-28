import { Geist, Geist_Mono, Montserrat, Nunito, Inter, Jost, Saira, Bricolage_Grotesque, Titillium_Web } from "next/font/google";
import "./globals.css";
import { GoogleOAuthProvider } from "@react-oauth/google";

// Font configurations with display: swap for better performance
const geistSans = Geist({ 
  variable: "--font-geist-sans", 
  subsets: ["latin"] 
});

const geistMono = Geist_Mono({ 
  variable: "--font-geist-mono", 
  subsets: ["latin"] 
});

const MontserratFont = Montserrat({ 
  subsets: ['latin'], 
  weight: ['400', '500', '600', '700'], 
  variable: '--font-montserrat', 
  display: 'swap' 
});

const BricolageFont = Bricolage_Grotesque({ 
  subsets: ['latin'], 
  weight: ['400', '500', '700'], 
  display: 'swap', 
  variable: '--font-bricolage' 
});

const JostFont = Jost({ 
  subsets: ['latin'], 
  weight: ['400', '500', '600', '700'], 
  display: 'swap', 
  variable: '--font-jost' 
});

const SairaFont = Saira({ 
  subsets: ['latin'], 
  weight: ['400', '500', '600', '700'], 
  display: 'swap', 
  variable: '--font-saira' 
});

const NunitoSans = Nunito({ 
  subsets: ['latin'], 
  weight: ['400', '600', '700'], 
  variable: '--font-nunito', 
  display: 'swap' 
});

const InterFont = Inter({ 
  subsets: ['latin'], 
  weight: ['400', '500', '700'], 
  variable: '--font-inter', 
  display: 'swap' 
});

const TitilliumFont = Titillium_Web({
  subsets: ["latin"], 
  weight: ["200","300","400","600","700","900"],
  variable: '--font-titillium', 
  display: "swap"      
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'),
  title: {
    default: 'Online Store',
    template: '%s'
  },
  description: 'Welcome to our store platform',
  openGraph: {
    type: 'website',
    title: 'Online Store',
    description: 'Welcome to our store platform',
  },
  icons: {
    icon: '/store-icon.png',
    shortcut: '/store-icon.png',
    apple: '/store-icon.png',
  }
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${MontserratFont.variable} ${NunitoSans.variable} ${InterFont.variable} ${JostFont.variable} ${SairaFont.variable} ${BricolageFont.variable} ${TitilliumFont.variable} antialiased`}>
       <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
          {children}
       </GoogleOAuthProvider>
      </body>
    </html>
  );
}
