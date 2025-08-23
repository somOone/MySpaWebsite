# MySpaWebsite

A comprehensive spa management system built with React frontend and Node.js backend, featuring appointment booking, expense tracking, and an AI-powered chatbot interface with machine learning capabilities.

## 🚀 Features

### Core Appointment Management
- **Appointment Booking**: Interactive calendar with real-time availability
- **Appointment Editing**: Modify service categories and automatic price updates
- **Appointment Completion**: Mark appointments as completed with tip collection
- **Appointment Cancellation**: Soft-delete appointments with reason tracking
- **Client Database**: Store and manage client information

### Comprehensive Expense Management
- **Expense Tracking**: Add, edit, and delete business expenses with categories
- **Expense Categories**: Supplies, Equipment, Services, Marketing, Other
- **Inline Editing**: Quick edit amounts, dates, descriptions, and categories
- **Search & Filter**: Find expenses by description, date, and year
- **Financial Reports**: Integrated with appointment data for complete financial overview

### AI-Powered Chatbot Interface
- **Machine Learning**: Advanced intent classification with 1000+ training examples
- **Natural Language Processing**: Understand requests in plain English
- **Multi-Domain Support**: Handle appointments, expenses, and help requests
- **Interactive Help System**: Guide users through available commands
- **Smart Intent Recognition**: Keyword extraction and confidence scoring
- **Training Engine**: Self-improving ML model with performance analytics

### Automated Reminders & Notifications
- **Morning Digest SMS**: Daily 7 AM appointment summaries via TextBelt
- **Free SMS Service**: 1 free SMS per day with no credit card required
- **Smart Scheduling**: Automated daily reminders using cron jobs
- **Appointment Summaries**: Client names, services, times, and payments
- **Timezone Support**: Configurable scheduling for different regions

### Advanced Features
- **Real-time Validation**: Business rule enforcement and conflict prevention
- **Responsive Design**: Modern, mobile-friendly interface
- **Accessibility**: WCAG compliant components and navigation
- **Comprehensive Testing**: 291 tests covering all functionality
- **Auto-Focus Features**: Smart page navigation and element focusing

## 🏗️ Architecture

- **Frontend**: React.js with modern hooks and functional components
- **Backend**: Node.js with Express.js framework and comprehensive validation
- **Database**: SQLite with automatic initialization and data integrity
- **AI Interface**: ML-powered chatbot with training engine and intent classification
- **Testing**: Jest with comprehensive coverage across all components
- **Training System**: Custom ML model with 1000+ natural language examples

## 📁 Project Structure

```
MySpaWebsite/
├── frontend/          # React frontend application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── chatbot/      # ChatBot and workflow components
│   │   │   │   ├── training/ # ML training engine and dataset
│   │   │   │   └── hooks/    # Custom React hooks for AI
│   │   │   └── __tests__/    # Component test suites
│   │   ├── pages/            # Main application pages
│   │   ├── shared/           # Utility functions and constants
│   │   └── App.js            # Main application component
│   └── tests/                # Integration and E2E tests
├── backend/           # Node.js backend server
│   ├── routes/        # API endpoint definitions
│   │   ├── appointments.js   # Appointment management API
│   │   └── expenses.js       # Expense management API
│   ├── utils/         # Database and utility functions
│   ├── services/      # Automated services (morning digest)
│   └── validation/    # Business rule validation
├── database/          # SQLite database files
├── docs/              # Documentation and validation rules
└── utils/             # Shared utility functions
```

## 🛠️ Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- TextBelt account (free) for SMS notifications

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/somOone/MySpaWebsite.git
   cd MySpaWebsite
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Start the backend server**
   ```bash
   cd ../backend
   npm start
   ```

5. **Configure Morning Digest SMS (Optional)**
   ```bash
   # Create .env file in backend folder
   echo "OWNER_PHONE_NUMBER=1234567890" > .env
   echo "TEXTBELT_API_KEY=textbelt_test" >> .env
   
   # Get free API key from textbelt.com for real SMS delivery
   # Test endpoint: http://localhost:5001/api/test/morning-digest
   ```

5. **Start the frontend application**
   ```bash
   cd ../frontend
   npm start
   ```

