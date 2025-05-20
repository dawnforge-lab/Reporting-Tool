# Development Tasks

## Phase 1: Minimum Viable Product (MVP)
**(Target: 2-3 months)**

- [ ] **User Authentication and Authorization (P0)**
  - [ ] Backend: Design and implement API endpoints for user registration (email/password) and login; Implement secure password hashing and storage; Implement session management.
  - [ ] Database: Design schema for user accounts.
  - [ ] Frontend: Develop UI for registration and login forms; Implement client-side logic for handling authentication tokens and session state.
  - [ ] Testing: Unit tests for authentication logic (backend); Integration tests for registration/login flow.
- [ ] **Data Source Management (P0 - Core for CSV & Google Sheets)**
  - [ ] Backend: Design and implement API endpoints for uploading CSVs, Google Sheets OAuth, storing/managing connection details, secure credential storage, listing and deleting connections; Develop CSV parsers and Google Sheets API integration.
  - [ ] Database: Design schema for data source connections.
  - [ ] Frontend: Develop UI for listing sources, CSV upload wizard, Google Sheets connection wizard (OAuth), displaying status, and removing connections.
  - [ ] Testing: Unit tests for CSV parsing and Google Sheets API interaction; Integration tests for connecting, listing, and deleting data sources.
- [ ] **Reporting Engine (P1 - Basic Template)**
  - [ ] Backend: Design and implement API endpoints for generating a basic performance report, allowing data source selection and date range selection; Develop logic to fetch and process data.
  - [ ] Database: (Potentially) Schema for saved report configurations.
  - [ ] Frontend: Develop UI to display basic performance report (charts, tables), allow data source selection, and implement a date range selector.
  - [ ] Testing: Unit tests for report generation logic; Integration tests for viewing a report with data from CSV and Google Sheets.

## Phase 2: Expanding Core
**(Target: Next 2-3 months)**

- [ ] **AI Insights Module (P1 - Basic Insights)**
  - [ ] Backend: Integrate with DeepSeek model API; Design and implement API endpoints for triggering insight generation and user feedback; Develop logic for data formatting, prompting DeepSeek, and processing responses.
  - [ ] Database: Schema for storing generated insights and insight feedback.
  - [ ] Frontend: Develop UI to display AI-generated insights and allow user feedback.
  - [ ] Testing: Unit tests for DeepSeek integration and feedback mechanism; Integration tests for generating and displaying insights.
- [ ] **Data Source Management (P2 - Add BigQuery Connector)**
  - [ ] Backend: Extend API for BigQuery connection type; Implement OAuth for BigQuery; Securely store BigQuery credentials; Develop logic to query BigQuery datasets/tables.
  - [ ] Frontend: Update UI wizard for BigQuery option and BigQuery specific connection parameters.
  - [ ] Testing: Unit tests for BigQuery API interaction; Integration tests for connecting to BigQuery and fetching sample data.
- [ ] **Reporting Engine (P1 - Enhancements)**
  - [ ] Backend: Develop logic for a new report template (e.g., Channel Comparison); Extend report generation API for metric/dimension selection; Implement logic for saving report configurations.
  - [ ] Database: Implement/refine schema for saved report configurations.
  - [ ] Frontend: Develop UI for the new report template; Implement UI for selecting metrics/dimensions and for saving/loading report configurations.
  - [ ] Testing: Unit tests for new report template and customization logic; Integration tests for creating, customizing, and saving reports.

## Phase 3: Advanced Features & Polish
**(Target: Next 2-3 months)**

- [ ] **Marketing Mix Modeling (P2 - Basic Meridian Integration)**
  - [ ] Backend: Set up Meridian library; Design and implement API endpoints for guided MMM setup, triggering model execution, and retrieving/formatting results; Develop data preparation logic for Meridian.
  - [ ] Frontend: Develop UI for guided MMM workflow; Display MMM results (charts, tables); Include tooltips/help text.
  - [ ] Testing: Unit tests for Meridian data preparation and result processing; Integration tests for a complete MMM workflow.
- [ ] **Data Source Management (P2 - Add Database Connector)**
  - [ ] Backend: Extend API for database connection type (e.g., PostgreSQL); Implement logic for connecting to PostgreSQL with user credentials; Securely store credentials; Develop logic for querying tables/views.
  - [ ] Frontend: Update UI wizard for PostgreSQL option and database connection parameters form.
  - [ ] Testing: Unit tests for PostgreSQL connection and querying; Integration tests for connecting to PostgreSQL and fetching sample data.
- [ ] **UI/UX Refinement & Comprehensive Testing**
  - [ ] Tasks: Collect and analyze user feedback; Prioritize and implement UI/UX improvements; Conduct end-to-end testing; Perform usability testing sessions; Address outstanding bugs/performance issues.

## Cross-Cutting Concerns (Applicable to all Phases)
- [ ] Security: Adherence to best practices for auth, data storage, APIs.
- [ ] Scalability & Performance: Design systems for scalability.
- [ ] Error Handling & Logging: Implement robust error handling and logging.
- [ ] Documentation: Maintain internal technical documentation.
- [ ] Deployment & CI/CD: Set up CI/CD pipeline.
