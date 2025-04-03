import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="text-xl font-bold">
            Marketing Reporting Tool
          </Link>
          <div className="flex space-x-6">
            <Link href="/data-sources" className="hover:text-blue-200 transition-colors">
              Data Sources
            </Link>
            <Link href="/reports" className="hover:text-blue-200 transition-colors">
              Reports
            </Link>
            <Link href="/insights" className="hover:text-blue-200 transition-colors">
              Insights
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