## 🌐 Usage

- **Frontend**: Access at `http://localhost:3000`
- **Backend API**: Running on `http://localhost:5001`
- **Database**: Automatically initialized on first run

## 📅 Appointment Management

### Booking Appointments
- **Interactive Calendar**: Select available dates with real-time availability
- **Time Slot Selection**: Choose from available 1-hour slots (2:00 PM - 8:00 PM)
- **Service Categories**: Facial ($100), Massage ($120), or Facial + Massage ($200)
- **Conflict Prevention**: Automatic 30-minute gap enforcement between appointments
- **Business Rules**: No Sunday bookings, 45-day advance limit, no past dates

### Managing Appointments
- **Edit Appointments**: Change service categories with automatic price updates
- **Complete Appointments**: Mark as completed with optional tip collection
- **Cancel Appointments**: Soft-delete with reason tracking and confirmation
- **Status Tracking**: Real-time updates for pending, completed, and cancelled appointments

### Website Interface
- **Appointments Page**: View all appointments with filtering and search
- **Booking Modal**: Interactive calendar and form for new appointments
- **Edit Mode**: Inline editing for appointment details
- **Tip Collection**: Modal for collecting tips during completion

## 💰 Expense Management

### Expense Tracking
- **Add Expenses**: Create new business expenses with categories
- **Edit Expenses**: Modify amounts, dates, descriptions, and categories
- **Delete Expenses**: Remove expenses with confirmation workflow
- **Search Functionality**: Find expenses by description and date

### Expense Categories
- **Supplies**: Cleaning products, spa materials, office supplies ($)
- **Equipment**: Spa equipment, maintenance tools, technology ($)
- **Services**: Professional services, maintenance, utilities ($)
- **Marketing**: Advertising, promotions, social media ($)
- **Other**: Miscellaneous business expenses ($)

### Expense Interface
- **Expenses Page**: View all expenses organized by date with expand/collapse
- **Expense Modal**: Add new expenses with category selection
- **Inline Editing**: Quick edit mode for all expense fields
- **Search & Filter**: Real-time search with date and year filtering

## 🤖 AI-Powered Chatbot Commands

The AI-powered chatbot supports natural language commands for appointments, expenses, and help requests with machine learning intent recognition:

### Appointment Management
#### Booking Appointments
- `"book a new appointment"` or `"I want to schedule an appointment"`
- `"create a booking"` or `"make an appointment"`

#### Cancelling Appointments
- `"cancel appointment for Sarah at 10:00 AM on August 16th"`
- `"cancel appointment for Sarah at 10:00 AM on August 16th 2025"`
- `"yes"` (to confirm cancellation)

#### Completing Appointments
- `"complete appointment for Sarah at 10:00 AM on August 16th"`
- `"tip amount: $25"` (when prompted)
- `"yes"` (to confirm completion)

#### Editing Appointments
- `"edit appointment for Sarah at 10:00 AM on August 16th"`
- `"change to massage"` (or "facial", "combo")
- `"yes"` (to confirm changes)

#### Viewing Appointments
- `"show my appointments for today"` or `"what appointments do I have today"`
- `"show me today's schedule"`

### Expense Management
#### Adding Expenses
- `"add a new expense"` or `"I want to add an expense"`
- `"create a new cost"` or `"log an expense"`

#### Editing Expenses
- `"change expense cleaning supplies on August 21st to $50.00"` (direct amount change)
- `"change expense cleaning supplies on August 21st"` (opens inline editor)

#### Deleting Expenses
- `"delete expense office supplies on March 15th"`
- `"remove expense cleaning supplies on August 21st"`
- `"yes"` (to confirm deletion)

### Help & Guidance
#### General Help
- `"help"` or `"what can you do"`
- `"what are your capabilities"`

#### How-To Questions
- `"How can I add a new appointment?"`
- `"How can I change an expense?"`
- `"How can I cancel an appointment?"`
- `"How can I see today's appointments?"`

### AI Features
- **Natural Language Understanding**: Supports variations like "I need to...", "Can you...", "Please..."
- **Smart Intent Recognition**: Automatically classifies requests using ML
- **Context Awareness**: Remembers conversation state across multi-step workflows
- **Training Data**: 1000+ examples for accurate intent classification

