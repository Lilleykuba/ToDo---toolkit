import "./App.css";
import TaskList from "./components/TaskList";
import AddTask from "./components/AddTask";

function App() {
  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-6">
      {/* Main Container */}
      <div className="w-full max-w-screen-xl bg-base-100 shadow-xl rounded-lg p-10">
        {/* Header */}
        <header className="text-center mb-10">
          <h1 className="text-5xl font-extrabold text-primary mb-4">
            Camo ToDo App
          </h1>
          <p className="text-lg text-base-content">
            Organize your tasks efficiently!
          </p>
        </header>

        {/* Content */}
        <div className="flex flex-col gap-10">
          {/* Add Task Section */}
          <section>
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
