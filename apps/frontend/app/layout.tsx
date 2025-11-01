import './global.css';

export const metadata = {
  title: 'SOS Academy - Coming Soon',
  description: 'SOS Academy Platform',
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
