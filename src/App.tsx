import React, { Suspense, useCallback, useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import "./App.css";
import TaskList from "./components/TaskList";
import AddTask from "./components/AddTask";
import Auth from "./components/Auth";
import Sidebar from "./components/Sidebar";
import RegisterGuest from "./components/RegisterGuest";
import ShareItem from "./components/ShareItem";

const Dashboard = React.lazy(() => import("./components/Dashboard"));
const Notes = React.lazy(() => import("./components/Notes"));
const Habits = React.lazy(() => import("./components/Habits"));

type Section = "dashboard" | "notes" | "habits" | "tasks";

function App() {
  const [user, setUser] = useState<User | null>(null); // Store the current user
  const [loading, setLoading] = useState(true); // Loading state while checking auth
  const [sidebarOpen, setSidebarOpen] = useState(false); // Sidebar toggle for mobile
  const [isSwitchingFromGuest, setIsSwitchingFromGuest] = useState(false); // Guest to account upgrade state
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sharingTaskId, setSharingTaskId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<Section>("tasks");

  useEffect(() => {
    const auth = getAuth();

    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false); // Stop showing the loader
    });

    return () => unsubscribe(); // Cleanup the listener
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  if (loading) {
    // Show a loading spinner while Firebase checks authentication state
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <p className="text-xl text-primary">Loading...</p>
      </div>
    );
  }

  if (!user) {
    // If no user is logged in, show the authentication screen
    return <Auth />;
  }

  if (isSwitchingFromGuest) {
    // Render the Register component for guest-to-account upgrade
    return (
      <RegisterGuest onSwitchComplete={() => setIsSwitchingFromGuest(false)} />
    );
  }

  if (sharingTaskId) {
    // Render ShareItem component when sharingTaskId is set
    return (
      <ShareItem
        taskId={sharingTaskId}
        onClose={() => setSharingTaskId(null)} // Go back to the task list
      />
    );
  }

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <div className="w-full max-w-screen-lg bg-base-100 shadow-xl rounded-lg p-10 relative flex justify-center mx-auto">
            <button
              onClick={toggleSidebar}
              className="btn btn-primary btn-sm sm:btn lg:hidden fixed top-2 left-2 sm:left-4 sm:top-4 z-50"
            >
              ☰
            </button>
            <Suspense fallback={<div>Loading Dashboard...</div>}>
              <Dashboard
                selectedCategory={selectedCategory}
                onShareTask={(taskId) => setSharingTaskId(taskId)}
              />
            </Suspense>
          </div>
        );
      case "notes":
        return (
          <div className="w-full max-w-screen-lg bg-base-100 shadow-xl rounded-lg p-10 relative flex justify-center mx-auto">
            <button
              onClick={toggleSidebar}
              className="btn btn-primary btn-sm sm:btn lg:hidden fixed top-2 left-2 sm:left-4 sm:top-4 z-50"
            >
              ☰
            </button>
            <Suspense fallback={<div>Loading Notes...</div>}>
              <Notes />
            </Suspense>
          </div>
        );
      case "habits":
        return (
          <div className="w-full max-w-screen-lg bg-base-100 shadow-xl rounded-lg p-10 relative flex justify-center mx-auto">
            <button
              onClick={toggleSidebar}
              className="btn btn-primary btn-sm sm:btn lg:hidden fixed top-2 left-2 sm:left-4 sm:top-4 z-50"
            >
              ☰
            </button>
            <Suspense fallback={<div>Loading Habits...</div>}>
              <Habits />
            </Suspense>
          </div>
        );
      default: // "tasks"
        return (
          <div className="w-full">
            <section>
              <AddTask
                selectedCategory={selectedCategory}
                onCategorySelect={(id) => setSelectedCategory(id)}
              />
            </section>
            <div className="divider"></div>
            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">
                Your Tasks
              </h2>
              <TaskList
                selectedCategory={selectedCategory}
                onShareTask={(taskId) => setSharingTaskId(taskId)}
              />
            </section>
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-base-200">
      <Sidebar
        user={{
          email: user?.email || undefined,
          isAnonymous: user?.isAnonymous || false,
        }}
        isOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        onSwitchToAccount={() => setIsSwitchingFromGuest(true)}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />
      <main
        className={`flex-grow p-2 sm:p-6 transition-all mt-10 sm:mt-4 ${
          sidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        {activeSection === "Dashboard" && (
          <h1 className="text-4xl text-center text-primary mb-4">Dashboard</h1>
        )}
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
