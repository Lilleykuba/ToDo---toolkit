import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { getAuth } from "firebase/auth";
import TaskItem from "./TaskItem";

interface Task {
  id: string;
  name: string;
  completed: boolean;
}

const TaskList = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const auth = getAuth();

  // Function to handle adding tasks to local storage for guest users
  const saveTasksToLocalStorage = (newTasks: Task[]) => {
    localStorage.setItem("guestTasks", JSON.stringify(newTasks));
    setTasks(newTasks);
  };

  useEffect(() => {
    const user = auth.currentUser; // Get the current user

    if (user) {
      // Fetch tasks from Firestore for logged-in users
      const tasksRef = collection(db, "tasks");
      const q = query(tasksRef, where("uid", "==", user.uid)); // Query tasks where UID matches
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const tasksArray = snapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name || "Unnamed Task",
          completed: doc.data().completed || false,
        }));
        setTasks(tasksArray);
      });

      return () => unsubscribe(); // Cleanup Firestore listener
    } else {
      // Fetch tasks from local storage for guest users
      const storedTasks = localStorage.getItem("guestTasks");
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      }
    }
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
