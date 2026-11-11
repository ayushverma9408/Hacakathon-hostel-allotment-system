import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AllotmentPro | Hostel Management",
  description: "A secure, structured workspace for hostel allocation and administration."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
