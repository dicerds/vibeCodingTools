import "./globals.css";

export const metadata = {
  title: "Vibe Coder Toolkit",
  description: "Project kickstarter and workspace for vibe coders",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-slate-950 text-slate-100 antialiased">{children}</body>
    </html>
  );
}
