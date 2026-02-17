import { Dialog } from "@headlessui/react";
import { useState, useEffect } from "react";
import API from "../api";

export default function TaskModal({ task, close }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    const { data } = await API.get(`/comments/${task._id}`);
    setComments(data);
  };

  const addComment = async () => {
    await API.post(`/comments/${task._id}`, { text });
    setText("");
    fetchComments();
  };

  return (
    <Dialog open={true} onClose={close} className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-96">
        <h2 className="text-xl font-bold mb-4 dark:text-white">
          {task.title}
        </h2>

        <div className="space-y-2 mb-4">
          {comments.map((c) => (
            <div key={c._id} className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
              <p className="dark:text-white">{c.text}</p>
            </div>
          ))}
        </div>

        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add comment..."
          className="w-full p-2 border rounded mb-2"
        />

        <button
          onClick={addComment}
          className="bg-indigo-500 text-white px-4 py-2 rounded"
        >
          Add
        </button>
      </div>
    </Dialog>
  );
}