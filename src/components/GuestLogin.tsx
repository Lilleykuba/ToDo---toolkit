import { getAuth, signInAnonymously } from "firebase/auth";

const GuestLogin = () => {
  const handleGuestLogin = async () => {
    try {
      const auth = getAuth();
      await signInAnonymously(auth);
    } catch (error) {
      console.error("Error during guest login:", error);
      alert("Failed to login as a guest.");
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-sm text-gray-500">
        Don’t want to create an account? Login as a guest!
      </p>
      <button onClick={handleGuestLogin} className="btn btn-secondary">
        Continue as Guest
      </button>
    </div>
  );
};

export default GuestLogin;
