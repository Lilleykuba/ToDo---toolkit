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

const EditTask = ({
  taskId,
  onClose,
}: {
  taskId: string;
  onClose: () => void;
}) => {
  const [task, setTask] = useState<any>(null);
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

  const handleSave = async () => {
    if (!task) return;

    try {
      const taskRef = doc(db, "tasks", taskId);
      await updateDoc(taskRef, task);
      alert("Task updated successfully!");
      onClose(); // Go back to the task list
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  if (!task) return <p>Loading task...</p>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-base-100 max-w-md mx-auto rounded">
      <div className="card bg-base-200 shadow-xl w-full max-w-md p-6">
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
