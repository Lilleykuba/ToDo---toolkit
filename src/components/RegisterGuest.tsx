import { useState } from "react";
import { getAuth, linkWithCredential, EmailAuthProvider } from "firebase/auth";

const RegisterGuest = ({
  onSwitchComplete,
}: {
  onSwitchComplete: () => void;
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const auth = getAuth();
    const user = auth.currentUser;

    try {
      if (user && user.isAnonymous) {
        const credential = EmailAuthProvider.credential(email, password);
        await linkWithCredential(user, credential);
        alert("Your guest account has been successfully upgraded!");
        onSwitchComplete(); // Notify App to navigate back to the task list
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-base-200">
      <div className="card bg-base-100 shadow-xl w-full max-w-md p-6">
        <form
          onSubmit={handleRegister}
          className="form-control w-full max-w-md"
        >
          <h2 className="text-2xl font-bold mb-4">Upgrade Your Account</h2>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input input-bordered mb-4"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input input-bordered mb-4"
          />
          <button type="submit" className="btn btn-primary w-full">
            Upgrade Account
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterGuest;
