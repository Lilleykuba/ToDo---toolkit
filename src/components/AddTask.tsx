import { useState } from "react";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { getAuth } from "firebase/auth";

const AddTask = ({
  selectedCategory,
}: {
  selectedCategory?: string | null;
}) => {
  const [taskName, setTaskName] = useState("");
  const auth = getAuth();

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName) return;

    const user = auth.currentUser; // Get the current user
    if (!user) {
      console.error("User is not logged in!");
      return;
    }

    try {
      // Fetch the maximum order value for the user's tasks
      const tasksRef = collection(db, "tasks");
      const q = query(tasksRef, where("uid", "==", user.uid));
      const snapshot = await getDocs(q);

      const maxOrder =
        snapshot.docs.length > 0
          ? Math.max(...snapshot.docs.map((doc) => doc.data().order || 0))
          : 0;

      // Add a new task with the next order value
      await addDoc(tasksRef, {
        name: taskName,
        completed: false,
        createdAt: new Date(),
        uid: user.uid, // Associate the task with the user's UID
        order: maxOrder + 1, // Set the order value
        categoryId: selectedCategory || null,
      });

      setTaskName(""); // Clear the input field after adding
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
