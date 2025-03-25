import { useState } from "react";
import { supabase } from "../supabaseClient"; // new import

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error, user } = await supabase.auth.signUp(
      { email, password },
      { data: { displayName: username } }
    );
    if (error) {
      setError(error.message);
    } else {
      alert("Registration successful!");
      setEmail("");
      setPassword("");
      setUsername("");
      // Optionally, add further logic to complete registration
    }
  };

  return (
    <form onSubmit={handleRegister} className="form-control w-full max-w-md">
      <h2 className="text-2xl font-bold mb-4">Register</h2>
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
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="input input-bordered mb-4"
      />
      <button type="submit" className="btn btn-primary w-full">
        Register
      </button>
    </form>
  );
};

export default Register;
