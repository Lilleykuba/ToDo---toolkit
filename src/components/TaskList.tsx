import { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import TaskItem from "./TaskItem";

interface Task {
  id: string;
  name: string;
  completed: boolean;
}

const TaskList = () => {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "tasks"), (snapshot) => {
      const tasksArray = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name || "Unnamed Task", // Provide a default value if name is missing
        completed: doc.data().completed || false, // Default to false if completed is missing
      }));
      setTasks(tasksArray);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </div>
  );
};

export default TaskList;
