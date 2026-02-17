import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import axios from "axios";

const columns = [
  { id: "todo", title: "Todo" },
  { id: "in-progress", title: "In Progress" },
  { id: "done", title: "Done" },
];

export default function TaskBoard({ tasks, setTasks }) {

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;

    const updatedTasks = tasks.map((task) =>
      task._id === draggableId
        ? { ...task, status: destination.droppableId }
        : task
    );

    setTasks(updatedTasks);

    await axios.put(
      `http://localhost:5000/api/tasks/${draggableId}/status`,
      { status: destination.droppableId }
    );
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-3 gap-4">
        {columns.map((column) => (
          <Droppable key={column.id} droppableId={column.id}>
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="bg-gray-100 p-4 rounded min-h-[400px]"
              >
                <h2 className="font-bold mb-4">{column.title}</h2>

                {tasks
                  .filter((task) => task.status === column.id)
                  .map((task, index) => (
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
                          className="bg-white p-3 mb-3 rounded shadow"
                        >
                          <h3 className="font-semibold">{task.title}</h3>
                          <p className="text-sm">{task.description}</p>
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
  );
}