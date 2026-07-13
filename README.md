# Sarangi Project

Welcome to the **Sarangi Project**! This project is a comprehensive web application designed for consultancy and advisory services. It features a modern, responsive frontend and a robust Node.js backend, powered by a MySQL database.

## 🚀 Project Overview

The Sarangi Project is built to provide a seamless experience for users seeking professional services across various industries. It includes user and admin dashboards, integrated AI capabilities (Sara Chatbot), secure authentication, and data management features.

## 📂 Project Structure

The repository is organized into several key directories:

```text
sarangi-project/
├── frontend/               # Vanilla HTML, CSS, and JavaScript files for the UI
│   ├── index.html          # Main landing page
│   ├── login.html / register.html # Authentication pages
│   ├── user-dashboard.html # Dashboard for users
│   ├── admin-dashboard.html# Dashboard for administrators
│   ├── sara-chatbot.*      # AI Chatbot integration
│   ├── images/             # Static assets and images
│   └── ...                 # Various industry and service-specific pages
│
├── backend/                # Node.js & Express API server
│   ├── controllers/        # Request handlers and business logic
│   ├── models/             # Sequelize database models
│   ├── routes/             # Express API route definitions
│   ├── services/           # Reusable backend services
│   ├── middlewares/        # Custom middlewares (e.g., authentication)
│   ├── config/             # Configuration files
│   ├── utils/              # Utility functions
│   └── server.js / app.js  # Server entry points
│
├── database/               # Database initialization and management scripts
├── docs/                   # Project documentation
├── infrastructure/         # Infrastructure and deployment configurations
├── scripts/                # Utility scripts for the project
├── docker-compose.yml      # Docker configuration for standing up the MySQL database
└── package.json            # Root configuration for concurrently running the app
```

## 🛠️ Technology Stack

### Frontend
- **HTML5, CSS3, JavaScript (ES6+)**: Core technologies for the user interface.
- **Serve**: A static file server used to serve the frontend during development.

### Backend
- **Node.js & Express.js**: Server environment and web framework.
- **Sequelize**: Promise-based Node.js ORM for MySQL.
- **MySQL (via Docker)**: Relational database management system.
- **JWT (JSON Web Tokens) & bcrypt**: For secure user authentication and password hashing.
- **Multer**: For handling multipart/form-data (file uploads).
- **Google GenAI**: Integrated AI features (e.g., for the chatbot).
- **PDFKit, ExcelJS, json2csv**: Tools for generating reports and exporting data.
- **QR Code**: For generating QR codes dynamically.

## ⚙️ Development Workflow & Setup

Follow these steps to set up and run the project locally on your machine.

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [Docker Desktop](https://www.docker.com/products/docker-desktop) (for running the MySQL database)

### 1. Start the Database
The project uses Docker to easily spin up a MySQL database.
```bash
# From the root directory, start the database container in detached mode
docker-compose up -d
```
*Note: The database runs on `localhost:3306` with root password `password` and database name `sarangi_db` by default (as configured in `docker-compose.yml`).*

### 2. Install Dependencies
You need to install dependencies for both the root project workspace and the backend.
```bash
# Install root dependencies (concurrently, serve)
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 3. Environment Configuration
Navigate to the `backend` directory and set up your environment variables.
```bash
# Copy the example env file
cd backend
cp .env.example .env
```
Edit the `.env` file to match your local setup (database credentials, JWT secrets, API keys, etc.).

### 4. Run the Application
The root `package.json` includes scripts to run both the frontend and backend simultaneously using `concurrently`.

```bash
# From the root of the project
npm run dev
```

This command will:
1. Start the Node.js backend using `nodemon` (auto-reloads on file changes).
2. Serve the `frontend` directory on `http://localhost:8080`.

## 🧑‍💻 Contributing and Development

- **Frontend Changes**: Modify files in the `/frontend` directory. Changes to HTML/CSS/JS will be reflected immediately when you refresh the browser on `http://localhost:8080`.
- **Backend Changes**: Modify files in the `/backend` directory. `nodemon` will automatically restart the server when changes are detected.
- **Database Changes**: Update Sequelize models in `/backend/models`. If you need to seed data, check for scripts like `backend/seed-consultants.js`.