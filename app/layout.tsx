import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Quick-Bite University - Campus Dining & Orders',
  description:
    'Sistema de pedidos para cafetería universitaria diseñado con Clean Architecture, principios SOLID, entidades Product y Order, y gestión en tiempo real.',
  openGraph: {
    title: 'Quick-Bite University - Campus Dining & Orders',
    description:
      'Sistema de pedidos para cafetería universitaria diseñado con Clean Architecture, principios SOLID, entidades Product y Order, y gestión en tiempo real.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Quick-Bite University - Campus Dining & Orders',
    description:
      'Sistema de pedidos para cafetería universitaria diseñado con Clean Architecture, principios SOLID, entidades Product y Order, y gestión en tiempo real.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body suppressHydrationWarning className="bg-surface text-on-surface min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
