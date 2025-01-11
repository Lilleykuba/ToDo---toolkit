import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import { getAuth } from "firebase/auth";
import { TrashIcon } from "@heroicons/react/24/solid";

const TaskItem = ({
  task,
  dragHandleProps,
  categoryColor,
  onEdit,
}: {
  task: {
    id: string;
    name: string;
    completed: boolean;
    categoryId: string | null;
    priority: string;
  };
  dragHandleProps?: any; // Drag handle props for drag-and-drop functionality
  categoryColor?: string; // Color of the associated category
  onEdit: () => void;
}) => {
  const auth = getAuth();

  const handleComplete = async () => {
    const taskRef = doc(db, "tasks", task.id);
    await updateDoc(taskRef, {
      completed: !task.completed,
    });
  };

  const handleDelete = async () => {
    const user = auth.currentUser;

    if (user) {
      try {
        const taskRef = doc(db, "tasks", task.id);
        await deleteDoc(taskRef);
        console.log("Task deleted from Firestore!");
      } catch (error) {
        console.error("Error deleting task from Firestore:", error);
      }
    }
  };

  return (
    <div
      className="card bg-base-100 shadow-md flex items-center p-4 border-l-4"
      style={{ borderColor: categoryColor || "transparent" }}
      {...dragHandleProps} // Enable drag handle for drag-and-drop
    >
      <div className="flex items-center w-full">
        <div className="flex items-center space-x-4">
          <input
            type="checkbox"
            className="checkbox"
            checked={task.completed}
            onChange={handleComplete}
          />
          <span
            className={`text-lg ${
              task.completed ? "line-through text-gray-400" : ""
            }`}
          >
            {task.name}
          </span>
        </div>
        <div className="ml-auto space-x-2">
          <span
            className={`badge ${
              task.priority.toLowerCase() === "high"
                ? "badge-error"
                : task.priority.toLowerCase() === "medium"
                ? "badge-warning"
                : "badge-success"
            }`}
          >
            {task.priority}
          </span>
          <button onClick={onEdit} className="btn btn-sm btn-secondary">
            Edit
          </button>
          <button
            className="btn btn-ghost p-2"
            onClick={handleDelete}
            aria-label="Delete task"
          >
            <TrashIcon className="h-6 w-6 text-red-500 hover:text-red-700" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskItem;
