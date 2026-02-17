import { useEffect, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";
import { format } from "date-fns";

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    priority: "Medium",
    dueDate: "",
  });

  const token = localStorage.getItem("token");

  /* ================= FETCH PROJECTS ================= */
  const fetchProjects = async () => {
    const res = await fetch("http://localhost:5000/api/projects", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setProjects(data);
  };

  /* ================= FETCH TASKS ================= */
  const fetchTasks = async () => {
    const res = await fetch("http://localhost:5000/api/tasks", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setTasks(data);
  };

  useEffect(() => {
    fetchProjects();
    fetchTasks();
  }, []);

  /* ================= ADD TASK ================= */
  const handleAddTask = async () => {
    if (!selectedProject) return alert("Select project first!");

    await fetch("http://localhost:5000/api/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...newTask,
        project: selectedProject,
        status: "todo",
      }),
    });

    setShowModal(false);
    setNewTask({ title: "", priority: "Medium", dueDate: "" });
    fetchTasks();
  };

  /* ================= DRAG ================= */
  const onDragEnd = async (result) => {
    if (!result.destination) return;

    const taskId = result.draggableId;
    const newStatus = result.destination.droppableId;

    await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: newStatus }),
    });

    fetchTasks();
  };

  const getTasks = (status) =>
    tasks.filter(
      (task) =>
        task.project?._id === selectedProject &&
        task.status === status
    );

  const priorityColor = (priority) => {
    if (priority === "High") return "bg-red-500";
    if (priority === "Low") return "bg-green-500";
    return "bg-yellow-500";
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-indigo-900 to-purple-900 text-white">

      {/* SIDEBAR */}
      <div className="w-64 backdrop-blur-xl bg-white/10 p-6 border-r border-white/20">
        <h1 className="text-2xl font-bold mb-6">🚀 TaskFlow Pro</h1>

        <button
          onClick={() => {
            const name = prompt("Project name?");
            if (!name) return;

            fetch("http://localhost:5000/api/projects", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ name }),
            }).then(fetchProjects);
          }}
          className="w-full bg-white text-indigo-700 py-2 rounded-lg font-semibold mb-6"
        >
          + New Project
        </button>

        {projects.map((project) => (
          <div
            key={project._id}
            onClick={() => setSelectedProject(project._id)}
            className={`p-2 rounded-lg cursor-pointer mb-2 ${
              selectedProject === project._id
                ? "bg-white text-indigo-700"
                : "hover:bg-white/20"
            }`}
          >
            {project.name}
          </div>
        ))}
      </div>

      {/* BOARD */}
      <div className="flex-1 p-10 overflow-auto">

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-3 gap-6">

            {["todo", "in-progress", "done"].map((column) => (
              <Droppable key={column} droppableId={column}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="backdrop-blur-xl bg-white/10 p-6 rounded-2xl min-h-[500px]"
                  >
                    <h2 className="text-xl font-bold mb-4 capitalize">
                      {column.replace("-", " ")}
                    </h2>

                    {column === "todo" && (
                      <button
                        onClick={() => setShowModal(true)}
                        className="w-full bg-indigo-600 py-2 rounded-lg mb-4"
                      >
                        + Add Task
                      </button>
                    )}

                    {getTasks(column).map((task, index) => (
                      <Draggable
                        key={task._id}
                        draggableId={task._id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-white/20 p-4 rounded-xl mb-3 shadow-lg hover:scale-105 transition"
                          >
                            <div className="font-semibold">
                              {task.title}
                            </div>

                            <div className="flex justify-between mt-2 text-sm">
                              <span
                                className={`px-2 py-1 rounded text-white ${priorityColor(
                                  task.priority
                                )}`}
                              >
                                {task.priority}
                              </span>

                              {task.dueDate && (
                                <span>
                                  {format(
                                    new Date(task.dueDate),
                                    "MMM dd"
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}

                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            ))}

          </div>
        </DragDropContext>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white text-black p-6 rounded-xl w-96">
            <h2 className="text-xl font-bold mb-4">Create Task</h2>

            <input
              placeholder="Task title"
              className="w-full border p-2 rounded mb-3"
              value={newTask.title}
              onChange={(e) =>
                setNewTask({ ...newTask, title: e.target.value })
              }
            />

            <select
              className="w-full border p-2 rounded mb-3"
              value={newTask.priority}
              onChange={(e) =>
                setNewTask({ ...newTask, priority: e.target.value })
              }
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>

            <input
              type="date"
              className="w-full border p-2 rounded mb-4"
              value={newTask.dueDate}
              onChange={(e) =>
                setNewTask({ ...newTask, dueDate: e.target.value })
              }
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-400 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTask}
                className="px-4 py-2 bg-indigo-600 text-white rounded"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}