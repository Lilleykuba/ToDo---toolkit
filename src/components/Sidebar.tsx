import { getAuth, signOut } from "firebase/auth";
import { useEffect, useState } from "react";
// import { doc, getDoc } from "firebase/firestore";
import Categories from "./Categories";
import Footer from "./Footer";
import EditProfile from "./EditProfile";
import { PencilIcon } from "@heroicons/react/24/solid";

const Sidebar = ({
  user,
  isOpen,
  toggleSidebar,
  onSwitchToAccount,
  onCategorySelect,
  onOpenDashboard,
  openDashboard,
}: {
  user: { email?: string; isAnonymous: boolean };
  isOpen: boolean;
  toggleSidebar: () => void;
  onSwitchToAccount: () => void;
  onCategorySelect: (id: string | null) => void;
  onOpenDashboard: (isOpen: boolean) => void;
  openDashboard: boolean;
}) => {
  const handleLogout = async () => {
    const auth = getAuth();
    await signOut(auth);
    alert("Logged out successfully!");
  };

  const [theme, setTheme] = useState<string>("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const themes = [
    "light",
    "dark",
    "cupcake",
    "corporate",
    "synthwave",
    "retro",
  ];

  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        setUsername(user.displayName);
      }
    };

    fetchUserData();
  }, []);

  const [editingProfile, setEditingProfile] = useState(false);

  if (editingProfile) {
    return <EditProfile onClose={() => setEditingProfile(false)} />;
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`min-h-screen max-w-80 flex flex-col bg-base-300 p-4 fixed z-50 transition-transform duration-300 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static`}
      >
        {/* App Title */}
        <h1 className="text-2xl font-bold text-primary text-center mb-8 mt-16 lg:mt-4">
          Todo-san
        </h1>

        <div className="flex gap-2 items-center">
          {/* Welcome Message */}
          <p className="text-base text-base-content">
            Welcome, {username || user.email || "Guest User"}
          </p>
          <button
            onClick={() => setEditingProfile(true)} // Trigger the edit profile view
            className="btn btn-sm btn-ghost w-4 h-4 p-0 hover:bg-transparent mt-[-10px]"
          >
            <PencilIcon className="h-full w-full text-blue-500 hover:text-blue-700" />
          </button>
        </div>

        {/* Upgrade to Account Button */}
        {user.isAnonymous && (
          <button
            onClick={onSwitchToAccount}
            className="btn btn-primary mt-4 w-full"
          >
            Upgrade to Account
          </button>
        )}

        <div className="divider w-full"></div>

        <button onClick={() => onOpenDashboard(!openDashboard)} className="btn">
          {openDashboard ? "Tasks" : "Dashboard"}
        </button>

        <div className="divider w-full"></div>

        <Categories onCategorySelect={onCategorySelect} />

        <div className="mt-auto space-y-8">
          {/* Theme Switcher */}
          <div className="mt-4 w-full">
            <label className="label text-xl text-gray-400 mb-2">
              Switch Theme
            </label>
            <select
              className="select select-bordered w-full"
              value={theme}
              onChange={(e) => handleThemeChange(e.target.value)}
            >
              {themes.map((t) => (
                <option key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Logout Button */}
          <button onClick={handleLogout} className="btn btn-secondary w-full">
            Logout
          </button>
        </div>

        <div className="divider w-full"></div>

        <Footer />
      </aside>
    </>
  );
};

export default Sidebar;
