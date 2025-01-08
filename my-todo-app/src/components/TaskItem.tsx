import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { deleteDoc } from "firebase/firestore";

const TaskItem = ({ task }) => {
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
    <>
      <div>
        <input
          type="checkbox"
          checked={task.completed}
          onChange={handleComplete}
        />
        <span>{task.name}</span>
      </div>
      <div>
        <span>{task.name}</span>
        <button onClick={handleDelete}>Delete</button>
      </div>
    </>
  );
};

export default TaskItem;
