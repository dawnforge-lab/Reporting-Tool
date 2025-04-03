import Link from "next/link";

export default function Insights() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">AI Insights</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
          Generate New Insights
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <p className="text-gray-700 mb-4">
          Get AI-powered insights and recommendations based on your marketing data. Our advanced algorithms analyze your data to identify trends, anomalies, and opportunities.
        </p>
        
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Recent Insights</h2>
          
          <div className="space-y-6">
            <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between">
                <h3 className="text-lg font-semibold text-blue-600">Social Media Engagement Spike</h3>
                <span className="text-sm text-gray-500">Generated: Apr 2, 2025</span>
              </div>
              <p className="text-gray-600 mt-3">
                There was a significant increase in social media engagement over the past week, particularly on Instagram. This correlates with the launch of your new product campaign.
              </p>
              <div className="mt-4 bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-700">Recommendation</h4>
                <p className="text-blue-600 mt-1">
                  Consider allocating more resources to Instagram for the remainder of this campaign to capitalize on the higher engagement rates.
                </p>
              </div>
            </div>
            
            <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between">
                <h3 className="text-lg font-semibold text-blue-600">Conversion Rate Anomaly</h3>
                <span className="text-sm text-gray-500">Generated: Mar 28, 2025</span>
              </div>
              <p className="text-gray-600 mt-3">
                The conversion rate for your Google Ads campaigns dropped by 15% last week despite stable click-through rates. Analysis suggests this may be due to recent landing page changes.
              </p>
              <div className="mt-4 bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-700">Recommendation</h4>
                <p className="text-blue-600 mt-1">
                  Review recent landing page changes and consider A/B testing to identify which elements are impacting conversion rates.
                </p>
              </div>
            </div>
            
            <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between">
                <h3 className="text-lg font-semibold text-blue-600">Channel Attribution Analysis</h3>
                <span className="text-sm text-gray-500">Generated: Mar 20, 2025</span>
              </div>
              <p className="text-gray-600 mt-3">
                Multi-touch attribution analysis shows that email marketing is playing a larger role in conversions than previously thought. Email touchpoints are present in 45% of conversion paths.
              </p>
              <div className="mt-4 bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-700">Recommendation</h4>
                <p className="text-blue-600 mt-1">
                  Increase investment in email marketing campaigns and focus on optimizing email sequences for higher engagement and conversion rates.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Insight Types</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-blue-600">Performance Insights</h3>
            <p className="text-gray-600 mt-2">Analyze marketing performance across channels and campaigns.</p>
            <button className="mt-4 text-blue-600 hover:text-blue-800">Generate</button>
          </div>
          
          <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-blue-600">Attribution Models</h3>
            <p className="text-gray-600 mt-2">Understand how different channels contribute to conversions.</p>
            <button className="mt-4 text-blue-600 hover:text-blue-800">Generate</button>
          </div>
          
          <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-blue-600">Anomaly Detection</h3>
            <p className="text-gray-600 mt-2">Identify unusual patterns or outliers in your marketing data.</p>
            <button className="mt-4 text-blue-600 hover:text-blue-800">Generate</button>
          </div>
          
          <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-blue-600">Trend Analysis</h3>
            <p className="text-gray-600 mt-2">Discover long-term trends and seasonal patterns in your data.</p>
            <button className="mt-4 text-blue-600 hover:text-blue-800">Generate</button>
          </div>
          
          <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-blue-600">Forecasting</h3>
            <p className="text-gray-600 mt-2">Predict future performance based on historical data.</p>
            <button className="mt-4 text-blue-600 hover:text-blue-800">Generate</button>
          </div>
        </div>
      </div>
    </div>
  );
}
