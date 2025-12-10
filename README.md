
- TaskifyPro
TaskifyPro is a  backend project designed to manage teams, assign tasks, and track progress with secure role-based access. Built with Node.js, Express, and MySQL, it features production-grade authentication — ideal for real-world team management systems.

🚀 Features
- 🔐 JWT Authentication with refresh token flow
- 🧑‍💼 Role-Based Access Control (Admin, Manager, User)
- 📋 Task Assignment with status tracking (pending, in_progress, completed)
- 👥 Team Management: create, join, leave teams
- 📊 Analytics Endpoints:
- /teamTaskStatusSummary/:team_id — task status breakdown
- /teamMemberWithTasks/:team_id — nested user-task mapping
- 🧱 SQL Transactions for atomic operations
- 🧼 Clean Codebase with modular routes, middleware, and validation

🛠️ Tech Stack
-> Backend = Node.js,express
-> DataBase = MySQL
-> Auth = JWT (Access + Refresh)
-> Security = HTTP-only cookies, RBAC
-> Dev Tools = Postman,Git,Dotenv



📂 Folder Structure
taskifyPro/
├── routes/           # Express route handlers
├── controllers/      # Business logic
├── middleware/       # Auth, role checks
├── db/               # MySQL connection
├── .env.example      # Environment variables
└── server.js         # Entry point



🔧 Setup Instructions
- Clone the repo
git clone https://github.com/your-username/taskifyPro.git
- Install dependencies
npm install
- Configure environment
Create a .env file based on .env.example:

JWT_SECRET=yourAccessSecret
REFRESH_TOKEN_SECRET=yourRefreshSecret

- Run the server
npm start

🔐 Authentication Flow
- On login:
- accessToken (15 min) → sent in response
- refreshToken (7 days) → stored in HTTP-only cookie
- On expiry:
- Frontend calls /refreshToken
- Server verifies and issues a new access token


📌 Highlights
- Built with real-world use cases in mind
- Clean commit history and modular code
- Focused on security, scalability, and maintainability


