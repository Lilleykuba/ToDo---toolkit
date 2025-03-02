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
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase";
import { getAuth } from "firebase/auth";
import TaskItem from "./TaskItem";

interface Task {
  id: string;
  owner: string;
  name: string;
  completed: boolean;
  order: number;
  categoryId: string | null;
  priority: string;
  subtasks?: { id: string; name: string; completed: boolean }[];
  sharedWith?: string[];
}

const TaskList = ({
  selectedCategory,
  onEditTask,
  onShareTask,
}: {
  selectedCategory: string | null;
  onEditTask: (taskId: string) => void;
  onShareTask: (taskId: string) => void;
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Record<string, string>>({});
  const [sortMethod, setSortMethod] = useState<"newest" | "priority">("newest");
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

      const tasksRef = collection(db, "tasks");

      // Build query for owned tasks
      const ownedQuery = selectedCategory
        ? query(
            tasksRef,
            where("uid", "==", user.uid),
            where("categoryId", "==", selectedCategory),
            where("completed", "==", false)
          )
        : query(
            tasksRef,
            where("uid", "==", user.uid),
            where("completed", "==", false)
          );

      // Build query for tasks shared with the user
      const sharedQuery = selectedCategory
        ? query(
            tasksRef,
            where("sharedWith", "array-contains", user.uid),
            where("categoryId", "==", selectedCategory),
            where("completed", "==", false)
          )
        : query(
            tasksRef,
            where("sharedWith", "array-contains", user.uid),
            where("completed", "==", false)
          );

      // Arrays to hold snapshots from both queries
      let ownedTasks: Task[] = [];
      let sharedTasks: Task[] = [];

      // Merge the two query snapshots and remove duplicates by task id
      const mergeTasks = () => {
        const merged = [...ownedTasks, ...sharedTasks];
        const unique = merged.filter(
          (task, index, self) =>
            index === self.findIndex((t) => t.id === task.id)
        );
        // Sort by order (adjust if needed)
        setTasks(unique.sort((a, b) => a.order - b.order));
      };

      const unsubscribeOwned = onSnapshot(ownedQuery, (snapshot) => {
        ownedTasks = snapshot.docs.map((doc) => ({
          id: doc.id,
          owner: doc.data().uid, // mapping owner from uid
          name: doc.data().name || "Unnamed Task",
          completed: doc.data().completed || false,
          order: doc.data().order || 0,
          categoryId: doc.data().categoryId || null,
          priority: doc.data().priority || "Medium",
          subtasks: doc.data().subtasks || [],
          sharedWith: doc.data().sharedWith || [],
        }));
        mergeTasks();
      });

      const unsubscribeShared = onSnapshot(sharedQuery, (snapshot) => {
        sharedTasks = snapshot.docs.map((doc) => ({
          id: doc.id,
          owner: doc.data().uid, // mapping owner from uid
          name: doc.data().name || "Unnamed Task",
          completed: doc.data().completed || false,
          order: doc.data().order || 0,
          categoryId: doc.data().categoryId || null,
          priority: doc.data().priority || "Medium",
          subtasks: doc.data().subtasks || [],
          sharedWith: doc.data().sharedWith || [],
        }));
        mergeTasks();
      });

      return () => {
        unsubscribeCategories();
        unsubscribeOwned();
        unsubscribeShared();
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
    handleSort(sortMethod);

    // Use batch writes to update Firestore
    const batch = writeBatch(db);
    updatedTasks.forEach((task) => {
      const taskRef = doc(db, "tasks", task.id);
      batch.update(taskRef, { order: task.order });
    });

    try {
      await batch.commit();
    } catch (error) {
      console.error("Error updating task order in Firestore:", error);
    }
  };

  const handleSort = (method: "newest" | "priority") => {
    setSortMethod(method);
    const sortedTasks = [...tasks];

    if (method === "newest") {
      sortedTasks.sort((a, b) => b.order - a.order);
    } else {
      // Priority sorting (High > Medium > Low)
      const priorityWeight = { High: 3, Medium: 2, Low: 1 };
      sortedTasks.sort(
        (a, b) =>
          (priorityWeight[b.priority as keyof typeof priorityWeight] || 0) -
          (priorityWeight[a.priority as keyof typeof priorityWeight] || 0)
      );
    }

    setTasks(sortedTasks);
  };

  return (
    <>
      <div className="mb-4 flex gap-2 justify-end mt-[-50px]">
        <button
          className={`px-4 py-2 rounded ${
            sortMethod === "newest"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
          onClick={() => handleSort("newest")}
        >
          Newest
        </button>
        <button
          className={`px-4 py-2 rounded ${
            sortMethod === "priority"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
          onClick={() => handleSort("priority")}
        >
          Priority
        </button>
      </div>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="tasks">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-4 overflow-auto max-h-96"
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
                        onShare={() => onShareTask(task.id)}
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
    </>
  );
};

export default TaskList;
