import React from "react";
import TodoItem from "./TodoItem";
import TodoForm from "./TodoForm";

function TodoList({ title, todos, addTodo, updateTodo, deleteTodo, column }) {
  return (
    <div className="task-column">
      <h2>{title}</h2>
      <TodoForm addTodo={addTodo} column={column} />
      {todos.length === 0 ? (
        <p className="text-gray-400 text-center mt-2">No tasks yet.</p>
      ) : (
        todos.map((todo) => (
          <TodoItem
            key={todo._id}
            todo={todo}
            updateTodo={updateTodo}
            deleteTodo={deleteTodo}
          />
        ))
      )}
    </div>
  );
}

export default TodoList;
