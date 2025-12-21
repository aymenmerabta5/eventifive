export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div className="grid h-svh grid-rows-[1fr]">{children}</div>
    </>
  );
}
