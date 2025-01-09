import { useState } from "react";
import Register from "./Register";
import Login from "./Login";
import GuestLogin from "./GuestLogin";

const Auth = () => {
  const [isRegistering, setIsRegistering] = useState(false);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-base-200">
      <div className="card bg-base-100 shadow-xl w-full max-w-md p-6">
        {/* Toggle between Register and Login */}
        {isRegistering ? <Register /> : <Login />}
        <button
          onClick={() => setIsRegistering(!isRegistering)}
          className="btn btn-link mt-4"
        >
          {isRegistering
            ? "Already have an account? Login"
            : "Don't have an account? Register"}
        </button>

        {/* Divider */}
        <div className="divider">OR</div>

        {/* Guest Login */}
        <GuestLogin />
      </div>
    </div>
  );
};

export default Auth;
