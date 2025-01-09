import { getAuth, signOut } from "firebase/auth";

const Sidebar = ({
  user,
  isOpen,
  toggleSidebar,
}: {
  user: { email: string };
  isOpen: boolean;
  toggleSidebar: () => void;
}) => {
  const handleLogout = async () => {
    const auth = getAuth();
    await signOut(auth);
    alert("Logged out successfully!");
  };

  return (
    <aside
      className={`h-screen w-64 bg-base-300 p-4 flex flex-col items-start space-y-4 fixed lg:static transition-transform ${
        isOpen ? "translate-x-0" : "-translate-x-64"
      } lg:translate-x-0`}
    >
      {/* Close Button for Mobile */}
      <button
        onClick={toggleSidebar}
        className="btn btn-primary lg:hidden self-end"
      >
        ✕
      </button>

      {/* App Title */}
      <h1 className="text-2xl font-bold text-primary">Camo ToDo</h1>

      {/* Welcome Message */}
      <p className="text-base text-base-content">Welcome, {user.email}</p>

      {/* Logout Button */}
      <button onClick={handleLogout} className="btn btn-secondary mt-4 w-full">
        Logout
      </button>

      <div className="divider w-full"></div>

      {/* Placeholder for Additional Functionality */}
      <p className="text-sm text-gray-400">
        Additional features coming soon...
      </p>
    </aside>
  );
};

export default Sidebar;
