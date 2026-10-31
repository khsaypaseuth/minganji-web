// The real root layout (with <html>) lives in app/[locale]/layout.tsx so the
// lang attribute matches the selected language.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
