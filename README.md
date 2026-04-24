# Expense Tracker System

## 🚀 Overview

Full-stack expense tracking application built using React, Spring Boot, and PostgreSQL.
The system allows users to manage expenses, track budgets, and view financial insights with secure role-based access control (RBAC).

---

## 🛠 Tech Stack

* Frontend: React, HTML, CSS, JavaScript
* Backend: Spring Boot (Java), REST APIs
* Database: PostgreSQL
* Tools: Postman, IntelliJ IDEA

---

## ✨ Features

* User Authentication & Authorization
* Expense Management (Add, Edit, Delete)
* Category Management
* Monthly Budget Tracking
* Role-Based Access Control (RBAC)
* Dashboard with expense filtering

---

## 📁 Project Structure

expense-tracker-system/
├── frontend/   # React application
├── backend/    # Spring Boot APIs

---

## ⚙️ Setup Instructions

### 1. Clone the Repository

git clone https://github.com/Anishhkumarr/expense-tracker-system
cd expense-tracker-system

---

## 🔧 Backend Setup (Spring Boot)

### Step 1: Navigate to backend

cd backend

### Step 2: Configure Database

Open:
backend/src/main/resources/application.properties

Update:
spring.datasource.url=jdbc:postgresql://localhost:5432/expense_db
spring.datasource.username=postgres
spring.datasource.password=your_password

spring.jpa.hibernate.ddl-auto=update

---

### Step 3: Run Backend

Using IntelliJ:

* Open backend folder
* Run main Spring Boot application

OR using terminal:
./mvnw spring-boot:run

Backend runs on:
http://localhost:8080

---

## 🎨 Frontend Setup (React)

### Step 1: Navigate to frontend

cd frontend

### Step 2: Install dependencies

npm install

### Step 3: Configure API URL

Create `.env` file inside frontend:

REACT_APP_API_URL=http://localhost:8080/api

### Step 4: Run frontend

npm start

Frontend runs on:
http://localhost:3000

---

## 🗄 Database Setup (PostgreSQL)

### Step 1: Create database

CREATE DATABASE expense_db;

### Step 2: Configure DB in backend

Update application.properties (see above)

### Step 3: Run backend

Tables will be created automatically

### Tables:

* users
* categories
* expenses
* budget

---

## 🔐 RBAC (Role-Based Access Control)

* Ensures users can access only permitted data
* Controls API access based on user roles

---

## 📸 Screenshots

<img width="851" height="854" alt="image" src="https://github.com/user-attachments/assets/e18eed19-2471-4177-a13d-de0fcf28baa5" />

### 🔐 Login Page

<img width="843" height="858" alt="image" src="https://github.com/user-attachments/assets/ae6668a6-45d1-49cc-b1bf-3e316010e042" />

### 📝 Register Page

<img width="930" height="886" alt="image" src="https://github.com/user-attachments/assets/eeee24e9-b593-4d15-a381-f7e067202563" />

### 📊 Dashboard

<img width="1902" height="910" alt="image" src="https://github.com/user-attachments/assets/fa8a916d-21a8-4897-ad41-5cc01f9b298e" />

### 💰 Expense Management

<img width="1877" height="889" alt="image" src="https://github.com/user-attachments/assets/8b19f3ab-ac3e-4420-956d-dd8a626c7bd1" />

<img width="1902" height="893" alt="image" src="https://github.com/user-attachments/assets/c9b433e4-7c5d-4a45-a8aa-5690106d47a7" />

<img width="1887" height="908" alt="image" src="https://github.com/user-attachments/assets/ce13a18a-52b4-494b-9950-11daa0cd8645" />

<img width="1893" height="877" alt="image" src="https://github.com/user-attachments/assets/ba747e70-f9c1-4cc8-a569-476d14907e8b" />

<img width="1888" height="884" alt="image" src="https://github.com/user-attachments/assets/70fab33a-6c7a-4260-9cb0-d137d64759f1" />

<img width="655" height="568" alt="image" src="https://github.com/user-attachments/assets/1178b9e7-529e-4efd-8e5b-07077035edd4" />

---

## ⚠️ Common Issues

### Port already in use

Change port in application.properties:
server.port=8081

### Database connection error

* Ensure PostgreSQL is running
* Check username and password

---

## 🚀 Future Improvements

* Charts and analytics dashboard
* Export reports (PDF/Excel)
* Notifications for budget limits
