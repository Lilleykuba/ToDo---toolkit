import { useState, useEffect } from "react";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../firebase";
import { TrashIcon } from "@heroicons/react/24/solid";
import { v4 as uuidv4 } from "uuid";

const EditTask = ({
  taskId,
  onClose,
}: {
  taskId: string;
  onClose: () => void;
}) => {
  const [task, setTask] = useState<any>(null);
  const [newSubtask, setNewSubtask] = useState("");
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    // Fetch the task details
    const fetchTask = async () => {
      const taskRef = doc(db, "tasks", taskId);
      const taskSnap = await getDoc(taskRef);
      if (taskSnap.exists()) {
        setTask(taskSnap.data());
      }
    };

    fetchTask();
  }, [taskId]);

  useEffect(() => {
    // Fetch categories for the dropdown
    const fetchCategories = async () => {
      const user = getAuth().currentUser;
      if (!user) return;

      const categoriesRef = collection(db, "categories");
      const q = query(categoriesRef, where("uid", "==", user.uid));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const categoryList = snapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
          color: doc.data().color,
        }));
        setCategories(categoryList);
      });

      return () => unsubscribe();
    };

    fetchCategories();
  }, []);

  const handleAddSubtask = () => {
    if (newSubtask) {
      const updatedSubtasks = [
        ...(task.subtasks || []),
        { id: uuidv4(), name: newSubtask, completed: false },
      ];
      setTask({ ...task, subtasks: updatedSubtasks });
      setNewSubtask("");
    }
  };

  const handleRemoveSubtask = (subtaskId: string) => {
    const updatedSubtasks = task.subtasks.filter(
      (subtask: any) => subtask.id !== subtaskId
    );
    setTask({ ...task, subtasks: updatedSubtasks });
  };

  const handleSave = async () => {
    if (!task) return;

    try {
      const taskRef = doc(db, "tasks", taskId);
      await updateDoc(taskRef, task);
      onClose(); // Go back to the task list
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  if (!task) return <p>Loading task...</p>;

  return (
    <div className="min-w-full min-h-full flex flex-col items-center justify-center bg-base-100 m-0 rounded">
      <div className="card bg-base-200 shadow-xl w-full p-6">
        <h1 className="text-xl font-bold mb-4">Edit Task</h1>
        <div className="form-control mb-4">
          <label className="label">Task Name</label>
          <input
            type="text"
            value={task.name}
            onChange={(e) => setTask({ ...task, name: e.target.value })}
            className="input input-bordered"
          />
        </div>
        <div className="form-control mb-4">
          <label className="label">Priority</label>
          <select
            value={task.priority || "Medium"}
            onChange={(e) => setTask({ ...task, priority: e.target.value })}
            className="select select-bordered"
          >
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
        <div className="form-control mb-4">
          <label className="label">Category</label>
          <select
            value={task.categoryId || ""}
            onChange={(e) => setTask({ ...task, categoryId: e.target.value })}
            className="select select-bordered"
          >
            <option value="">None</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-control mb-4">
          <label className="label">Subtasks</label>
          <div className="space-y-2">
            {task.subtasks &&
              task.subtasks.map((subtask: any) => (
                <div key={subtask.id} className="flex items-center gap-2">
                  <span className="text-sm">{subtask.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(subtask.id)}
                    className="btn btn-ghost btn-sm"
                  >
                    <TrashIcon className="h-5 w-5 text-red-500 hover:text-red-700" />
                  </button>
                </div>
              ))}
          </div>
          <div className="flex gap-2 mt-4">
            <input
              type="text"
              placeholder="Add subtask"
              value={newSubtask}
              onChange={(e) => setNewSubtask(e.target.value)}
              className="input input-bordered flex-grow"
            />
            <button type="button" onClick={handleAddSubtask} className="btn">
              Add
            </button>
          </div>
        </div>
        <button onClick={handleSave} className="btn btn-primary w-full">
          Save Changes
        </button>
        <button onClick={onClose} className="btn btn-secondary w-full mt-4">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default EditTask;
