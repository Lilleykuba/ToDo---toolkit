import { useState } from "react";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { getAuth } from "firebase/auth";
import { v4 as uuidv4 } from "uuid";
import { PlusCircleIcon, TrashIcon } from "@heroicons/react/24/solid";

const AddTask = ({
  selectedCategory,
}: {
  selectedCategory?: string | null;
}) => {
  const [taskName, setTaskName] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [subtasks, setSubtasks] = useState<{ id: string; name: string }[]>([]);
  const [newSubtask, setNewSubtask] = useState("");
  const auth = getAuth();

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
        priority: priority,
        subtasks: subtasks,
      });

      setTaskName(""); // Clear the input field after adding
      setPriority("Medium");
      setSubtasks([]);
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  return (
    <form
      onSubmit={handleAddTask}
      className="form-control flex flex-col gap-4 sm:gap-2 sm:w-[50%]"
    >
      <input
        type="text"
        placeholder="Enter your task"
        value={taskName}
        onChange={(e) => setTaskName(e.target.value)}
        className="input input-bordered flex-grow"
      />
      <div className="dropdown ">
        <button
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
            <a onClick={() => setPriority("High")}>High</a>
          </li>
          <li>
            <a onClick={() => setPriority("Medium")}>Medium</a>
          </li>
          <li>
            <a onClick={() => setPriority("Low")}>Low</a>
          </li>
        </ul>
      </div>
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
      <button type="submit" className="btn btn-primary sm:w-auto">
        Add Task
      </button>
    </form>
  );
};

export default AddTask;
