import './global.css';

export const metadata = {
  title: 'SOS Academy Admin',
  description: 'Admin panel for Shinobi Open-Source Academy',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
