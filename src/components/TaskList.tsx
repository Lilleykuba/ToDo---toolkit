import { useState, useEffect } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import { supabase } from "../supabaseClient";
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
  onShareTask,
}: {
  selectedCategory: string | null;
  onShareTask: (taskId: string) => void;
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Record<string, string>>({});
  const [sortMethod, setSortMethod] = useState<"newest" | "priority">("newest");

  useEffect(() => {
    const fetchData = async () => {
      // Fetch categories
      let { data: cats, error: catError } = await supabase
        .from("categories")
        .select("*")
        .eq("uid", supabase.auth.getSession()?.user?.id);
      if (!catError && cats) {
        const map: Record<string, string> = {};
        cats.forEach((cat: any) => {
          map[cat.id] = cat.color;
        });
        setCategories(map);
      }
      // Fetch owned tasks
      const baseQuery = supabase
        .from("tasks")
        .select("*")
        .eq("completed", false);
      let { data: ownedTasks, error: ownedError } = selectedCategory
        ? await baseQuery
            .eq("uid", supabase.auth.getSession()?.user?.id)
            .eq("categoryId", selectedCategory)
        : await baseQuery.eq("uid", supabase.auth.getSession()?.user?.id);
      // Fetch shared tasks
      let { data: sharedTasks, error: sharedError } = selectedCategory
        ? await baseQuery
            .contains("sharedWith", [supabase.auth.getSession()?.user?.id])
            .eq("categoryId", selectedCategory)
        : await baseQuery.contains("sharedWith", [
            supabase.auth.getSession()?.user?.id,
          ]);

      if (!ownedError && !sharedError) {
        const merged = [...(ownedTasks || []), ...(sharedTasks || [])];
        // Remove duplicates based on id
        const unique = merged.filter(
          (t: any, i: number, arr: any[]) =>
            i === arr.findIndex((item) => item.id === t.id)
        );
        setTasks(unique.sort((a: Task, b: Task) => a.order - b.order));
      }
    };
    fetchData();
  }, [selectedCategory]);

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const reorderedTasks = Array.from(tasks);
    const [moved] = reorderedTasks.splice(result.source.index, 1);
    reorderedTasks.splice(result.destination.index, 0, moved);
    const updatedTasks = reorderedTasks.map((task, idx) => ({
      ...task,
      order: idx,
    }));
    setTasks(updatedTasks);
    // Update orders in Supabase (batch update simulation)
    updatedTasks.forEach(async (task) => {
      await supabase
        .from("tasks")
        .update({ order: task.order })
        .eq("id", task.id);
    });
    handleSort(sortMethod);
  };

  const handleSort = (method: "newest" | "priority") => {
    setSortMethod(method);
    const sorted = [...tasks];
    if (method === "newest") {
      sorted.sort((a, b) => b.order - a.order);
    } else {
      const weight: Record<string, number> = { High: 3, Medium: 2, Low: 1 };
      sorted.sort(
        (a, b) => (weight[b.priority] || 0) - (weight[a.priority] || 0)
      );
    }
    setTasks(sorted);
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
