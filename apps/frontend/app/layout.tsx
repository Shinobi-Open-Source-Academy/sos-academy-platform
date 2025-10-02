import type { Metadata } from "next";
import { Montserrat, Roboto, Roboto_Mono } from "next/font/google";
import "./globals.css";

// Define Montserrat font with multiple weights
const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

// Define Roboto font with multiple weights
const roboto = Roboto({
  subsets: ["latin"],
  variable: "--font-roboto",
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

// Define Roboto Mono for code
const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Shinobi Open-Source Academy",
  description: "Empowering the Next Generation of Open-Source Warriors",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/shinobiLogo.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
    apple: "/shinobiLogo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${montserrat.variable} ${roboto.variable} ${robotoMono.variable} antialiased font-sans`}
      >
        {children}
      </body>
    </html>
  );
}
