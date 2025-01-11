import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";
import { getAuth } from "firebase/auth";

interface Category {
  id: string;
  name: string;
  color: string;
}

const Categories = ({
  onCategorySelect,
}: {
  onCategorySelect: (id: string | null) => void;
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [color, setColor] = useState("#000000");
  const auth = getAuth();

  useEffect(() => {
    const user = auth.currentUser;

    if (user) {
      const q = query(
        collection(db, "categories"),
        where("uid", "==", user.uid)
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const categoriesArray = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Category[];
        setCategories(categoriesArray);
      });

      return () => unsubscribe();
    }
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;

    if (!user || !categoryName) return;

    try {
      await addDoc(collection(db, "categories"), {
        name: categoryName,
        color,
        uid: user.uid,
      });
      setCategoryName("");
      setColor("#000000");
    } catch (error) {
      console.error("Error adding category:", error);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteDoc(doc(db, "categories", id));
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  return (
    <div>
      <h3 className="text-lg font-bold mb-4 text-center">Categories</h3>
      <form
        onSubmit={handleAddCategory}
        className="flex items-center gap-2 mb-4"
      >
        <input
          type="text"
          placeholder="New Category"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          className="input input-bordered w-36"
        />
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-10 h-10 rounded-full border-none p-0 cursor-pointer"
        />
        <button type="submit" className="btn btn-primary">
          Add
        </button>
      </form>
      <ul className="space-y-2 mt-4 flex flex-col">
        <li>
          <button
            onClick={() => onCategorySelect(null)}
            className="btn btn-ghost w-full text-center"
          >
            Show All Tasks
          </button>
        </li>
        {categories.map((category) => (
          <button
            onClick={() => onCategorySelect(category.id)}
            key={category.id}
            className="flex items-center justify-between btn btn-ghost w-full text-left"
            style={{ borderLeft: `4px solid ${category.color}` }}
          >
            {category.name}
            <button
              onClick={() => handleDeleteCategory(category.id)}
              className="btn btn-sm btn-error"
            >
              ✕
            </button>
          </button>
        ))}
      </ul>
    </div>
  );
};

export default Categories;
