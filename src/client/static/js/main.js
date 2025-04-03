/**
 * Digital Marketing Reporting Tool - Main JavaScript
 */

document.addEventListener('DOMContentLoaded', function() {
    // Sidebar toggle functionality
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    const content = document.querySelector('.content');

    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
            content.classList.toggle('sidebar-active');
        });
    }

    // Form submission handling
    const reportForm = document.getElementById('reportForm');
    
    if (reportForm) {
        reportForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Show loading indicator
            const submitBtn = reportForm.querySelector('[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Generating...';
            submitBtn.disabled = true;
            
            // Collect form data
            const title = document.getElementById('reportTitle').value;
            const type = document.getElementById('reportType').value;
            const dataSource = document.getElementById('dataSource').value;
            const timePeriod = document.getElementById('timePeriod').value;
            
            // Collect selected channels
            const channelCheckboxes = document.querySelectorAll('input[type="checkbox"]:checked');
            const channels = Array.from(channelCheckboxes).map(checkbox => checkbox.value);
            
            // Create request data
            const requestData = {
                title: title || `${type.charAt(0).toUpperCase() + type.slice(1)} Report - ${new Date().toLocaleDateString()}`,
                type: type,
                period: timePeriod,
                channels: channels,
                data_sources: [
                    {
                        type: dataSource,
                        id: dataSource
                    }
                ],
                metrics: ["impressions", "clicks", "conversions", "revenue"]
            };
            
            // Send API request
            fetch('/api/reports/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(requestData)
            })
            .then(response => response.json())
            .then(data => {
                // Reset form state
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                
                if (data.status === 'success') {
                    // Redirect to the new report
                    window.location.href = data.report_url;
                } else {
                    // Show error message
                    alert('Error generating report: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                alert('An error occurred while generating the report.');
            });
        });
    }
    
    // Data source selection handling
    const dataSourceSelect = document.getElementById('dataSource');
    
    if (dataSourceSelect) {
        dataSourceSelect.addEventListener('change', function() {
            // This would typically show/hide specific configuration options
            // based on the selected data source
            const selectedSource = this.value;
            
            // Example: Handle different data source selections
            if (selectedSource === 'bigquery') {
                // Show BigQuery-specific options, fetch datasets, etc.
                fetchBigQueryDatasets();
            } else if (selectedSource === 'spreadsheet') {
                // Show Spreadsheet-specific options, fetch spreadsheets, etc.
                fetchSpreadsheets();
            } else if (selectedSource === 'database') {
                // Show Database-specific options, fetch tables, etc.
                fetchDatabaseTables();
            }
        });
    }
    
    // Custom date range handling
    const timePeriodSelect = document.getElementById('timePeriod');
    
    if (timePeriodSelect) {
        timePeriodSelect.addEventListener('change', function() {
            if (this.value === 'custom') {
                // Would show date picker UI
                console.log('Custom date range selected');
            }
        });
    }
});

// Fetch BigQuery datasets (placeholder function)
function fetchBigQueryDatasets() {
    fetch('/api/data-sources/bigquery/datasets')
        .then(response => response.json())
        .then(data => {
            console.log('BigQuery datasets:', data);
            // Would populate a select element with the datasets
        })
        .catch(error => console.error('Error fetching datasets:', error));
}

// Fetch Google Spreadsheets (placeholder function)
function fetchSpreadsheets() {
    fetch('/api/data-sources/spreadsheets/list')
        .then(response => response.json())
        .then(data => {
            console.log('Spreadsheets:', data);
            // Would populate a select element with the spreadsheets
        })
        .catch(error => console.error('Error fetching spreadsheets:', error));
}

// Fetch Database tables (placeholder function)
function fetchDatabaseTables() {
    fetch('/api/data-sources/database/tables')
        .then(response => response.json())
        .then(data => {
            console.log('Database tables:', data);
            // Would populate a select element with the tables
        })
        .catch(error => console.error('Error fetching tables:', error));
} 