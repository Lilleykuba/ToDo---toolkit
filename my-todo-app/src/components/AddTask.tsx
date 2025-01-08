import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";

const AddTask = () => {
  const [taskName, setTaskName] = useState("");

  const handleAddTask = async (e) => {
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
    <form onSubmit={handleAddTask} className="form-control">
      <label className="label">
        <span className="label-text text-lg">Task Name</span>
      </label>
      <input
        type="text"
        placeholder="Enter your task"
        value={taskName}
        onChange={(e) => setTaskName(e.target.value)}
        className="input input-bordered w-full mb-4"
      />
      <button type="submit" className="btn btn-primary w-full">
        Add Task
      </button>
    </form>
  );
};

export default AddTask;
