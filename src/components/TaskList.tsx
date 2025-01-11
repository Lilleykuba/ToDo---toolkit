import { useState, useEffect } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { getAuth } from "firebase/auth";
import TaskItem from "./TaskItem";

interface Task {
  id: string;
  name: string;
  completed: boolean;
  order: number;
  categoryId: string | null;
  priority: string;
}

const TaskList = ({
  selectedCategory,
  onEditTask,
}: {
  selectedCategory: string | null;
  onEditTask: (taskId: string) => void;
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Record<string, string>>({});
  const auth = getAuth();

  useEffect(() => {
    const user = auth.currentUser;

    if (user) {
      // Fetch categories and store in a map
      const categoriesRef = collection(db, "categories");
      const categoriesQuery = query(
        categoriesRef,
        where("uid", "==", user.uid)
      );
      const unsubscribeCategories = onSnapshot(categoriesQuery, (snapshot) => {
        const categoriesMap: Record<string, string> = {};
        snapshot.forEach((doc) => {
          categoriesMap[doc.id] = doc.data().color;
        });
        setCategories(categoriesMap);
      });

      // Fetch tasks
      const tasksRef = collection(db, "tasks");
      const tasksQuery = selectedCategory
        ? query(
            tasksRef,
            where("uid", "==", user.uid),
            where("categoryId", "==", selectedCategory)
          )
        : query(tasksRef, where("uid", "==", user.uid));
      const unsubscribeTasks = onSnapshot(tasksQuery, (snapshot) => {
        const tasksArray = snapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name || "Unnamed Task",
          completed: doc.data().completed || false,
          order: doc.data().order || 0,
          categoryId: doc.data().categoryId || null,
          priority: doc.data().priority || "Medium",
        }));
        setTasks(tasksArray.sort((a, b) => a.order - b.order));
      });

      return () => {
        unsubscribeCategories();
        unsubscribeTasks();
      };
    }
  }, [selectedCategory]);

  const handleDragEnd = async (result: DropResult) => {
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
    try {
      for (const task of updatedTasks) {
        const taskRef = doc(db, "tasks", task.id);
        await updateDoc(taskRef, { order: task.order });
      }
    } catch (error) {
      console.error("Error updating task order in Firestore:", error);
    }
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
                      categoryColor={
                        task.categoryId
                          ? categories[task.categoryId]
                          : undefined
                      }
                      onEdit={() => onEditTask(task.id)}
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
