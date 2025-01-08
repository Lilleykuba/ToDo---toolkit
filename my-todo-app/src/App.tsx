import "./App.css";
import TaskList from "./components/TaskList";
import AddTask from "./components/AddTask";

function App() {
  return (
    <div className="min-h-screen bg-base-200 flex flex-col items-center p-4">
      {/* Header */}
      <header className="text-center my-6">
        <h1 className="text-5xl font-extrabold text-primary">Camo ToDo App</h1>
        <p className="text-base-content mt-2">
          Organize your tasks efficiently!
        </p>
      </header>

      <div className="card bg-base-100 shadow-xl w-full max-w-2xl">
        <div className="card-body">
          {/* Add Task Component */}
          <section className="mb-6">
            <h2 className="text-2xl font-semibold text-primary">Add a Task</h2>
            <AddTask />
          </section>

          <div className="divider"></div>

          {/* Task List Component */}
          <section>
            <h2 className="text-2xl font-semibold text-primary">Your Tasks</h2>
            <TaskList />
          </section>
        </div>
      </div>
    </div>
  );
}

export default App;
