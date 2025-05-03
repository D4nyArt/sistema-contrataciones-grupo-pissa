import "./globals.css";
import { poppins } from '@/app/components/fonts';
import ForLogOut from "./components/logOut";
import FAQ from "@/app/components/faq";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (  
    <html lang="es">
      <body
        className={`${poppins.className}`}
      >
        {children}
        <ForLogOut />
        <FAQ />
      </body>
    </html>
  );
}