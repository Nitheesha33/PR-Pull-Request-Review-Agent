# 📝 AI-Powered PR Review Platform

A modern, full-stack application for automated code review and feedback. It leverages AI to analyze code for bugs, style, complexity, and more, providing actionable feedback to developers. The platform features a React + Vite frontend and a Python FastAPI backend, supporting integrations with GitHub, GitLab, and Bitbucket.

---

## 🚀 Live Demo

View the deployed app on Vercel:  
https://pr-pull-request-review-agent-rwcq-ddi25uymr-nitheeshas-projects.vercel.app/

---

## 📝 Features

**Automated Code Analysis**  
- AI-driven feedback on code quality, style, bugs, and complexity.

**Multi-Platform Integration**  
- Connects with GitHub, GitLab, and Bitbucket repositories.

**Feedback Management**  
- View, filter, and manage feedback for each code submission.

**Score Meter**  
- Visual representation of code quality and improvement areas.

**Real-Time Results**  
- Instant feedback as you submit pull requests.

**Modern UI**  
- Responsive, user-friendly interface.

---

## 🛠️ Tech Stack

- **Frontend:** React.js (Vite, Tailwind CSS)
- **Backend:** Python (FastAPI)
- **State Management:** React hooks/context
- **API Integration:** RESTful endpoints
- **Deployment:** Vercel (Frontend), Render (Backend)

---

## 📦 Installation & Setup

**Clone the repository**
```sh
git clone https://github.com/Nitheesha33/PR-Pull-Request-Review-Agent
```
This command copies the project repository from GitHub to your local machine.

**Navigate to the project directory**
```sh
cd PR-Pull-Request-Review-Agent
```
This command moves you into the project folder you just cloned.

**Install frontend dependencies**
```sh
cd frontend
npm install
```
Installs all required packages for the frontend.

**Install backend dependencies**
```sh
cd ../backend
pip install -r requirements.txt
```
Installs all required Python packages for the backend.

**Start the backend server**
```sh
uvicorn main:app --reload
```
Launches the FastAPI backend (default: http://localhost:8000).

**Start the frontend development server**
```sh
cd ../frontend
npm run dev
```
Launches the React frontend (default: http://localhost:5173).

---

## 🖥️ Usage

- **Submit Code:**  
  Use the input form to submit code or a repository link for analysis.

- **View Feedback:**  
  Feedback and suggestions appear instantly in the results display.

- **Score Meter:**  
  Visualize your code’s quality and areas for improvement.

---

## 📚 Required Dependencies

**Frontend:**  
- react  
- react-dom  
- vite  
- tailwindcss

**Backend:**  
- fastapi  
- uvicorn  
- [Other packages in `requirements.txt`]

---

Enjoy faster, smarter code reviews with AI-Powered PR Review Platform !  
For questions or contributions, open an issue or pull request on GitHub.

---
