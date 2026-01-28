#  AIMS Portal – Academic Information Management System

### Team ID: D15  
**Team Members:**  
- Charvi Pahuja (2023CSB1114)  
- Krishna Agarwal (2023CSB1131)  
- Tamanna (2023CSB1169)  
- Yashasvi Chaudhary (2023CSB1174)  

---

##  Overview

**AIMS Portal** (Academic Information Management System) is a full-stack web application designed to digitize and streamline key academic processes — from **course enrollment** and **approvals** to **transcript generation** and **role-based academic management**.

The system offers distinct functionalities for **Students**, **Instructors**, **Faculty Advisors**, and **Admins**, ensuring a seamless academic workflow with automated validations and secure authentication.

---

##  Features

###  Student
- View available courses.
- Send enrollment requests.
- Drop or withdraw from courses.
- Track enrollment status *(Pending Instructor → Pending FA → Approved)*.
- View academic records and transcripts.
- Download transcripts as PDF.
- Search, filter, and sort courses.

### Instructor
- Add courses with slot clash detection.
- View enrolled students.
- Approve or reject enrollment requests (with bulk approval support).
- Assign a coordinator among instructors.
- Download student details as Excel, fill in grades offline, and re-upload for automatic grade submission.

### Faculty Advisor
- Provide final approval for student enrollments and instructor courses.
- Optionally act as an instructor when assigned.

### Admin
- Approve profiles for Instructors and Faculty Advisors.
- Monitor and manage active users.

---

## ⚙️ System-Level Features

- **Role-based access control (RBAC)**
- **OTP-based signup**
- **JWT Authentication**
- **Session control with multi-tab logout**
- **Protected routes**
- **RESTful API architecture**

---

## 🧩 Tech Stack

###  Frontend
- React.js  
- Axios  
- Tailwind CSS  

###  Backend
- Node.js  
- Express.js  
- MongoDB  
- Mongoose  

### Authentication & Security
- JWT (JSON Web Tokens)  
- bcrypt (password hashing)  
- CORS  

---

## Supporting Libraries

| Package | Purpose |
|----------|----------|
| express | Server framework |
| mongoose | MongoDB ODM |
| cors | Cross-origin resource sharing |
| jsonwebtoken | Token-based authentication |
| bcryptjs | Password hashing |
| dotenv | Environment variable management |
| multer | File handling (optional) |
| nodemon | Development auto-reload |
| axios | API communication (frontend) |
| react-router-dom | Frontend routing |
| tailwindcss | Styling framework |

---

## 🧑‍💻 Prerequisites

Ensure the following are installed:

- **Node.js** (v18+ recommended)  
- **MongoDB** (local or MongoDB Atlas cloud instance)  
- **Git**

Check installation versions:
```bash
node -v
npm -v
mongod --version
```

## Installation Steps
###  Clone the Repository

```bash
git clone <repository-url>
cd aims-portal
```

### Install Backend Dependencies
```bash
cd server
npm install
```

### Install Frontend Dependencies
```bash
cd ../client
npm install
```

### Environment Variables
Create a file named .env inside the server/ directory and add the following entries:
```bash
MONGO_URI=
PORT=
JWT_SECRET=
EMAIL_USER=
EMAIL_PASS=
```

### Example .env
```bash
MONGO_URI=mongodb://localhost:27017/aims_portal
PORT=5000
JWT_SECRET=aims123
EMAIL_USER=example@gmail.com
EMAIL_PASS=your_email_password
```

## Running the project
### Starting Backend
```bash
cd server
npm run dev
```

### Starting Frontend
```bash
cd client
npm run dev
```

## Default Workflow

- Admin logs in → Approves Instructor & Faculty Advisor profiles.
- Instructor adds courses → Course approved by Faculty Advisor.
- Student views available courses → Sends enrollment request.
- Instructor approves the request.
- Faculty Advisor gives final approval.
- Student sees approved course in dashboard and transcript.
