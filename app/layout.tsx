import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { CardsProvider } from "@/contexts/CardsProvider";
import { WorkspacesProvider } from "@/contexts/WorkspacesProvider";
import { MembersProvider } from "@/contexts/MembersProvider";
import { NotesProvider } from "@/contexts/NotesProvider";
import { DocumentsProvider } from "@/contexts/DocumentsProvider";
import { ChatProvider } from "@/contexts/ChatProvider";
import { AIProvider } from "@/contexts/AIProvider";
import { Toaster } from 'react-hot-toast';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Knowledge Workspace",
  description: "Adaptive AI Knowledge Workspace - Manage and explore knowledge cards with AI-powered insights",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <CardsProvider>
            <WorkspacesProvider>
              <MembersProvider>
                <NotesProvider>
                  <DocumentsProvider>
                    <ChatProvider>
                      <AIProvider>
                        <Toaster />
                        {children}
                      </AIProvider>
                    </ChatProvider>
                  </DocumentsProvider>
                </NotesProvider>
              </MembersProvider>
            </WorkspacesProvider>
          </CardsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
