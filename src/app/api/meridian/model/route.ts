import { NextRequest, NextResponse } from 'next/server';
import { MeridianWrapper } from '@/lib/meridian';
import { processDataForMeridian, fetchDataFromSource } from '@/lib/python-utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dataSourceId, dataConfig, modelConfig } = body;
    
    // Validate required fields
    if (!dataSourceId) {
      return NextResponse.json(
        { error: 'Missing required field: dataSourceId' },
        { status: 400 }
      );
    }
    
    // Fetch data from the specified data source
    const sourceConfig = {
      type: dataConfig?.type || 'bigquery',
      id: dataSourceId,
      ...dataConfig
    };
    
    // Fetch data from the source
    const sourceData = await fetchDataFromSource(sourceConfig);
    
    if (!sourceData.success) {
      return NextResponse.json(
        { error: `Failed to fetch data: ${sourceData.message}` },
        { status: 400 }
      );
    }
    
    // Process data for Meridian
    const processingConfig = {
      date_column: modelConfig?.dateColumn || 'date',
      target_column: modelConfig?.targetColumn || 'revenue',
      channel_columns: modelConfig?.channelColumns || [],
      control_columns: modelConfig?.controlColumns || []
    };
    
    const processedData = await processDataForMeridian(sourceData.data, processingConfig);
    
    if (!processedData.success) {
      return NextResponse.json(
        { error: `Failed to process data: ${processedData.message}` },
        { status: 400 }
      );
    }
    
    // Initialize Meridian and build model
    const meridian = new MeridianWrapper();
    
    // Load the processed data
    const data = processedData.data;
    meridian.load_data(data);
    
    // Preprocess the data
    meridian.preprocess_data();
    
    // Build and fit the model
    const adstockMaxLag = modelConfig?.adstockMaxLag || 4;
    const hillExponentBound = modelConfig?.hillExponentBound || 3.0;
    
    meridian.build_model(adstockMaxLag, hillExponentBound);
    const modelResults = meridian.fit_model();
    
    // Generate optimal budget allocation if requested
    let budgetAllocation = null;
    if (modelConfig?.optimizeBudget) {
      const totalBudget = modelConfig.totalBudget || 
        Object.values(data.channels).reduce((sum, channel) => sum + Object.values(channel).reduce((channelSum, value) => channelSum + value, 0), 0) * 1.1;
      
      const constraints = modelConfig.budgetConstraints || {};
      
      budgetAllocation = meridian.get_optimal_budget_allocation(totalBudget, constraints);
    }
    
    // Generate report data
    const reportData = meridian.generate_report_data();
    
    // Return the results
    return NextResponse.json({
      message: 'Marketing mix model created successfully',
      model: {
        results: modelResults,
        reportData: reportData,
        budgetAllocation: budgetAllocation
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error creating marketing mix model:', error);
    return NextResponse.json(
      { error: 'Failed to create marketing mix model' },
      { status: 500 }
    );
  }
}
