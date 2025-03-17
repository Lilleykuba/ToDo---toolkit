import {
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase";
import { getAuth } from "firebase/auth";
import { cat } from "@cloudinary/url-gen/qualifiers/focusOn";
import { useEffect, useState } from "react";
import { TrashIcon } from "@heroicons/react/24/solid";

interface User {
  uid: string;
  displayName?: string;
  email?: string;
}

interface Note {
  id: string;
  owner: string;
  title: string;
  content: string;
  sharedWith?: string[];
}

const Notes = ({
  note,
}: {
  note: {
    id: string;
    owner: string;
    title: string;
    content: string;
    sharedWith?: string[];
  };
}) => {
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

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-col items-start gap-2 w-full">
        <h2 className="text-primary text-3xl mb-3">Add a new note</h2>
        <input
          type="text"
          placeholder="Title"
          value={noteTitle}
          onChange={(e) => setNoteTitle(e.target.value)}
          className="input input-bordered w-full"
        />
        <textarea
          placeholder="Content"
          value={noteContent}
          onChange={(e) => setNoteContent(e.target.value)}
          className="textarea h-36 textarea-bordered mb-4 w-full"
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

      <divider className="flex justify-center items-wrap flex-wrap gap-2 w-full mt-8">
        {Notes.map((note) => (
          <div
            key={note.id}
            className="flex flex-col min-w-48 w-auto items-start gap-2 w-full border p-4 rounded-lg shadow-md relative"
          >
            <h2 className="text-primary text-3xl mb-3">{note.title}</h2>
            <p className="whitespace-pre-line">{note.content}</p>
            <button
              onClick={() => handleDelete(note.id)}
              className="btn btn-ghost btn-sm absolute bottom-2 right-2"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        ))}
      </divider>
    </div>
  );
};

export default Notes;
