import { getAuth, signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import Categories from "./Categories";

const Sidebar = ({
  user,
  isOpen,
  toggleSidebar,
  onSwitchToAccount,
  onCategorySelect,
}: {
  user: { email?: string; isAnonymous: boolean };
  isOpen: boolean;
  toggleSidebar: () => void;
  onSwitchToAccount: () => void;
  onCategorySelect: (id: string | null) => void;
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
        className={`h-screen max-w-80 flex flex-col bg-base-300 p-4 fixed z-50 transition-transform duration-300 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static`}
      >
        {/* App Title */}
        <h1 className="text-2xl font-bold text-primary text-center mb-8 mt-16 lg:mt-4">
          Camo ToDo
        </h1>

        {/* Welcome Message */}
        <p className="text-base text-base-content">
          Welcome, {user.email || "Guest User"}
        </p>

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

        <Categories onCategorySelect={onCategorySelect} />

        <div className="mt-auto">
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

          <div className="divider w-full"></div>

          {/* Logout Button */}
          <button onClick={handleLogout} className="btn btn-secondary w-full">
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
