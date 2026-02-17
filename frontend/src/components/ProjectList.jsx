export default function ProjectList({ projects, selected, setSelected }) {
    return (
      <div>
        {projects.map((project) => (
          <div
            key={project._id}
            onClick={() => setSelected(project._id)}
            style={{
              padding: "8px",
              background: selected === project._id ? "#ddd" : "transparent",
              cursor: "pointer",
            }}
          >
            {project.name}
          </div>
        ))}
      </div>
    );
  }