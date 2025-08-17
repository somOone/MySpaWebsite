# MySpaWebsite

A comprehensive spa management system built with React frontend and Node.js backend, featuring appointment booking, management, and an intelligent chatbot interface.

## 🚀 Features

- **Appointment Management**: Book, edit, complete, and cancel appointments
- **Client Database**: Store and manage client information
- **Intelligent Chatbot**: Natural language appointment management via chat
- **Responsive Design**: Modern, mobile-friendly interface
- **Real-time Updates**: Live appointment status updates

## 🏗️ Architecture

- **Frontend**: React.js with modern hooks and functional components
- **Backend**: Node.js with Express.js framework
- **Database**: SQLite with automatic initialization
- **Chat Interface**: Intelligent chatbot with natural language processing

## 📁 Project Structure

```
MySpaWebsite/
├── frontend/          # React frontend application
├── backend/           # Node.js backend server
├── database/          # SQLite database files
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

## 🤖 Chatbot Commands

The intelligent chatbot supports natural language commands:

- `"cancel appointment for Sarah at 10:00 AM on August 16th"`
- `"cancel appointment for Sarah at 10:00 AM on August 16th 2025"`
- `"yes"` (to confirm actions)
- `"that's all"` (to stop the bot)

## 🔧 Configuration

- Database path: `./database/spa.db`
- Backend port: 5001
- Frontend port: 3000

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
