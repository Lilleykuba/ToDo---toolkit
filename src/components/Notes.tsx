import {
  doc,
  addDoc,
  deleteDoc,
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase";
import { getAuth } from "firebase/auth";
import EditNote from "./EditNote";
import React, { useEffect, useState } from "react";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/solid";

interface Note {
  id: string;
  owner: string;
  title: string;
  content: string;
  sharedWith?: string[];
}

const Notes = () => {
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [Notes, setNotes] = useState<Note[]>([]);

  const auth = getAuth();

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const notesRef = collection(db, "notes");
      const notesQuery = query(notesRef, where("uid", "==", user.uid));
      const unsubscribe = onSnapshot(notesQuery, (snapshot) => {
        let ownedNotes: Note[] = [];
        snapshot.forEach((doc) => {
          ownedNotes.push({
            id: doc.id,
            owner: doc.data().owner,
            title: doc.data().title,
            content: doc.data().content,
            sharedWith: doc.data().sharedWith,
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
    // modified to accept id
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

  const handleAddNote = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const noteRef = collection(db, "notes");
      await addDoc(noteRef, {
        owner: user.uid,
        uid: user.uid,
        createdAt: new Date(),
        title: noteTitle,
        content: noteContent,
      });

      setNoteTitle("");
      setNoteContent("");
    } catch (error) {
      console.error("Error adding note to Firestore:", error);
    }
  };

  const showNotesModal = () => {
    const modal = document.getElementById(
      "editNotesModal"
    ) as HTMLDialogElement | null;
    if (modal) {
      modal.showModal();
    }
  };

  return (
    <>
      <dialog id="editTaskModal" className="modal">
        <div className="modal-box p-0">
          <form method="dialog"></form>
          <EditNote noteId={note.id} />
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
      <div className="flex flex-col w-full">
        <div className="flex flex-col items-start gap-2 w-full">
          <input
            type="text"
            placeholder="Note title"
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
            className="input input-bordered input-primary w-full"
          />
          <textarea
            placeholder="Note content"
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            className="textarea h-36 textarea-primary textarea-bordered mb-4 w-full"
          />
          <button
            onClick={handleAddNote}
            className="btn btn-primary w-full"
            disabled={!noteTitle || !noteContent}
          >
            Add Note
          </button>
        </div>

        <div className="divider"></div>

        <div className="flex justify-center items-wrap flex-wrap gap-2 w-full mt-8">
          {Notes.map((note) => (
            <div
              key={note.id}
              className="flex flex-col min-w-48 w-auto items-start gap-2 w-full border p-4 rounded-lg shadow-md relative"
            >
              <h2 className="text-primary text-3xl mb-3">{note.title}</h2>
              <p className="whitespace-pre-line">{note.content}</p>
              <button
                onClick={showNotesModal}
                className="btn btn-ghost btn-sm absolute bottom-2 right-9"
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
    </>
  );
};

export default React.memo(Notes);
