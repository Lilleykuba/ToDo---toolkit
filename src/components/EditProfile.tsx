import { useState } from "react";
import {
  getAuth,
  updateProfile,
  updatePassword,
  deleteUser,
} from "firebase/auth";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";

const EditProfile = ({ onClose }: { onClose: () => void }) => {
  const auth = getAuth();
  const user = auth.currentUser;

  const [username, setUsername] = useState(user?.displayName || "");
  const [newPassword, setNewPassword] = useState("");
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const handleUpdateProfile = async () => {
    if (!user) return;

    try {
      // Update display name
      if (username) {
        await updateProfile(user, { displayName: username });
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, { displayName: username });
      }

      // Update password
      if (newPassword) {
        await updatePassword(user, newPassword);
      }

      onClose();
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    try {
      // Delete user from Firestore
      const userRef = doc(db, "users", user.uid);
      await deleteDoc(userRef);

      // Delete user from Firebase Auth
      await deleteUser(user);

      alert("Your account has been deleted successfully.");
      // Optionally redirect or handle logout
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("Failed to delete account. Please try again.");
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmDelete(false);
  };

  const handleConfirmDelete = () => {
    setShowConfirmDelete(true);
  };

  const handleUsernameChange = (value: string) => {
    setUsername(value);
  };

  const handleNewPassword = (value: string) => {
    setNewPassword(value);
  };

  return (
    <div className="max-w-80 mx-auto p-4 bg-base-300 shadow-lg rounded">
      <h1 className="text-2xl font-bold text-primary text-center mb-8 mt-16 lg:mt-4">
        Edit Profile
      </h1>

      {/* Username */}
      <div className="form-control mb-4">
        <label className="label">Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => handleUsernameChange(e.target.value)}
          className="input input-bordered"
        />
      </div>

      {/* New Password */}
      <div className="form-control mb-4">
        <label className="label">New Password</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => handleNewPassword(e.target.value)}
          className="input input-bordered"
        />
      </div>

      {/* Buttons */}
      <button onClick={handleUpdateProfile} className="btn btn-success w-full">
        Save Changes
      </button>
      <button onClick={onClose} className="btn btn-warning w-full mt-4">
        Cancel
      </button>
      <button
        onClick={handleConfirmDelete}
        className="btn btn-error w-full mt-4"
      >
        Delete Account
      </button>
      {/* Confirmation Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-base-200 p-6 rounded-lg shadow-lg max-w-sm">
            <h2 className="text-lg font-bold mb-4">Confirm Deletion</h2>
            <p className="text-sm text-gray-400 mb-4">
              This action is permanent and cannot be undone. Are you sure you
              want to delete your account?
            </p>
            <div className="flex justify-between">
              <button
                onClick={handleCancelDelete}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button onClick={handleDeleteAccount} className="btn btn-error">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditProfile;
