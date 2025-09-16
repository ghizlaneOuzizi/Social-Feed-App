# Social-Feed-App

# Social Sharing Web Application  

A social sharing web application built with **Spring Boot** (backend) and **React.js** (frontend), developed using **Test-Driven Development (TDD)** practices.  

## 🚀 Features  
- **User Authentication & Profile Management**  
  - Sign up, log in, and log out.  
  - Update display name and profile picture.  

- **User Browsing**  
  - Paginated user listing.  
  - Navigate between user profiles.  

- **Posts**  
  - Create, view, and delete posts.  
  - Attach up to 5 files per post.  
  - Browse all posts or filter by user.  

- **Security**  
  - Authentication & authorization with **Spring Security**.  

## 🛠️ Tech Stack  
- **Backend**: Spring Boot, Spring Security, JPA/Hibernate, MySQL/PostgreSQL  
- **Frontend**: React.js, Redux, React Router  
- **Testing**: JUnit, Jest, React Testing Library  
- **Build Tools**: Maven, npm  

## 📂 Project Structure  
/backend → Spring Boot REST API
/frontend → React.js web client


## ⚙️ Getting Started  

### Prerequisites  
- Java 17+  
- Node.js & npm  
- MySQL or PostgreSQL  

### Backend Setup  
cd backend
./mvnw spring-boot:run

### Frontend Setup
cd frontend
npm install
npm start


The app will be available at: http://localhost:3000

### ✅ Development Approach

This project was built step by step following TDD. Each feature was implemented by:

Writing a failing test.

Implementing the feature.

Refactoring for clean, maintainable code.
