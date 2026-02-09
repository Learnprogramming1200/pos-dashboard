import type { Metadata } from "next";
import { Inter_Tight, Poppins, Caveat, DM_Sans, Lato, Merriweather, Montserrat, Playfair_Display, Roboto } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Suspense } from "react";
import AuthSessionProvider from "@/components/AuthSessionProvider";
import { AuthProvider } from "@/providers";
import DynamicFavicon from "@/components/DynamicFavicon";
import { GeneralSettingsProvider } from "@/contexts/GeneralSettingsContext";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AxiosProvider from "@/components/AxiosProvider";

const lato = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-lato",
});
const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-merriweather",
});
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-montserrat",
});
const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-playfair-display",
});
const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-roboto",
});
const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${interTight.variable} ${poppins.variable} ${caveat.variable} ${dmSans.variable} ${lato.variable} ${merriweather.variable} ${montserrat.variable} ${playfairDisplay.variable} ${roboto.variable}`}
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey="pospro-theme"
          themes={["light", "dark", "system"]}
        >
          <AuthSessionProvider>
            <Suspense fallback={null}>
              <AxiosProvider>
                <AuthProvider>
                  <GeneralSettingsProvider>
                    <DynamicFavicon />
                    {children}
                    <div id="portal-root" />
                  </GeneralSettingsProvider>
                </AuthProvider>
                <ToastContainer
                  position="top-right"
                  autoClose={1000}
                  hideProgressBar={false}
                  newestOnTop={false}
                  closeOnClick
                  rtl={false}
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                  theme="light"
                />
              </AxiosProvider>
            </Suspense>
          </AuthSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
