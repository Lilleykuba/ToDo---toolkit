import { useState, useEffect } from "react";
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

interface Note {
  id: string;
  owner: string;
  name: string;
  content: string;
}

const Notes = () => {
  return (
    <div className="flex flex-col w-full mt-4">
      <div>
        <h2 className="text-primary text-3xl mb-3">
          Notes are a work in progress
        </h2>
      </div>
    </div>
  );
};

export default Notes;
