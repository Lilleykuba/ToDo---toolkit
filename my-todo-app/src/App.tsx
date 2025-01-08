import { useState } from "react";
import "./App.css";
import TaskList from "./components/TaskList";
import AddTask from "./components/AddTask";

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      {/* Header */}
      <header className="text-center my-4">
        <h1 className="text-4xl font-bold text-blue-600">Camo ToDo App</h1>
        <p className="text-gray-500">Organize your tasks efficiently!</p>
      </header>

      {/* Add Task Component */}
      <section className="w-full max-w-md mb-8">
        <AddTask />
      </section>

      {/* Task List Component */}
      <section className="w-full max-w-md">
        <TaskList />
      </section>
    </div>
  );
}

export default App;
