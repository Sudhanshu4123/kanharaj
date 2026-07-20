/**
 * Property Detail Page — No Header/Footer Layout
 * This nested layout overrides the root layout's header, footer, and mobile nav
 * for the property detail page — giving it a full-screen, app-like experience
 * similar to Housing.com mobile property pages.
 */
export default function PropertyDetailLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="min-h-screen">
      {children}
    </main>
  )
}
