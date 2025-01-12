import { useState } from "react";
import {
  getAuth,
  updateProfile,
  updatePassword,
  deleteUser,
} from "firebase/auth";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import React from "react";
import { Cloudinary } from "@cloudinary/url-gen";
import { auto } from "@cloudinary/url-gen/actions/resize";
import { AdvancedImage } from "@cloudinary/react";

const EditProfile = ({ onClose }: { onClose: () => void }) => {
  const auth = getAuth();
  const user = auth.currentUser;

  const [username, setUsername] = useState(user?.displayName || "");
  const [newPassword, setNewPassword] = useState("");
  const [profilePicture, setProfilePicture] = useState<string | null>(
    user?.photoURL || null
  );
  const [uploading, setUploading] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const cld = new Cloudinary({ cloud: { cloudName: "daqty1nfy" } });

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

  const handleProfilePictureChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!user) return;

    if (e.target.files && e.target.files[0]) {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", e.target.files[0]);
      formData.append("upload_preset", "ml_default"); // Replace with your Cloudinary preset

      try {
        const response = await fetch(
          "https://api.cloudinary.com/v1_1/daqty1nfy/image/upload",
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await response.json();
        const imageUrl = data.secure_url;

        // Update Firestore and Firebase Authentication
        await updateProfile(user, { photoURL: imageUrl });
        await updateDoc(doc(db, "users", user.uid), { photoURL: imageUrl });

        setProfilePicture(imageUrl);
      } catch (error) {
        console.error("Error uploading profile picture:", error);
        alert("Failed to upload profile picture.");
      } finally {
        setUploading(false);
      }
    }
  };

  // Transform and display the profile picture
  const transformedPicture = profilePicture
    ? cld
        .image(profilePicture.replace(/^https?:\/\/[^\/]+\//, "")) // Remove the domain for Cloudinary transformations
        .resize(auto().width(150).height(150)) // Adjust size and crop
    : null;

  return (
    <div className="max-w-md mx-auto p-6 bg-base-100 shadow-lg rounded">
      <h1 className="text-xl font-bold mb-4">Edit Profile</h1>

      {/* Profile Picture */}
      <div className="form-control mb-4">
        <label className="label">Profile Picture</label>
        {transformedPicture && (
          <AdvancedImage cldImg={transformedPicture} className="rounded-full" />
        )}
        <input
          type="file"
          onChange={handleProfilePictureChange}
          className="file-input file-input-bordered mt-2"
        />
        {uploading && <p className="text-sm text-gray-500">Uploading...</p>}
      </div>

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
