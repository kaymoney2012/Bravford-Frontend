import { AppProvider, useApp } from "./context/AppContext";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import HomePage from "./components/home/HomePage";
import AboutPage from "./components/pages/AboutPage";
import ContactPage from "./components/pages/ContactPage";
import LoginPage from "./components/auth/LoginPage";
import RegisterPage from "./RegisterPage";
import StudentDashboard from "./components/student/Dashboard";
import ExamsPage from "./components/student/ExamsPage";
import ResultsPage from "./components/student/ResultsPage";
import AdminPortal from "./components/admin/AdminPortal";
import HelpChatWidget from "./components/shared/HelpChatWidget";
import "./styles/global.css";

function AppContent() {
  const { page, currentUser } = useApp();
  return (
    <div
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <Navbar />
      <main style={{ flex: 1 }}>
        {page === "home" && <HomePage />}
        {page === "about" && <AboutPage />}
        {page === "contact" && <ContactPage />}
        {page === "login" && <LoginPage />}
        {page === "register" && <RegisterPage />}
        {page === "dashboard" && <StudentDashboard />}
        {page === "exams" && <ExamsPage />}
        {page === "results" && <ResultsPage />}
        {page === "admin" && <AdminPortal />}
      </main>
      <Footer />
      {currentUser?.role !== "admin" && <HelpChatWidget />}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
