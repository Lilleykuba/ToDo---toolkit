import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import { getAuth } from "firebase/auth";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/solid";

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full space-y-2 sm:space-y-0">
        {/* Task Name and Checkbox */}
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

        {/* Priority and Actions */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <span
            className={`badge ${
              task.priority === "High"
                ? "badge-error"
                : task.priority === "Medium"
                ? "badge-warning"
                : "badge-success"
            }`}
          >
            {task.priority}
          </span>
          <button
            onClick={onEdit}
            className="btn btn-sm btn-ghost"
            aria-label="Edit task"
          >
            <PencilIcon className="h-5 w-5 text-blue-500 hover:text-blue-700" />
          </button>
          <button
            className="btn btn-sm btn-ghost"
            onClick={handleDelete}
            aria-label="Delete task"
          >
            <TrashIcon className="h-5 w-5 text-red-500 hover:text-red-700" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskItem;
