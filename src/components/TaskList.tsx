import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { getAuth } from "firebase/auth";
import TaskItem from "./TaskItem";

interface Task {
  id: string;
  name: string;
  completed: boolean;
  order: number;
}

const TaskList = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const auth = getAuth();

  useEffect(() => {
    const user = auth.currentUser;

    if (user) {
      // Fetch tasks from Firestore for logged-in and guest users
      const tasksRef = collection(db, "tasks");
      const q = query(tasksRef, where("uid", "==", user.uid));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const tasksArray = snapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name || "Unnamed Task",
          completed: doc.data().completed || false,
          order: doc.data().order || 0,
        }));
        setTasks(tasksArray.sort((a, b) => a.order - b.order));
      });

      return () => unsubscribe();
    }
  }, []);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const reorderedTasks = Array.from(tasks);
    const [movedTask] = reorderedTasks.splice(result.source.index, 1);
    reorderedTasks.splice(result.destination.index, 0, movedTask);

    // Update the order field for each task
    const updatedTasks = reorderedTasks.map((task, index) => ({
      ...task,
      order: index,
    }));

    setTasks(updatedTasks);

    // Persist updated order to Firestore
    const tasksRef = collection(db, "tasks");
    updatedTasks.forEach((task) => {
      const taskRef = collection(db, "tasks").doc(task.id);
      taskRef.update({ order: task.order });
    });
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="tasks">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="space-y-4"
          >
            {tasks.map((task, index) => (
              <Draggable key={task.id} draggableId={task.id} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <TaskItem
                      task={task}
                      dragHandleProps={provided.dragHandleProps}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default TaskList;
