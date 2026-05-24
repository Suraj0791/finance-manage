import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import ErrorBoundary from "@/components/custom-error-boundary";
import { AIChatAssistant } from "@/components/ai-chat-assistant";
import { auth } from "@/auth";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Finance App",
  description: "One stop Finance Platform",
};

export default async function RootLayout({ children }) {
  const session = await auth();

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo.png" sizes="any" />
      </head>
      <body className={`${inter.className}`}>
        <ErrorBoundary>
          <Header />
          <main className="min-h-screen pt-20">{children}</main>
          <AIChatAssistant session={session} />
          <footer className="bg-blue-50 py-12">
            <div className="container mx-auto px-4 text-center text-gray-600">
              <p>Made with 💗 by SurajSharma</p>
            </div>
          </footer>
        </ErrorBoundary>
      </body>
    </html>
  );
}
