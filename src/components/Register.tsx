import { useState } from "react";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const auth = getAuth();

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Update Firebase Auth Profile
      await updateProfile(user, { displayName: username });

      // Save user data to Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: username,
      });

      alert("Registration successful!");
      setEmail("");
      setPassword("");
      setUsername("");
    } catch (err: any) {
      setError(err.message);
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
      <button type="submit" className="btn btn-primary w-full">
        Register
      </button>
    </form>
  );
};

export default Register;
