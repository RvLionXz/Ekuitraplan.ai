export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Login page uses its own clean layout — no Navbar/Footer
  return <>{children}</>;
}
