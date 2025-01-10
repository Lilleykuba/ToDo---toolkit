import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import "./App.css";
import TaskList from "./components/TaskList";
import AddTask from "./components/AddTask";
import Auth from "./components/Auth"; // Authentication component
import Sidebar from "./components/Sidebar"; // Sidebar component
import Register from "./components/Register"; // Register component
import RegisterGuest from "./components/RegisterGuest";

function App() {
  const [user, setUser] = useState<User | null>(null); // Store the current user
  const [loading, setLoading] = useState(true); // Loading state while checking auth
  const [sidebarOpen, setSidebarOpen] = useState(false); // Sidebar toggle for mobile
  const [isSwitchingFromGuest, setIsSwitchingFromGuest] = useState(false); // Guest to account upgrade state

  useEffect(() => {
    const auth = getAuth();

    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false); // Stop showing the loader
    });

    return () => unsubscribe(); // Cleanup the listener
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

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

  return (
    <div className="flex min-h-screen bg-base-200">
      {/* Sidebar */}
      <Sidebar
        user={{
          email: user?.email || undefined,
          isAnonymous: user?.isAnonymous || false,
        }}
        isOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        onSwitchToAccount={() => setIsSwitchingFromGuest(true)}
      />

      {/* Main Content */}
      <main
        className={`flex-grow p-6 flex items-start justify-center transition-all sm:items-center mt-12 ${
          sidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        <div className="w-full max-w-screen-lg bg-base-100 shadow-xl rounded-lg p-10">
          <button
            onClick={toggleSidebar}
            className="btn btn-primary lg:hidden absolute top-4 left-4"
          >
            ☰
          </button>
          {/* Content */}
          <div className="flex flex-col gap-10">
            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">
                Add a Task
              </h2>
              <AddTask />
            </section>

            <div className="divider"></div>

            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">
                Your Tasks
              </h2>
              <TaskList />
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
