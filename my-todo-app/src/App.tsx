import "./App.css";
import TaskList from "./components/TaskList";
import AddTask from "./components/AddTask";

function App() {
  return (
    <div className="min-h-screen bg-base-200 flex flex-col items-center justify-center p-6">
      {/* Header */}
      <header className="text-center mb-10">
        <h1 className="text-5xl font-extrabold text-primary mb-4">
          Camo ToDo App
        </h1>
        <p className="text-lg text-base-content">
          Organize your tasks efficiently!
        </p>
      </header>

      <div className="card bg-base-100 shadow-xl w-full max-w-lg">
        <div className="card-body">
          {/* Add Task Section */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-primary mb-4">Add a Task</h2>
            <AddTask />
          </section>

          <div className="divider"></div>

          {/* Task List Section */}
          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">Your Tasks</h2>
            <TaskList />
          </section>
        </div>
      </div>
    </div>
  );
}

export default App;
