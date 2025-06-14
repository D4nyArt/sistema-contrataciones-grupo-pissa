import PreventBFCache from "./components/preventBFCache";
import "./globals.css";
import { poppins } from '@/app/components/fonts';

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
        <PreventBFCache/>
        {children}
      </body>
    </html>
  );
}