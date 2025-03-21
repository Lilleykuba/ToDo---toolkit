import { useState, useEffect } from "react";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { getAuth } from "firebase/auth";
import { v4 as uuidv4 } from "uuid";
import { PlusCircleIcon, TrashIcon } from "@heroicons/react/24/solid";
import Categories from "./Categories";

interface User {
  uid: string;
  displayName?: string;
  email?: string;
}

const AddTask = ({
  onCategorySelect,
  selectedCategory,
}: {
  onCategorySelect: (id: string | null) => void;
  selectedCategory?: string | null;
}) => {
  const [taskName, setTaskName] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [subtasks, setSubtasks] = useState<{ id: string; name: string }[]>([]);
  const [newSubtask, setNewSubtask] = useState("");

  // States for sharing
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [shareSearch, setShareSearch] = useState("");
  const [selectedShareUsers, setSelectedShareUsers] = useState<User[]>([]);
  const [showShareTask, setShowShareTask] = useState(false); // new state to toggle share section
  const [showCategories, setShowCategories] = useState(false); // new state to toggle categories section

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

  const handleAddSubtask = () => {
    if (newSubtask) {
      setSubtasks([...subtasks, { id: uuidv4(), name: newSubtask }]);
      setNewSubtask("");
    }
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter((subtask) => subtask.id !== id));
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName) return;

    const user = auth.currentUser;
    if (!user) {
      console.error("User is not logged in!");
      return;
    }

    try {
      // Fetch tasks to get the maximum order value
      const tasksRef = collection(db, "tasks");
      const q = query(tasksRef, where("uid", "==", user.uid));
      const snapshot = await getDocs(q);
      const maxOrder =
        snapshot.docs.length > 0
          ? Math.max(...snapshot.docs.map((doc) => doc.data().order || 0))
          : 0;

      // Add the new task, including sharedWith as an array of UIDs from selectedShareUsers
      await addDoc(tasksRef, {
        name: taskName,
        completed: false,
        createdAt: new Date(),
        uid: user.uid,
        owner: user.uid,
        order: maxOrder + 1,
        categoryId: selectedCategory || null,
        priority: priority,
        subtasks: subtasks,
        sharedWith: selectedShareUsers.map((u) => u.uid),
      });

      // Reset the form
      setTaskName("");
      setPriority("Medium");
      setSubtasks([]);
      setSelectedShareUsers([]);
      setShareSearch("");
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  // Filter users based on search text
  const filteredUsers = shareSearch
    ? allUsers.filter((user) =>
        (user.displayName || user.email || "")
          .toLowerCase()
          .includes(shareSearch.toLowerCase())
      )
    : [];

  if (showCategories) {
    return (
      <>
        <div className="flex gap-2 justify-center">
          <button
            type="button"
            className="btn btn-outline sm:text-xl text-lg font-bold text-primary mb-4 sm:w-44 w-40 max-w-40 sm:max-w-44"
            onClick={() => setShowCategories(false)}
          >
            Add a Task
          </button>
          <button
            type="button"
            className={`btn btn-outline sm:text-xl text-lg font-bold text-primary mb-4 sm:w-44 w-40 max-w-40 sm:max-w-44" ${
              showCategories ? "btn-active" : ""
            }`}
            onClick={() => setShowCategories(true)}
          >
            Add Category
          </button>
        </div>
        <Categories onCategorySelect={onCategorySelect} />
      </>
    );
  }

  return (
    <form onSubmit={handleAddTask} className="form-control flex gap-4 sm:gap-2">
      <div className="flex gap-2 justify-center">
        <button
          type="button"
          className={`btn btn-outline sm:text-xl text-lg font-bold text-primary mb-4 sm:w-44 w-40 max-w-40 sm:max-w-44" ${
            showCategories ? "" : "btn-active"
          }`}
          onClick={() => setShowCategories(false)}
        >
          Add a Task
        </button>
        <button
          type="button"
          className="btn btn-outline sm:text-xl text-lg font-bold text-primary mb-4 sm:w-44 w-40 max-w-40 sm:max-w-44"
          onClick={() => setShowCategories(true)}
        >
          Add Category
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex flex-col gap-2 w-full sm:w-[50%]">
          {/* Task Name Section */}
          <input
            type="text"
            placeholder="Enter your task"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            className="input input-bordered"
          />
          {/* Subtasks Section */}
          <div className="space-y-2">
            <div className="flex gap-2 input input-bordered flex-grow pr-0">
              <input
                type="text"
                placeholder="Add subtask"
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                className="flex-grow"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="btn btn-circle btn-ghost"
                title="Add Subtask"
              >
                <PlusCircleIcon className="h-8 w-8 text-white" />
              </button>
            </div>
            {subtasks.map((subtask) => (
              <div key={subtask.id} className="flex items-center">
                <span className="text-sm">{subtask.name}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSubtask(subtask.id)}
                  className="btn btn-ghost btn-sm hover:bg-transparent"
                >
                  <TrashIcon className="h-4 w-4 text-red-500 hover:text-red-700" />
                </button>
              </div>
            ))}
          </div>
          {/* Share Task Section */}
          <div className="min-w-full flex flex-col gap-2 mt-4">
            <h2
              onClick={() => setShowShareTask((prev) => !prev)}
              className="text-xl font-bold text-primary mb-2 cursor-pointer"
            >
              {showShareTask
                ? "∨ Share task with users"
                : "> Share task with users"}
            </h2>
            {showShareTask && (
              <div className="flex flex-col gap-2">
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
                      className="flex items-center justify-between my-2 overflow-auto max-h-40"
                    >
                      <span>{user.displayName || user.email || user.uid}</span>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline"
                        onClick={() => {
                          // Toggle selection
                          if (
                            selectedShareUsers.find((u) => u.uid === user.uid)
                          ) {
                            setSelectedShareUsers(
                              selectedShareUsers.filter(
                                (u) => u.uid !== user.uid
                              )
                            );
                          } else {
                            setSelectedShareUsers([
                              ...selectedShareUsers,
                              user,
                            ]);
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
                    <div className="flex flex-wrap gap-2">
                      {selectedShareUsers.map((user) => (
                        <span key={user.uid} className="badge badge-info">
                          {user.displayName || user.email || user.uid}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="dropdown w-full sm:w-[50%]">
          <button
            type="button"
            tabIndex={0}
            className="btn btn-outline w-full flex justify-between"
          >
            Task Priority: {priority}
          </button>
          <ul
            tabIndex={0}
            className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 mt-2"
          >
            <li>
              <button type="button" onClick={() => setPriority("High")}>
                High
              </button>
            </li>
            <li>
              <button type="button" onClick={() => setPriority("Medium")}>
                Medium
              </button>
            </li>
            <li>
              <button type="button" onClick={() => setPriority("Low")}>
                Low
              </button>
            </li>
          </ul>
        </div>
      </div>

      <button type="submit" className="btn btn-primary sm:w-auto mt-4">
        Add Task
      </button>
    </form>
  );
};

export default AddTask;
