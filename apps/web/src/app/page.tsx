import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-5xl font-bold text-blue-600">Cloud PA</h1>
        <p className="text-xl text-gray-600">
          Chat-first micro-CRM for micro businesses
        </p>
        <p className="text-gray-500">
          Turn chats → leads → follow-ups → quotes → customers
        </p>
        <div className="flex gap-4 justify-center mt-8">
          <Link href="/login" className="btn">
            Login
          </Link>
          <Link href="/signup" className="btn-secondary">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}

