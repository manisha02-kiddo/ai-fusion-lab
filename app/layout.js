// app/layout.js
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import Provider from "./Provider";

export const metadata = {
  title: "AI Fusion",
  description: "Multi-AI Model Comparison",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className="w-full h-screen overflow-hidden">
          <div className="w-full h-full overflow-hidden">
            <Provider>{children}</Provider>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
