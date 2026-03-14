export const metadata = {
  title: "NetBird Explain — Example",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#0a0a0f", color: "#f0f0f5" }}>
        {children}
      </body>
    </html>
  );
}