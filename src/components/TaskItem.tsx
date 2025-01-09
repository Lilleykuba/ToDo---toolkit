import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import { getAuth } from "firebase/auth";
import { TrashIcon } from "@heroicons/react/24/solid";

const TaskItem = ({
  task,
  onDelete, // Callback for guest deletions
}: {
  task: { id: string; name: string; completed: boolean };
  onDelete?: (id: string) => void;
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
        // Delete task from Firestore
        const taskRef = doc(db, "tasks", task.id);
        await deleteDoc(taskRef);
        console.log("Task deleted from Firestore!");
      } catch (error) {
        console.error("Error deleting task from Firestore:", error);
      }
    } else if (onDelete) {
      // Call the onDelete callback for guest tasks
      onDelete(task.id);
    }
  };

  return (
    <div className="card bg-base-100 shadow-md">
      <div className="card-body">
        <div className="flex justify-between items-center">
          <div className="flex flex-start space-x-6">
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
