export default function TaskCard({ task }) {
    return (
      <div
        style={{
          padding: "10px",
          marginBottom: "10px",
          background: "white",
          borderRadius: "8px",
        }}
      >
        <h4>{task.title}</h4>
        <p>{task.priority}</p>
        {task.dueDate && (
          <small>
            {new Date(task.dueDate).toLocaleDateString()}
          </small>
        )}
      </div>
    );
  }