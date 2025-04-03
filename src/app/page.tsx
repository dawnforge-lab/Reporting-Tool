import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen">
      <header className="bg-blue-600 text-white py-6 shadow-md">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">Digital Marketing Reporting Tool</h1>
          <p className="mt-2">Multichannel reporting with AI-powered insights</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-semibold mb-6">Welcome to the Digital Marketing Reporting Tool</h2>
        <p className="mb-8 text-gray-700">
          Access your marketing data, generate reports, and get AI-powered insights all in one place.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold text-blue-600 mb-3">Data Sources</h2>
            <p className="text-gray-600 mb-4">
              Connect to your marketing data sources like Google Analytics, Facebook Ads, and more.
            </p>
            <Link 
              href="/data-sources" 
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Manage Sources
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold text-blue-600 mb-3">Reports</h2>
            <p className="text-gray-600 mb-4">
              Create and customize reports across multiple channels and platforms.
            </p>
            <Link 
              href="/reports" 
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              View Reports
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold text-blue-600 mb-3">AI Insights</h2>
            <p className="text-gray-600 mb-4">
              Get AI-powered recommendations and insights from your marketing data.
            </p>
            <Link 
              href="/insights" 
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Generate Insights
            </Link>
          </div>
        </div>

        <div className="mt-12 bg-gray-100 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">System Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium">Server Status:</span>
              <span className="text-green-600">Online</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium">API Version:</span>
              <span>1.0.0</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium">Last Updated:</span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
