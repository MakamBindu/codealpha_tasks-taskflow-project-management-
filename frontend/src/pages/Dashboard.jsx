import { useEffect, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editTaskId, setEditTaskId] = useState(null);

  const [newTask, setNewTask] = useState({
    title: "",
    priority: "Medium",
    dueDate: "",
  });

  const token = localStorage.getItem("token");

  /* ================= FETCH PROJECTS ================= */
  const fetchProjects = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/projects", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch projects error:", err);
    }
  };

  /* ================= FETCH TASKS ================= */
  const fetchTasks = async (projectId) => {
    if (!projectId) return;
  
    try {
      const res = await fetch(
        `http://localhost:5000/api/tasks/project/${projectId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      const data = await res.json();
  
      console.log("Fetched tasks:", data);  // 👈 ADD THIS
      setTasks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  /* ================= AUTO LOAD ================= */
  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchTasks(selectedProject);
    }
  }, [selectedProject]);

  /* ================= CREATE PROJECT ================= */
  const createProject = async () => {
    const name = prompt("Project name?");
    if (!name) return;

    await fetch("http://localhost:5000/api/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name }),
    });

    fetchProjects();
  };

  /* ================= DELETE PROJECT ================= */
  const deleteProject = async (id) => {
    await fetch(`http://localhost:5000/api/projects/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (selectedProject === id) {
      setSelectedProject(null);
      setTasks([]);
    }

    fetchProjects();
  };

  /* ================= SAVE TASK (CREATE + EDIT) ================= */
  const handleSaveTask = async () => {
    if (!selectedProject) return alert("Select project first!");

    try {
      if (editTaskId) {
        // UPDATE
        await fetch(`http://localhost:5000/api/tasks/${editTaskId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newTask),
        });
      } else {
        // CREATE
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
      }

      setShowModal(false);
      setEditTaskId(null);
      setNewTask({ title: "", priority: "Medium", dueDate: "" });

      fetchTasks(selectedProject);
    } catch (error) {
      console.error("Save task error:", error);
    }
  };

  /* ================= DELETE TASK ================= */
  const deleteTask = async (id) => {
    await fetch(`http://localhost:5000/api/tasks/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    fetchTasks(selectedProject);
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

    fetchTasks(selectedProject);
  };

  const getTasks = (status) =>
    tasks.filter((task) => task.status === status);

  return (
    <div className="flex h-screen bg-gradient-to-br from-indigo-900 to-purple-900 text-white">

      {/* SIDEBAR */}
      <div className="w-64 bg-white/10 p-6 border-r border-white/20">
        <h1 className="text-2xl font-bold mb-6">🚀 TaskFlow Pro</h1>

        <button
          onClick={createProject}
          className="w-full bg-white text-indigo-700 py-2 rounded-lg font-semibold mb-6"
        >
          + New Project
        </button>

        {projects.map((project) => (
          <div
            key={project._id}
            className={`flex justify-between items-center p-2 rounded-lg mb-2 ${
              selectedProject === project._id
                ? "bg-indigo-600"
                : "hover:bg-white/20"
            }`}
          >
            <span
              onClick={() => setSelectedProject(project._id)}
              className="cursor-pointer flex-1"
            >
              {project.name}
            </span>

            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteProject(project._id);
              }}
              className="text-red-400 text-xs ml-2"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* BOARD */}
      <div className="flex-1 p-10 overflow-auto">
        {!selectedProject ? (
          <div className="text-center mt-20 text-2xl opacity-70">
            Select a project
          </div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="grid grid-cols-3 gap-6">
              {["todo", "in-progress", "done"].map((column) => (
                <Droppable key={column} droppableId={column}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="bg-white/10 p-6 rounded-2xl min-h-[500px]"
                    >
                      <h2 className="text-xl font-bold mb-4 capitalize">
                        {column.replace("-", " ")}
                      </h2>

                      {column === "todo" && (
                        <button
                          onClick={() => {
                            setEditTaskId(null);
                            setNewTask({
                              title: "",
                              priority: "Medium",
                              dueDate: "",
                            });
                            setShowModal(true);
                          }}
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
                              className="bg-white/20 p-4 rounded-xl mb-3"
                            >
                              <div className="font-semibold">
                                {task.title}
                              </div>

                              <div className="flex justify-between mt-2 text-xs">
                                <button
                                  onClick={() => {
                                    setEditTaskId(task._id);
                                    setNewTask({
                                      title: task.title,
                                      priority: task.priority,
                                      dueDate: task.dueDate
                                        ? task.dueDate.split("T")[0]
                                        : "",
                                    });
                                    setShowModal(true);
                                  }}
                                  className="text-blue-300"
                                >
                                  Edit
                                </button>

                                <button
                                  onClick={() => deleteTask(task._id)}
                                  className="text-red-400"
                                >
                                  Delete
                                </button>
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
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white text-black p-6 rounded-xl w-96">
            <h2 className="text-xl font-bold mb-4">
              {editTaskId ? "Edit Task" : "Create Task"}
            </h2>

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
                onClick={handleSaveTask}
                className="px-4 py-2 bg-indigo-600 text-white rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}