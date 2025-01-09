import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";

const AddTask = () => {
  const [taskName, setTaskName] = useState("");

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName) return;

    await addDoc(collection(db, "tasks"), {
      name: taskName,
      completed: false,
      createdAt: new Date(),
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
