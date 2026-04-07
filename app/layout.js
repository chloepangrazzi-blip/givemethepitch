import "./globals.css";

export const metadata = {
  title: "Give Me The Pitch",
  description: "Legacy site migrated to Next.js",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
