import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-4">Star City Living App</h1>
      <p className="text-gray-600 mb-8">
        Resident community management for StarCity Estate
      </p>
      <Link
        href="/admin/dashboard"
        className="text-blue-600 hover:underline"
      >
        Go to Admin Dashboard
      </Link>
    </main>
  );
}
