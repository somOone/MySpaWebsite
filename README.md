# MySpaWebsite

A comprehensive spa management system built with React frontend and Node.js backend, featuring appointment booking, management, and an intelligent chatbot interface.

## 🚀 Features

### Core Appointment Management
- **Appointment Booking**: Interactive calendar with real-time availability
- **Appointment Editing**: Modify service categories and automatic price updates
- **Appointment Completion**: Mark appointments as completed with tip collection
- **Appointment Cancellation**: Soft-delete appointments with reason tracking
- **Client Database**: Store and manage client information

### Intelligent Chatbot Interface
- **Natural Language Processing**: Understand appointment requests in plain English
- **Multi-Workflow Support**: Handle booking, editing, completion, and cancellation
- **Interactive Confirmation**: Step-by-step confirmation for all actions
- **Smart Intent Recognition**: Automatically classify user requests

### Advanced Features
- **Real-time Validation**: Business rule enforcement and conflict prevention
- **Responsive Design**: Modern, mobile-friendly interface
- **Accessibility**: WCAG compliant components and navigation
- **Comprehensive Testing**: 218 tests covering all functionality

## 🏗️ Architecture

- **Frontend**: React.js with modern hooks and functional components
- **Backend**: Node.js with Express.js framework and comprehensive validation
- **Database**: SQLite with automatic initialization and data integrity
- **Chat Interface**: Intelligent chatbot with natural language processing
- **Testing**: Jest with comprehensive coverage across all components

## 📁 Project Structure

```
MySpaWebsite/
├── frontend/          # React frontend application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── chatbot/      # ChatBot and workflow components
│   │   │   └── __tests__/    # Component test suites
│   │   ├── pages/            # Main application pages
│   │   ├── shared/           # Utility functions and constants
│   │   └── App.js            # Main application component
│   └── tests/                # Integration and E2E tests
├── backend/           # Node.js backend server
│   ├── routes/        # API endpoint definitions
│   ├── utils/         # Database and utility functions
│   └── validation/    # Business rule validation
├── database/          # SQLite database files
├── docs/              # Documentation and validation rules
└── utils/             # Shared utility functions
```

## 🛠️ Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

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

## 🤖 Chatbot Commands

The intelligent chatbot supports natural language commands for all appointment operations:

### Appointment Cancellation
- `"cancel appointment for Sarah at 10:00 AM on August 16th"`
- `"cancel appointment for Sarah at 10:00 AM on August 16th 2025"`
- `"yes"` (to confirm cancellation)

### Appointment Completion
- `"complete appointment for Sarah at 10:00 AM on August 16th"`
- `"tip amount: $25"` (when prompted)
- `"yes"` (to confirm completion)

### Appointment Editing
- `"edit appointment for Sarah at 10:00 AM on August 16th"`
- `"change to massage"` (or "facial", "combo")
- `"yes"` (to confirm changes)

### General Commands
- `"that's all"` (to stop the bot)
- `"help"` (for assistance)

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

## 🧪 Testing & Quality Assurance

### Test Coverage
- **Total Tests**: 218 tests across all functionality
- **Test Categories**: Accessibility, Visual, Responsive, Functional, Utility
- **Coverage Areas**: Components, Pages, Shared utilities, ChatBot workflows
- **Quality Metrics**: All tests passing, comprehensive validation

### Test Suites
- **Accessibility Tests**: WCAG compliance and screen reader support
- **Visual Tests**: Component rendering and styling verification
- **Responsive Tests**: Mobile and tablet compatibility
- **Functional Tests**: Core business logic and user workflows
- **Integration Tests**: Component interaction and data flow

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
- **Soft Deletion**: Cancelled appointments are preserved for audit trails
- **Change Tracking**: All modifications are timestamped and logged

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
