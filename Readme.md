# College Administration Management System

**Version:** 1.0  
**Developed By:** Karan Minj, Aryan Kumar, Kulwant, Bhavishya and Arpit Kasana




A centralized digital platform designed to automate academic and administrative campus operations. This system streamlines processes such as attendance tracking, secure online fee payments, video content streaming, and reach analytics, all tailored through a Role-Based Access Control (RBAC) model.

## 🚀 Tech Stack
This project is built using a three-tier client-server architecture based on the **MERN Stack**:
* **Frontend (Presentation Layer):** React.js, HTML, JS (Web and Mobile browsers)   -- Will be Designed by Aryan Kumar & Karan Minj
* **Backend (Business Logic Layer):** Node.js and Express.js -- Will be Designed by Arpit Kasana & Bhavishya
* **Database (Data Layer):** MongoDB (NoSQL) using Mongoose ODM -- Will be designed by Kulwant

## ✨ Key Features
* **Role-Based Dashboards:** Dedicated interfaces and privileges for `Admin`, `Teacher`, and `Student` roles.
* **Secure Authentication:** JWT-based stateless authentication with password hashing via bcrypt or argon2.
* **Attendance Tracking:** Teacher-driven attendance marking (Present, Absent, Late) with real-time updates and push notifications.
* **Video Content Management:** Teachers can securely upload, manage, and categorize educational videos by subject and class.
* **Subject-Wise Streaming:** Students can access and stream assigned video content via an integrated media player.
* **Secure Fee Payments:** Online campus fee payments integrated with external gateways (Razorpay/UPI). Includes secure cryptographic webhook validation (`x-razorpay-signature`) to prevent duplicate or spoofed transactions.
* **Reach Analytics:** Real-time monitoring of video viewership correlated with student engagement and attendance metrics.
* **Campus Notifications:** Event creation and system-wide notification broadcasting.

## 🗄️ Database Structure
The system utilizes a flexible NoSQL MongoDB schema with the following core collections:
* **Users:** Stores credentials, roles (`Admin`, `Teacher`, `Student`), and profile data.
* **Class:** Stores course information, class times, and links to assigned teachers.
* **Attendance:** Maps students to class participation records.
* **Events:** Manages campus event data and descriptions.
* **Payments:** Stores fee payment records, transaction IDs, and capture status.
* **Notifications:** Stores read/unread system alerts for users.

## 🛡️ Security Protocols
* **Transport Security:** All client-server communication mandates HTTPS encryption.
* **Input Validation:** Express middleware sanitizes inputs to protect against SQL/NoSQL Injection, Cross-Site Scripting (XSS), and Cross-Site Request Forgery (CSRF).
* **Payment Verification:** Webhook endpoints validate cryptographic signatures before updating any payment status in the database.
* **Data Safety:** Soft deletion logic (`is_deleted` boolean) is implemented across sensitive records to prevent permanent data loss.

---

### ⚙️ Local Setup & Installation 
*(Note: The exact installation commands below are standard Node.js/MERN stack procedures and are not explicitly detailed in the provided source documents, but are required to run a MERN project).*

**Prerequisites:** Node.js, npm/yarn, and a MongoDB instance (local or Atlas).

1. **Clone the repository:**
   ```bash
   git clone https://github.com/kminz-saloni/College_Administration_Management_System
   ```
2. **Install Backend Dependencies:**
   ```bash
   cd Backend
   npm install
   ```
3. **Install Frontend Dependencies:**
   ```bash
   cd frontend
   npm install
   ```
4. **Environment Variables:**

# for testing phase all env variables file are hardcoded into Repo


5. **Run the Application:**
   ```bash ( You need to run 2 terminals )
   # In the Backend directory
   npm start
   
   # In the frontend directory
   npm run dev
   ```
