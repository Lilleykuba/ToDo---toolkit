import React, { useState, useEffect } from "react";
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
  deleteDoc,
} from "firebase/firestore";
import {
  PencilIcon,
  TrashIcon,
  ArrowRightCircleIcon,
  ArrowDownCircleIcon,
} from "@heroicons/react/24/solid";
import { db } from "../firebase";
import { getAuth } from "firebase/auth";
import TaskItem from "./TaskItem";
import EditNote from "./EditNote";

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

interface note {
  id: string;
  owner: string;
  title: string;
  content: string;
  sharedWith?: string[];
  deleted: boolean;
}

const Dashboard = ({
  selectedCategory,
  onShareTask,
}: {
  selectedCategory: string | null;
  onShareTask: (taskId: string) => void;
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Record<string, string>>({});
  const [showCompletedTasks, setShowCompletedTasks] = useState(false);
  const [showCompletedNotes, setShowCompletedNotes] = useState(false);
  const [notes, setNotes] = useState<note[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

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
            where("completed", "==", true)
          )
        : query(
            tasksRef,
            where("uid", "==", user.uid),
            where("completed", "==", true)
          );

      // Build query for tasks shared with the user
      const sharedQuery = selectedCategory
        ? query(
            tasksRef,
            where("sharedWith", "array-contains", user.uid),
            where("categoryId", "==", selectedCategory),
            where("completed", "==", true)
          )
        : query(
            tasksRef,
            where("sharedWith", "array-contains", user.uid),
            where("completed", "==", true)
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

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const notesRef = collection(db, "notes");
      const notesQuery = query(
        notesRef,
        where("uid", "==", user.uid),
        where("deleted", "==", true)
      );
      const unsubscribe = onSnapshot(notesQuery, (snapshot) => {
        let ownedNotes: note[] = [];
        snapshot.forEach((doc) => {
          ownedNotes.push({
            id: doc.id,
            owner: doc.data().owner,
            title: doc.data().title,
            content: doc.data().content,
            sharedWith: doc.data().sharedWith,
            deleted: doc.data().deleted as boolean,
          });
        });
        setNotes(ownedNotes);
      });
      return () => {
        unsubscribe();
      };
    }
  }, [auth.currentUser]);

  const handleDelete = async (id: string) => {
    const user = auth.currentUser;
    if (user) {
      try {
        const noteRef = doc(db, "notes", id);
        await deleteDoc(noteRef);
        console.log("Note deleted from Firestore!");
      } catch (error) {
        console.error("Error deleting note from Firestore:", error);
      }
    }
  };

  const showNotesModal = (id: string) => {
    setSelectedNoteId(id);
    const modal = document.getElementById(
      "editNoteModal"
    ) as HTMLDialogElement | null;
    if (modal) {
      modal.showModal();
    }
  };

  return (
    <>
      <dialog id="editNoteModal" className="modal">
        <div className="modal-box p-0">
          <form method="dialog"></form>
          <EditNote noteId={selectedNoteId} />
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
      <div className="flex flex-col w-full mt-4">
        <div className="collapse w-full">
          <input
            type="checkbox"
            onClick={() => setShowCompletedTasks(!showCompletedTasks)}
          />
          <h2 className="text-primary text-3xl mb-3 collapse-title">
            {showCompletedTasks ? (
              <ArrowDownCircleIcon className="h-8 w-8 inline-block" />
            ) : (
              <ArrowRightCircleIcon className="h-8 w-8 inline-block" />
            )}{" "}
            Completed Tasks: {tasks.length}
          </h2>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="tasks">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-4 overflow-auto max-h-96 collapse-content"
                >
                  {tasks.map((task, index) => (
                    <Draggable
                      key={task.id}
                      draggableId={task.id}
                      index={index}
                    >
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
        </div>
        <div className="divider"></div>
        <div className="collapse w-full">
          <input
            type="checkbox"
            onClick={() => setShowCompletedNotes(!showCompletedNotes)}
          />
          <h2 className="text-primary text-3xl mb-3 collapse-title">
            {showCompletedNotes ? (
              <ArrowDownCircleIcon className="h-8 w-8 inline-block" />
            ) : (
              <ArrowRightCircleIcon className="h-8 w-8 inline-block" />
            )}{" "}
            Deleted Notes: {notes.length}
          </h2>
          <div className="space-y-4 overflow-auto max-h-96 collapse-content">
            {notes.map((note) => (
              <div
                key={note.id}
                className="flex flex-col min-w-48 w-auto items-start gap-2 w-full border p-4 rounded-lg shadow-md relative"
              >
                <h2 className="text-primary text-3xl mb-3">{note.title}</h2>
                <p className="whitespace-pre-line">{note.content}</p>
                <button
                  onClick={() => showNotesModal(note.id)}
                  className="btn btn-ghost btn-sm absolute bottom-2 right-14"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(note.id)}
                  className="btn btn-ghost btn-sm absolute bottom-2 right-2"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default React.memo(Dashboard); // Using React.memo to prevent unnecessary re-renders
