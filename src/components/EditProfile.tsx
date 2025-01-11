import { useState } from "react";
import {
  getAuth,
  updateProfile,
  updatePassword,
  deleteUser,
} from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

const EditProfile = ({ onClose }: { onClose: () => void }) => {
  const auth = getAuth();
  const user = auth.currentUser;

  const [username, setUsername] = useState(user?.displayName || "");
  const [newPassword, setNewPassword] = useState("");
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

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

      alert("Profile updated successfully!");
      onClose();
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    try {
      await deleteUser(user);
      alert("Account deleted successfully!");
    } catch (error) {
      console.error("Error deleting account:", error);
    }
  };

  const handleProfilePictureChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!user) return;

    if (e.target.files && e.target.files[0]) {
      const formData = new FormData();
      formData.append("file", e.target.files[0]);
      formData.append("upload_preset", "your_preset_here");

      const response = await fetch(
        "https://api.cloudinary.com/v1_1/your_cloud_name/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
      const imageUrl = data.secure_url;

      await updateDoc(doc(db, "users", user.uid), { photoURL: imageUrl });
      setProfilePicture(imageUrl); // Update local state
    }
  };

  {
    profilePicture && (
      <img
        src={profilePicture}
        alt="Profile"
        className="w-16 h-16 rounded-full"
      />
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-base-100 shadow-lg rounded">
      <h1 className="text-xl font-bold mb-4">Edit Profile</h1>

      {/* Username */}
      <div className="form-control mb-4">
        <label className="label">Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="input input-bordered"
        />
      </div>

      {/* Profile Picture */}
      <div className="form-control mb-4">
        <label className="label">Profile Picture</label>
        <input
          type="file"
          onChange={handleProfilePictureChange}
          className="file-input file-input-bordered"
        />
      </div>

      {/* New Password */}
      <div className="form-control mb-4">
        <label className="label">New Password</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="input input-bordered"
        />
      </div>

      {/* Buttons */}
      <button onClick={handleUpdateProfile} className="btn btn-primary w-full">
        Save Changes
      </button>
      <button onClick={onClose} className="btn btn-secondary w-full mt-4">
        Cancel
      </button>
      <button
        onClick={handleDeleteAccount}
        className="btn btn-error w-full mt-4"
      >
        Delete Account
      </button>
    </div>
  );
};

export default EditProfile;