## 🔒 Business Rules & Validation

### Appointment Scheduling
- **Operating Hours**: 2:00 PM - 8:00 PM only
- **Duration**: All appointments are exactly 1 hour
- **Spacing**: Minimum 30-minute gap between appointments
- **Advance Booking**: Maximum 45 days in advance
- **Restrictions**: No Sunday appointments, no past dates

### Service Categories & Pricing
- **Facial**: $100.00
- **Massage**: $120.00  
- **Facial + Massage**: $200.00
- **Automatic Calculation**: Prices update automatically when categories change

### Status Management
- **Pending**: Can be edited, completed, or cancelled
- **Completed**: Cannot be modified (locked status)
- **Cancelled**: Cannot be modified (locked status)

### Expense Business Rules
- **Required Fields**: Date, description, amount, category
- **Amount Validation**: Must be positive numbers with proper decimal formatting
- **Date Restrictions**: Cannot be future dates beyond current day
- **Category Validation**: Must select from predefined active categories
- **Description Requirements**: Non-empty, meaningful descriptions required

## 🧪 Testing & Quality Assurance

### Test Coverage
- **Total Tests**: 291 tests across all functionality
- **Frontend Tests**: 259 tests covering UI, components, and workflows
- **Backend Tests**: 32 tests covering API endpoints and database operations
- **Test Categories**: Accessibility, Visual, Responsive, Functional, Utility, AI/ML
- **Coverage Areas**: Components, Pages, Shared utilities, ChatBot workflows, Training engine
- **Quality Metrics**: All tests passing, comprehensive validation

### Test Suites
- **Accessibility Tests**: WCAG compliance and screen reader support
- **Visual Tests**: Component rendering and styling verification
- **Responsive Tests**: Mobile and tablet compatibility
- **Functional Tests**: Core business logic and user workflows
- **Integration Tests**: Component interaction and data flow
- **AI/ML Tests**: Intent classification, training engine, and ML model validation
- **API Tests**: Backend validation, database operations, and endpoint testing

## 🔧 Configuration

- **Database**: `./database/spa.db` (SQLite)
- **Backend Port**: 5001
- **Frontend Port**: 3000
- **Time Format**: 12-hour format (AM/PM)
- **Date Format**: ISO8601 (YYYY-MM-DD)

## 📚 Documentation

### Validation Rules
- **`docs/booking_validation_rules.mdc`**: Appointment booking business rules
- **`docs/editing_validation_rules.mdc`**: Appointment editing validation
- **`docs/completion_validation_rules.mdc`**: Appointment completion rules
- **`docs/cancellation_validation_rules.mdc`**: Cancellation business logic
- **`docs/expense_validation_rules.mdc`**: Expense management validation rules

### AI & Training
- **`frontend/src/components/chatbot/training/training_dataset.js`**: 1000+ ML training examples
- **`frontend/src/components/chatbot/training/trainingEngine.js`**: ML model training logic
- **AI Training Dashboard**: Built-in interface for model performance monitoring

### Test Coverage
- **`docs/test_coverage_report.md`**: Comprehensive testing analysis
- **Coverage Reports**: HTML coverage reports in `frontend/coverage/`

## 🚨 Security & Data Integrity

### Validation Layers
- **Frontend Validation**: Real-time user input validation
- **Backend Validation**: Server-side business rule enforcement
- **Database Constraints**: Data integrity and relationship management

### Access Control
- **Status-based Permissions**: Only pending appointments can be modified
- **Expense Security**: Full CRUD validation with category verification
- **Soft Deletion**: Cancelled appointments are preserved for audit trails
- **Change Tracking**: All modifications are timestamped and logged
- **Data Integrity**: Foreign key constraints and referential integrity

### AI Security
- **Input Sanitization**: All chatbot inputs validated and sanitized
- **Intent Verification**: ML classifications verified before execution
- **Training Data**: Secure storage of training examples with no sensitive data

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**somOone** - [GitHub Profile](https://github.com/somOone)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

### Development Guidelines
- Follow existing code patterns and architecture
- Write tests for new functionality
- Update documentation for API changes
- Ensure all tests pass before submitting PRs 
