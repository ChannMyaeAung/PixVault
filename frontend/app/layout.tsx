import type { Metadata } from "next";
import { Raleway} from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const raleway = Raleway({
  subsets: ["latin"],
  variable: "--font-raleway",
})

export const metadata: Metadata = {
  title: "PixVault",
  description: "A secure and private media vault built with FastAPI and Next.js, allowing users to store and manage their photos and videos with ease.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={raleway.variable}>
      <body
        className={`${raleway.variable} antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
