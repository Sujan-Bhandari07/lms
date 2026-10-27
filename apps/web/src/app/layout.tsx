import type { Metadata } from 'next';
import './global.css';
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";



export const metadata: Metadata = {
  title: "Ujyalo",
  description: "An AI-powered learning platform",
};




export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body  className={`${GeistSans.className} ${GeistMono.variable} antialiased`}>{children}</body>
    </html>
  )
}
