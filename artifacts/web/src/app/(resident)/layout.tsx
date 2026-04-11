export default function ResidentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-blue-600 text-white px-4 py-3">
        <h1 className="text-lg font-semibold">Star City Living</h1>
      </header>

      <main className="flex-1 pb-16">{children}</main>

      <nav className="fixed bottom-0 w-full bg-white border-t flex justify-around py-2 text-xs text-gray-600">
        <a href="/" className="flex flex-col items-center gap-1">
          <span>Home</span>
        </a>
        <a href="/bills" className="flex flex-col items-center gap-1">
          <span>Bills</span>
        </a>
        <a href="/star-assist" className="flex flex-col items-center gap-1">
          <span>Star Assist</span>
        </a>
        <a href="/bookings" className="flex flex-col items-center gap-1">
          <span>Bookings</span>
        </a>
        <a href="/more" className="flex flex-col items-center gap-1">
          <span>More</span>
        </a>
      </nav>
    </div>
  );
}
