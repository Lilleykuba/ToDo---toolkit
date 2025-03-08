import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import { getAuth } from "firebase/auth";
import { PencilIcon, TrashIcon, ShareIcon } from "@heroicons/react/24/solid";

const TaskItem = ({
  task,
  dragHandleProps,
  categoryColor,
  onEdit,
  onShare,
}: {
  task: {
    id: string;
    owner: string;
    name: string;
    completed: boolean;
    categoryId: string | null;
    priority: string;
    subtasks?: { id: string; name: string; completed: boolean }[];
    sharedWith?: string[];
  };
  dragHandleProps?: any; // Drag handle props for drag-and-drop functionality
  categoryColor?: string; // Color of the associated category
  onEdit: () => void;
  onShare: () => void;
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

  const handleSubtaskComplete = async (subtaskId: string) => {
    const updatedSubtasks = task.subtasks?.map((subtask) =>
      subtask.id === subtaskId
        ? { ...subtask, completed: !subtask.completed }
        : subtask
    );

    const taskRef = doc(db, "tasks", task.id);
    await updateDoc(taskRef, { subtasks: updatedSubtasks });
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
            className="btn btn-sm btn-ghost w-5 h-5 p-0 hover:bg-transparent"
            aria-label="Edit task"
          >
            <PencilIcon className="h-full w-full text-blue-500 hover:text-blue-700" />
          </button>
          <button
            onClick={onShare}
            className="btn btn-sm btn-ghost w-5 h-5 p-0 hover:bg-transparent"
            aria-label="Share task"
          >
            <ShareIcon className="h-full w-full text-green-500 hover:text-green-700" />
          </button>
          <button
            className="btn btn-sm btn-ghost w-5 h-5 p-0 hover:bg-transparent"
            onClick={handleDelete}
            aria-label="Delete task"
          >
            <TrashIcon className="h-full w-full text-red-500 hover:text-red-700" />
          </button>
        </div>
      </div>
      {/* Subtasks */}
      {task.subtasks && task.subtasks.length > 0 && (
        <div className="mt-2 ml-8 border-l-2 pl-4 border-gray-300 w-full">
          <h4 className="text-sm font-semibold text-gray-400 mb-2">
            Subtasks:
          </h4>
          <div className="space-y-2">
            {task.subtasks.map((subtask) => (
              <div
                key={subtask.id}
                className="flex justify-between items-start"
              >
                <div className="flex items-center space-x-4">
                  <input
                    type="checkbox"
                    className="checkbox"
                    checked={subtask.completed}
                    onChange={() => handleSubtaskComplete(subtask.id)}
                  />
                  <span
                    className={`text-sm ${
                      subtask.completed
                        ? "line-through text-gray-600"
                        : "text-gray-400"
                    }`}
                  >
                    {subtask.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskItem;
