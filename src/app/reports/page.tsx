import Link from "next/link";

export default function Reports() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Reports</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
          Create New Report
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <p className="text-gray-700 mb-4">
          Create and view reports across multiple marketing channels. Generate insights and visualizations to better understand your marketing performance.
        </p>
        
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Recent Reports</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-blue-600">Q1 Marketing Performance</h3>
              <p className="text-gray-600 mt-2">Performance analysis across all channels for Q1 2025.</p>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-sm text-gray-500">Created: Apr 1, 2025</span>
                <Link href="/reports/sample-report" className="text-blue-600 hover:text-blue-800">View</Link>
              </div>
            </div>
            
            <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-blue-600">Social Media Analysis</h3>
              <p className="text-gray-600 mt-2">Detailed analysis of social media campaign performance.</p>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-sm text-gray-500">Created: Mar 15, 2025</span>
                <Link href="/reports/sample-report" className="text-blue-600 hover:text-blue-800">View</Link>
              </div>
            </div>
            
            <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-blue-600">PPC Campaign ROI</h3>
              <p className="text-gray-600 mt-2">Return on investment analysis for PPC campaigns.</p>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-sm text-gray-500">Created: Mar 10, 2025</span>
                <Link href="/reports/sample-report" className="text-blue-600 hover:text-blue-800">View</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Report Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-blue-600">Performance Overview</h3>
            <p className="text-gray-600 mt-2">General performance metrics across all channels.</p>
            <button className="mt-4 text-blue-600 hover:text-blue-800">Use Template</button>
          </div>
          
          <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-blue-600">Channel Comparison</h3>
            <p className="text-gray-600 mt-2">Compare performance across different marketing channels.</p>
            <button className="mt-4 text-blue-600 hover:text-blue-800">Use Template</button>
          </div>
          
          <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-blue-600">Campaign Analysis</h3>
            <p className="text-gray-600 mt-2">Detailed analysis of specific marketing campaigns.</p>
            <button className="mt-4 text-blue-600 hover:text-blue-800">Use Template</button>
          </div>
          
          <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-blue-600">ROI Report</h3>
            <p className="text-gray-600 mt-2">Return on investment analysis for marketing activities.</p>
            <button className="mt-4 text-blue-600 hover:text-blue-800">Use Template</button>
          </div>
          
          <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-blue-600">Custom Report</h3>
            <p className="text-gray-600 mt-2">Create a fully customized report with selected metrics.</p>
            <button className="mt-4 text-blue-600 hover:text-blue-800">Use Template</button>
          </div>
        </div>
      </div>
    </div>
  );
}
