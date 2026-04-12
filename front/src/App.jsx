import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import StudentHeader from './components/StudentHeader';
import TeacherHeader from './components/teacher/TeacherHeader';
import Home from './pages/Home';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import TutorProfile from './pages/TutorProfile';
import AdminDashboard from './pages/AdminDashboard';
import StudentProfile from './pages/StudentProfile';
import ChatPage from './pages/ChatPage';

function App() {

  const [currentUser, setCurrentUser] = useState(null);


  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    const role = localStorage.getItem('role');
    const token = localStorage.getItem('token');

    if (token && userId) {
      setCurrentUser({
        id: parseInt(userId),
        role: role
      });
    }
  }, []);


  const token = localStorage.getItem('token');

  const currentRole = currentUser?.role || localStorage.getItem('role');

  const isStudent = token && currentRole === 'student';
  const isTeacher = token && currentRole === 'teacher';
  const isAdmin = token && currentRole === 'admin';

  return (
    <Router>
      <div className="min-h-screen bg-white font-sans">

        {/* HEADER SELECTION */}
        {isStudent ? (
          <StudentHeader />
        ) : isTeacher ? (
          <TeacherHeader />
        ) : isAdmin ? null : (
          <Header />
        )}

        {/*  ROUTE DEFINITION */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<SignUp />} />


          <Route path="/login" element={<Login setCurrentUser={setCurrentUser} />} />


          <Route path="/student-dashboard" element={<StudentDashboard />} />
          <Route path="/student-profile" element={<StudentProfile />} />

          <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
          <Route path="/tutor/:id" element={<TutorProfile />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />


          <Route
            path="/messages/:tutorId"
            element={<ChatPage currentUser={currentUser} />}
          />
        </Routes>

      </div>
    </Router>
  );
}

export default App;