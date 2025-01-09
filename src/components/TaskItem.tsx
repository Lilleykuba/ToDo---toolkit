import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import { TrashIcon } from "@heroicons/react/24/solid";

const TaskItem = ({
  task,
}: {
  task: { id: string; name: string; completed: boolean };
}) => {
  const handleComplete = async () => {
    const taskRef = doc(db, "tasks", task.id);
    await updateDoc(taskRef, {
      completed: !task.completed,
    });
  };

  const handleDelete = async () => {
    const taskRef = doc(db, "tasks", task.id);
    await deleteDoc(taskRef);
  };

  return (
    <div className="card bg-base-100 shadow-md">
      <div className="card-body">
        <div className="flex justify-between items-center">
          <div className="flex flex-start space-x-6">
            <input
              type="checkbox"
              className="checkbo"
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
