import { useState, useEffect } from "react";
import {
  collection,
  query,
  getDocs,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { getAuth } from "firebase/auth";
// import { PlusCircleIcon, TrashIcon } from "@heroicons/react/24/solid";

interface User {
  uid: string;
  displayName?: string;
  email?: string;
}

const ShareItem = ({
  taskId,
  onClose,
}: {
  taskId: string;
  onClose: () => void;
}) => {
  const [task, setTask] = useState<any>(null);

  // States for sharing
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [shareSearch, setShareSearch] = useState("");
  const [selectedShareUsers, setSelectedShareUsers] = useState<User[]>([]);

  const auth = getAuth();

  // Fetch all users from the "users" collection (excluding current user)
  useEffect(() => {
    async function fetchUsers() {
      const usersRef = collection(db, "users");
      const q = query(usersRef);
      const snapshot = await getDocs(q);
      const usersData: User[] = snapshot.docs.map((doc) => ({
        uid: doc.id,
        ...doc.data(),
      })) as User[];
      const currentUid = auth.currentUser?.uid;
      setAllUsers(usersData.filter((user) => user.uid !== currentUid));
    }
    fetchUsers();
  }, [auth.currentUser]);

  useEffect(() => {
    // Fetch the task details
    const fetchTask = async () => {
      const taskRef = doc(db, "tasks", taskId);
      const taskSnap = await getDoc(taskRef);
      if (taskSnap.exists()) {
        setTask(taskSnap.data());
      }
    };

    fetchTask();
  }, [taskId]);

  const handleSave = async () => {
    if (!task) return;

    try {
      const taskRef = doc(db, "tasks", taskId);
      await updateDoc(taskRef, {
        sharedWith: selectedShareUsers.map((user) => user.uid),
      });
      onClose(); // Go back to the task list
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  if (!task) return <p>Loading task...</p>;

  // Filter users based on search text
  const filteredUsers = allUsers.filter((user) =>
    (user.displayName || user.email || "")
      .toLowerCase()
      .includes(shareSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-base-100 max-w-md mx-auto rounded">
      <div className="card bg-base-200 shadow-xl w-full max-w-md p-6">
        <h1 className="text-2xl font-bold text-primary text-center mb-4">
          Share Task
        </h1>
        {/* Share Task Section */}
        <div className="flex flex-col gap-2 mt-4">
          <input
            type="text"
            placeholder="Search users by name or email"
            value={shareSearch}
            onChange={(e) => setShareSearch(e.target.value)}
            className="input input-bordered"
          />
          <div className="max-h-40 overflow-auto mt-2 border border-base-200 rounded px-2">
            {filteredUsers.map((user) => (
              <div
                key={user.uid}
                className="flex items-center justify-between my-2 overflow-auto"
              >
                <span>{user.displayName || user.email || user.uid}</span>
                <button
                  type="button"
                  className="btn btn-sm btn-outline"
                  onClick={() => {
                    // Toggle selection
                    if (selectedShareUsers.find((u) => u.uid === user.uid)) {
                      setSelectedShareUsers(
                        selectedShareUsers.filter((u) => u.uid !== user.uid)
                      );
                    } else {
                      setSelectedShareUsers([...selectedShareUsers, user]);
                    }
                  }}
                >
                  {selectedShareUsers.find((u) => u.uid === user.uid)
                    ? "Remove"
                    : "Add"}
                </button>
              </div>
            ))}
          </div>
          {selectedShareUsers.length > 0 && (
            <div className="mt-2">
              <label className="label">Selected Users:</label>
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedShareUsers.map((user) => (
                  <span key={user.uid} className="badge badge-info">
                    {user.displayName || user.email || user.uid}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        <button onClick={handleSave} className="btn btn-primary w-full">
          Save Changes
        </button>
        <button onClick={onClose} className="btn btn-secondary w-full mt-4">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ShareItem;
