export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-background flex h-svh items-center justify-center">
      <div className="w-full max-w-lg px-4">{children}</div>
    </div>
  );
}
