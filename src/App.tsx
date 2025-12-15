import { useState } from "react";
import { LandingPage } from "./components/LandingPage";
import { LoginPage } from "./components/LoginPage";
import { InvitationPage } from "./components/InvitationPage";
import { AdminRegistrationPage } from "./components/AdminRegistrationPage";
import { UserDashboard } from "./components/UserDashboard";
import { AdminDashboard } from "./components/AdminDashboard";
import { SubscriptionPage } from "./components/SubscriptionPage";
import { LeaderboardPage } from "./components/LeaderboardPage";
import { LocalStorageBadge } from "./components/LocalStorageBadge";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";

type Page =
  | "landing"
  | "login"
  | "signup"
  | "dashboard"
  | "admin"
  | "subscription"
  | "leaderboard"
  | "invitation"
  | "admin-registration";

export default function App() {
  const [currentPage, setCurrentPage] =
    useState<Page>("landing");
  const [userType, setUserType] = useState<"user" | "admin">(
    "user",
  );

  const handleLogin = (isAdmin: boolean = false) => {
    setUserType(isAdmin ? "admin" : "user");
    setCurrentPage(isAdmin ? "admin" : "dashboard");
  };

  const handleAdminCreated = () => {
    setUserType("admin");
    setCurrentPage("admin");
  };

  const handleLogout = () => {
    const wasAdmin = userType === "admin";
    setCurrentPage("landing");
    setUserType("user");

    // Show logout notification
    toast.info(
      wasAdmin
        ? "👋 Admin Logged Out"
        : "👋 Logged Out Successfully",
      {
        description: (
          <span className="text-[#6B21A8]">
            {wasAdmin 
              ? "Come back soon! 💼" 
              : "Take a break and come back refreshed! 😊"}
          </span>
        ),
        style: { borderColor: '#C4B5FD', color: '#6B21A8' },
      },
    );
  };

  const navigateTo = (page: Page) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-sky-100">
      {currentPage === "landing" && (
        <LandingPage onNavigate={navigateTo} />
      )}
      {currentPage === "login" && (
        <LoginPage
          onLogin={handleLogin}
          onNavigate={navigateTo}
        />
      )}
      {currentPage === "invitation" && (
        <InvitationPage
          onLogin={handleLogin}
          onNavigate={navigateTo}
        />
      )}
      {currentPage === "admin-registration" && (
        <AdminRegistrationPage
          onNavigate={navigateTo}
          onAdminCreated={handleAdminCreated}
        />
      )}
      {currentPage === "dashboard" && (
        <UserDashboard
          onNavigate={navigateTo}
          onLogout={handleLogout}
        />
      )}
      {currentPage === "admin" && (
        <AdminDashboard
          onNavigate={navigateTo}
          onLogout={handleLogout}
        />
      )}
      {currentPage === "subscription" && (
        <SubscriptionPage
          onNavigate={navigateTo}
          onLogout={handleLogout}
        />
      )}
      {currentPage === "leaderboard" && (
        <LeaderboardPage
          onNavigate={navigateTo}
          onLogout={handleLogout}
        />
      )}
      <LocalStorageBadge />
      <Toaster />
    </div>
  );
}