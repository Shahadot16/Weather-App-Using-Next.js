
import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-blue-600 text-white shadow-md">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="text-2xl font-bold">
          Weather App
        </Link>

        <div className="flex flex-wrap gap-5 text-sm font-medium">
          <Link href="/" className="hover:text-yellow-300">
            Home
          </Link>
          <Link href="/about" className="hover:text-yellow-300">
            About
          </Link>
          <Link href="/services" className="hover:text-yellow-300">
            Services
          </Link>
          <Link href="/contact" className="hover:text-yellow-300">
            Contact
          </Link>
        </div>
      </nav>
    </header>
  );
}
