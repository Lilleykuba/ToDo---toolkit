import React, { Suspense, useCallback, useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
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

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSwitchingFromGuest, setIsSwitchingFromGuest] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sharingTaskId, setSharingTaskId] = useState<string | null>(null);
  const [openDashboard, setOpenDashboard] = useState(false);
  const [openNotes, setOpenNotes] = useState(false);
  const [openHabits, setOpenHabits] = useState(false);

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };
    getSession();
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );
    return () => {
      // Unsubscribe if available
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <p className="text-xl text-primary">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  if (isSwitchingFromGuest) {
    return (
      <RegisterGuest onSwitchComplete={() => setIsSwitchingFromGuest(false)} />
    );
  }

  if (sharingTaskId) {
    return (
      <ShareItem
        taskId={sharingTaskId}
        onClose={() => setSharingTaskId(null)}
      />
    );
  }

  if (openDashboard) {
    return (
      <div className="flex min-h-screen bg-base-200">
        <Sidebar
          user={{
            email: user?.email || undefined,
            isAnonymous: user?.app_metadata?.provider === "anonymous" || false,
          }}
          isOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
          onSwitchToAccount={() => setIsSwitchingFromGuest(true)}
          onOpenDashboard={() => {
            setOpenDashboard(false);
            setOpenNotes(false);
            setOpenHabits(false);
          }}
          openDashboard={openDashboard}
          onOpenNotes={() => {
            setOpenNotes(true);
            setOpenDashboard(false);
            setOpenHabits(false);
          }}
          openNotes={openNotes}
          onOpenHabits={() => {
            setOpenHabits(true);
            setOpenDashboard(false);
            setOpenNotes(false);
          }}
          openHabits={openHabits}
        />
        <main
          className={`flex-grow p-2 sm:p-6 flex-col items-start sm:items-center transition-all mt-10 sm:mt-4 ${
            sidebarOpen ? "ml-64" : "ml-0"
          }`}
        >
          <h1 className="text-4xl text-center text-primary mb-4">Dashboard</h1>
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
        </main>
      </div>
    );
  }

  if (openNotes) {
    return (
      <div className="flex min-h-screen bg-base-200">
        <Sidebar
          user={{
            email: user?.email || undefined,
            isAnonymous: user?.app_metadata?.provider === "anonymous" || false,
          }}
          isOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
          onSwitchToAccount={() => setIsSwitchingFromGuest(true)}
          onOpenDashboard={() => {
            setOpenDashboard(true);
            setOpenNotes(false);
            setOpenHabits(false);
          }}
          openDashboard={openDashboard}
          onOpenNotes={() => {
            setOpenNotes(false);
            setOpenDashboard(false);
            setOpenHabits(false);
          }}
          openNotes={openNotes}
          onOpenHabits={() => {
            setOpenHabits(true);
            setOpenDashboard(false);
            setOpenNotes(false);
          }}
          openHabits={openHabits}
        />
        <main
          className={`flex-grow p-2 sm:p-6 flex-col items-start sm:items-center transition-all mt-10 sm:mt-4 ${
            sidebarOpen ? "ml-64" : "ml-0"
          }`}
        >
          <h1 className="text-4xl text-center text-primary mb-4">Notes</h1>
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
        </main>
      </div>
    );
  }

  if (openHabits) {
    return (
      <div className="flex min-h-screen bg-base-200">
        <Sidebar
          user={{
            email: user?.email || undefined,
            isAnonymous: user?.app_metadata?.provider === "anonymous" || false,
          }}
          isOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
          onSwitchToAccount={() => setIsSwitchingFromGuest(true)}
          onOpenDashboard={() => {
            setOpenDashboard(true);
            setOpenNotes(false);
            setOpenHabits(false);
          }}
          openDashboard={openDashboard}
          onOpenNotes={() => {
            setOpenNotes(true);
            setOpenDashboard(false);
            setOpenHabits(false);
          }}
          openNotes={openNotes}
          onOpenHabits={() => {
            setOpenHabits(false);
            setOpenDashboard(false);
            setOpenNotes(false);
          }}
          openHabits={openHabits}
        />
        <main
          className={`flex-grow p-2 sm:p-6 flex-col items-start sm:items-center transition-all mt-10 sm:mt-4 ${
            sidebarOpen ? "ml-64" : "ml-0"
          }`}
        >
          <h1 className="text-4xl text-center text-primary mb-4">Habits</h1>
          <div className="w-full max-w-screen-lg bg-base-100 shadow-xl rounded-lg p-10 relative flex justify-center mx-auto">
            <button
              onClick={toggleSidebar}
              className="btn btn-primary btn-sm sm:btn lg:hidden fixed top-2 left-2 sm:left-4 sm:top-4 z-50"
            >
              ☰
            </button>
            <Suspense fallback={<div>Loading Notes...</div>}>
              <Habits />
            </Suspense>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-base-200">
      <Sidebar
        user={{
          email: user?.email || undefined,
          isAnonymous: user?.app_metadata?.provider === "anonymous" || false,
        }}
        isOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        onSwitchToAccount={() => setIsSwitchingFromGuest(true)}
        onOpenDashboard={() => {
          setOpenDashboard(true);
          setOpenNotes(false);
          setOpenHabits(false);
        }}
        openDashboard={openDashboard}
        onOpenNotes={() => {
          setOpenNotes(true);
          setOpenDashboard(false);
          setOpenHabits(false);
        }}
        openNotes={openNotes}
        onOpenHabits={() => {
          setOpenDashboard(false);
          setOpenNotes(false);
          setOpenHabits(true);
        }}
        openHabits={openHabits}
      />
      <main
        className={`flex-grow p-2 sm:p-6 flex items-start justify-center transition-all mt-10 sm:mt-4 mx-auto ${
          sidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        <div className="w-full max-w-screen-lg bg-base-100 shadow-xl rounded-lg p-10 relative flex justify-center mx-auto">
          <button
            onClick={toggleSidebar}
            className="btn btn-primary btn-sm sm:btn lg:hidden fixed top-2 left-2 sm:left-4 sm:top-4 z-50"
          >
            ☰
          </button>
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
        </div>
      </main>
    </div>
  );
}

export default App;
