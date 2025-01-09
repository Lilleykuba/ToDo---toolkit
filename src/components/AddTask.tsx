import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import { getAuth } from "firebase/auth";

interface Task {
  id: string;
  name: string;
  completed: boolean;
}

const AddTask = ({
  tasks,
  saveTasksToLocalStorage,
}: {
  tasks: Task[];
  saveTasksToLocalStorage: (newTasks: Task[]) => void;
}) => {
  const [taskName, setTaskName] = useState("");
  const auth = getAuth();

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName) return;

    const user = auth.currentUser;
    if (!user) {
      // Add task to local storage for guest users
      const newTask: Task = {
        id: `${Date.now()}`,
        name: taskName,
        completed: false,
      };
      const newTasks = [...tasks, newTask];
      saveTasksToLocalStorage(newTasks);
      setTaskName(""); // Clear the input field
      return;
    }

    try {
      // Add task to Firestore for logged-in users
      await addDoc(collection(db, "tasks"), {
        name: taskName,
        completed: false,
        createdAt: new Date(),
        uid: user.uid,
      });
      setTaskName(""); // Clear the input field
      console.log("Task added successfully!");
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  return (
    <form
      onSubmit={handleAddTask}
      className="form-control flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-2"
    >
      <input
        type="text"
        placeholder="Enter your task"
        value={taskName}
        onChange={(e) => setTaskName(e.target.value)}
        className="input input-bordered flex-grow"
      />
      <button type="submit" className="btn btn-primary sm:w-auto">
        Add Task
      </button>
    </form>
  );
};

export default AddTask;
