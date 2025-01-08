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
    <form onSubmit={handleAddTask}>
      <input
        type="text"
        placeholder="Enter task"
        value={taskName}
        onChange={(e) => setTaskName(e.target.value)}
      />
      <button type="submit">Add Task</button>
    </form>
  );
};

export default AddTask;
