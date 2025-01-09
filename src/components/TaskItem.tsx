import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";

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
      <div className="card-body flex justify-between items-center">
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
        <button className="btn btn-error btn-sm" onClick={handleDelete}>
          Delete
        </button>
      </div>
    </div>
  );
};

export default TaskItem;