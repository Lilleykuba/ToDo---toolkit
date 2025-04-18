import { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

interface EditNoteProps {
  noteId: string | null;
}

const EditNote = ({ noteId }: EditNoteProps) => {
  const [note, setNote] = useState<any>(null);

  useEffect(() => {
    if (!noteId) return; // Guard: do nothing if noteId is null
    // Fetch the note details
    const fetchNote = async () => {
      const noteRef = doc(db, "notes", noteId);
      const noteSnap = await getDoc(noteRef);
      if (noteSnap.exists()) {
        setNote(noteSnap.data());
      }
    };

    fetchNote();
  }, [noteId]);

  const handleSave = async () => {
    if (!noteId || !note) return; // Guard: ensure noteId is valid before saving

    try {
      const noteRef = doc(db, "notes", noteId);
      await updateDoc(noteRef, note);
      const modal = document.getElementById(
        "editNoteModal"
      ) as HTMLDialogElement | null;
      if (modal) {
        modal.close();
      }
    } catch (error) {
      console.error("Error updating note:", error);
    }
  };

  if (!note) return <p>Loading note...</p>;

  return (
    <div className="min-w-full min-h-full flex flex-col items-center justify-center bg-base-100 m-0 rounded">
      <div className="card bg-base-200 shadow-xl w-full p-6">
        <h1 className="text-xl font-bold mb-4 text-center text-primary">
          Edit Note
        </h1>
        <div className="form-control mb-4">
          <label className="label">Note Title</label>
          <input
            type="text"
            value={note.title}
            onChange={(e) => setNote({ ...note, title: e.target.value })}
            className="input input-bordered"
          />
        </div>
        <div className="form-control mb-4">
          <label className="label">Note Content</label>
          <textarea
            value={note.content}
            onChange={(e) => setNote({ ...note, content: e.target.value })}
            className="textarea h-36 textarea-bordered"
          />
        </div>
        <button onClick={handleSave} className="btn btn-primary w-full">
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default EditNote;
