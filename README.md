🎓 AIMS Portal – Academic Information Management System

AIMS Portal is a full-stack web application designed to digitize and streamline academic processes such as course enrollment, approvals, transcript generation, and role-based academic management for Students, Instructors, Faculty Advisors, and Admins.


🚀 Features

1. Student

•View available courses

•Send enrollment requests

•Students have drop, withdraw course option as well

•Track enrollment status (Pending Instructor → Pending FA → Approved)

•View academic record & transcript

•Download transcript (PDF)

•Search, filter, and sort courses


2. Instructor

•Add courses (with slot clash detection)

•View enrolled students

•Approve / Reject enrollment requests

•Bulk approval support

•Assign coordinator among instructors

•Download students detail in excel, write down the grades and upload the excel sheet directly as grade submission on website, grades would appear in students records.


3. Faculty Advisor

•Final approval authority for enrollments of students as well as courses

•Acts as Instructor if assigned


4. Admin

•Approve Instructor & Faculty Advisor profiles

•View active users


System Level

•Role-based access control

•OTP based signup

•Protected routes

•JWT Authentication

•Multi-tab logout handling(Session control)

•RESTful APIs

Tech Stack

  Frontend
  
    •React.js
    
    •Axios
    
    •Tailwind CSS

  Backend
  
    •Node.js
    
    •Express.js
    
    •MongoDB
    
    •Mongoose

Authentication & Security

•JWT (JSON Web Tokens)

•bcrypt

•CORS

📦 Supporting Libraries

•express

•mongoose

•cors

•jsonwebtoken

•bcryptjs

•dotenv

•multer (for file handling if used)

•nodemon

•axios

•react-router-dom

•tailwindcss

⚙️ Prerequisites

Make sure you have installed:

Node.js (v18+ recommended)

MongoDB (local or cloud MongoDB Atlas)

Git

Check versions:

node -v

npm -v

mongod --version

🔧 Installation Steps

1️⃣ Clone Repository

git clone <repository-url>

cd aims-portal

2️⃣ Install Backend Dependencies

cd server

npm install

3️⃣ Install Frontend Dependencies

cd ../client

npm install

🔑 Environment Variables

Create a .env file inside server/

PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key

Example:

MONGO_URI=mongodb://localhost:27017/aims_portal

JWT_SECRET=aims123

▶️ Running the Project

1. Start Backend

2. cd server

3. npm run dev

4. Server runs on:

http://localhost:5000

5. Start Frontend

6. Open a new terminal:

cd client

npm run dev

7. Frontend runs on:

http://localhost:5173

🔐 Default Flow

Admin logs in → Approves Instructor & Faculty Advisor

Instructor adds courses(Course is approved by faculty advisor first and then is available to the students)

Student sends enrollment request

Instructor approves

Faculty Advisor gives final approval

Student sees approved course

🧪 Sample API Type

All APIs follow RESTful Architecture:

GET    /api/student/courses

POST   /api/student/enroll

PUT    /api/instructor/approve

GET    /api/admin/users

