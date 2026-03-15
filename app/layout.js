export const metadata = {
  title: "Give Me The Pitch",
  description: "Legacy site migrated to Next.js",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
