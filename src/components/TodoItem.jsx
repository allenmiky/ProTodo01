import React from "react";

function TodoItem({ todo, updateTodo, deleteTodo }) {
  const handleStatusCycle = () => {
    const next =
      todo.status === "todo"
        ? "in-progress"
        : todo.status === "in-progress"
        ? "done"
        : "todo";
    updateTodo(todo._id, { status: next });
  };

  return (
    <div className="todo-card">
      <span
        onClick={handleStatusCycle}
        className={`todo-text ${
          todo.status === "done" ? "line-through text-green-400" : ""
        }`}
      >
        {todo.title}
      </span>
      <button onClick={() => deleteTodo(todo._id)} className="delete-btn">
        ✕
      </button>
    </div>
  );
}

export default TodoItem;
