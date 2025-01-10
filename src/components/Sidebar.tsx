import {
  getAuth,
  signOut,
  linkWithCredential,
  EmailAuthProvider,
} from "firebase/auth";

const Sidebar = ({
  user,
  isOpen,
  toggleSidebar,
}: {
  user: { email?: string; isAnonymous: boolean };
  isOpen: boolean;
  toggleSidebar: () => void;
}) => {
  const auth = getAuth();

  const handleLogout = async () => {
    await signOut(auth);
    alert("Logged out successfully!");
  };

  const handleSwitchToAccount = async () => {
    const email = prompt("Enter your email:");
    const password = prompt("Enter a password:");

    if (!email || !password) {
      alert("Email and password are required.");
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(email, password);
      const user = auth.currentUser;

      if (user && user.isAnonymous) {
        await linkWithCredential(user, credential);
        alert("Your guest account has been successfully upgraded!");
      }
    } catch (error) {
      console.error("Error upgrading account:", error);
      alert("Failed to upgrade account. Please try again.");
    }
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
      <p className="text-base text-base-content">
        Welcome, {user.email || "Guest User"}
      </p>

      {/* Logout Button */}
      <button onClick={handleLogout} className="btn btn-secondary mt-4 w-full">
        Logout
      </button>

      {/* Switch to Account Button */}
      {user.isAnonymous && (
        <button
          onClick={handleSwitchToAccount}
          className="btn btn-primary mt-4 w-full"
        >
          Switch to Account
        </button>
      )}

      <div className="divider w-full"></div>

      {/* Placeholder for Additional Functionality */}
      <p className="text-sm text-gray-400">
        Additional features coming soon...
      </p>
    </aside>
  );
};

export default Sidebar;
