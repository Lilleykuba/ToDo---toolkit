import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import { getAuth } from "firebase/auth";

const AddTask = () => {
  const [taskName, setTaskName] = useState("");
  const auth = getAuth();

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName) return;

    const user = auth.currentUser; // Get the current user
    if (!user) return; // Ensure the user is logged in

    await addDoc(collection(db, "tasks"), {
      name: taskName,
      completed: false,
      createdAt: new Date(),
      uid: user.uid, // Associate the task with the user's UID
    });
    setTaskName(""); // Clear the input field after adding
  };

  return (
    <form
      onSubmit={handleAddTask}
      className="form-control flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-2"
    >
      {/* Input Field */}
      <input
        type="text"
        placeholder="Enter your task"
        value={taskName}
        onChange={(e) => setTaskName(e.target.value)}
        className="input input-bordered flex-grow"
      />

      {/* Add Task Button */}
      <button type="submit" className="btn btn-primary sm:w-auto">
        Add Task
      </button>
    </form>
  );
};

export default AddTask;
