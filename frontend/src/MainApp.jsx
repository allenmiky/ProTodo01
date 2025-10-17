// ✅ src/MainApp.jsx
import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";
import { FiCalendar, FiChevronLeft, FiChevronRight, FiArchive, FiSun, FiMoon, FiPlus, FiTrash2 } from "react-icons/fi";
import { FaClipboardList, FaCog, FaCheckCircle } from "react-icons/fa";

import API_BASE from "./config/api";
import ArchiveDrawer from "./components/ArchiveDrawer";
import DeleteConfirmModal from "./components/DeleteConfirmModal";
import Sidebar from "./components/Sidebar";
import ProfileMenu from "./components/ProfileMenu";
import AddTaskModal from "./components/AddTaskModal";
import AddBoardModal from "./components/AddBoardModal";
import TaskDescription from "./components/TaskDescription";

const ICONS = {
  todo: <FaClipboardList className="text-blue-500 text-xl" />,
  inprogress: <FaCog className="text-yellow-500 text-xl animate-spin-slow" />,
  done: <FaCheckCircle className="text-green-500 text-xl" />,
};

// ✅ MainApp Component
export default function MainApp({ initialUser, token, onLogout }) {
  // 🧠 Local user state
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("user");
      return saved && saved !== "undefined"
        ? JSON.parse(saved)
        : initialUser || null;
    } catch {
      return initialUser || null;
    }
  });

  const [boards, setBoards] = useState([]);
  const [archivedBoards, setArchivedBoards] = useState([]);
  const [activeBoardId, setActiveBoardId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dark, setDark] = useState(() => localStorage.getItem("dark") === "true");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showAddBoardModal, setShowAddBoardModal] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [modalColumn, setModalColumn] = useState("todo");
  const [editTask, setEditTask] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [boardToDelete, setBoardToDelete] = useState(null);


  // ✅ Dark mode toggle
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("dark", dark);
  }, [dark]);

  // ✅ Fetch Boards
  useEffect(() => {
    const fetchBoards = async () => {
      if (!token) return setLoading(false);
      try {
        const res = await axios.get(`${API_BASE}/boards`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (Array.isArray(res.data)) {
          const fixedBoards = res.data.map((b) => ({
            ...b,
            lists: b.lists ?? { todo: [], inprogress: [], done: [] },
          }));

          setBoards(fixedBoards.filter((b) => !b.archived));
          setArchivedBoards(fixedBoards.filter((b) => b.archived));

          if (!activeBoardId && fixedBoards.length > 0)
            setActiveBoardId(fixedBoards[0]._id);
        }
      } catch {
        toast.error("Failed to load boards");
      } finally {
        setLoading(false);
      }
    };
    fetchBoards();
  }, [token]);

  useEffect(() => {
    if (boards.length > 0 && !activeBoardId) {
      setActiveBoardId(boards[0]._id);
    }
  }, [boards]);

  // ✅ Fetch Tasks
  useEffect(() => {
    const fetchTasks = async () => {
      if (!token || !activeBoardId) return;
      try {
        const res = await axios.get(`${API_BASE}/tasks/${activeBoardId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const grouped = res.data.reduce(
          (acc, task) => {
            const col = task.status || "todo";
            if (!acc[col]) acc[col] = [];
            acc[col].push(task);
            return acc;
          },
          { todo: [], inprogress: [], done: [] }
        );

        setBoards((prev) =>
          prev.map((b) =>
            b._id === activeBoardId ? { ...b, lists: grouped } : b
          )
        );
      } catch (err) {
        console.error("❌ Error loading tasks:", err);
      }
    };
    fetchTasks();
  }, [activeBoardId, token]);

  // ✅ Add Board  
  const addBoard = async (boardName) => {
    const name =
      typeof boardName === "string"
        ? boardName.trim()
        : typeof boardName?.name === "string"
        ? boardName.name.trim()
        : "";

    if (!name) return toast.error("Please enter a valid board name");

    try {
      const res = await axios.post(
        `${API_BASE}/boards`,
        { name },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const boardWithLists = {
        ...res.data,
        lists: { todo: [], inprogress: [], done: [] },
      };

      setBoards((prev) => [...prev, boardWithLists]);
      setActiveBoardId(res.data._id);
      toast.success("Board added successfully!");
    } catch (err) {
      console.error("Add Board Error:", err);
      toast.error("Failed to add board");
    }
  };

  // ✅ Archive / Restore / Delete
  const handleArchiveBoard = async (board) => {
    try {
      const res = await axios.patch(
        `${API_BASE}/boards/${board._id}/archive`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const archivedBoard = res.data;
      setBoards((prev) => prev.filter((b) => b._id !== board._id));
      setArchivedBoards((prev) => [...prev, archivedBoard]);

      if (activeBoardId === board._id) {
        const nextBoard = boards.find((b) => b._id !== board._id);
        setActiveBoardId(nextBoard?._id || null);
      }
    } catch {
      toast.error("Failed to archive board");
    }
  };

  const handleRestoreBoard = async (board) => {
    try {
      await axios.patch(
        `${API_BASE}/boards/${board._id}/restore`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setArchivedBoards((prev) => prev.filter((b) => b._id !== board._id));
      setBoards((prev) => [...prev, { ...board, archived: false }]);
      toast.success(`"${board.name}" restored`);
    } catch {
      toast.error("Failed to restore board");
    }
  };

  const handleDeleteClick = (board) => {
    setBoardToDelete(board);
    setShowDeleteModal(true);
  };

  const confirmDeleteBoard = async () => {
    if (!boardToDelete) return;
    try {
      await axios.delete(`${API_BASE}/boards/${boardToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setBoards((prev) => prev.filter((b) => b._id !== boardToDelete._id));
      setArchivedBoards((prev) => prev.filter((b) => b._id !== boardToDelete._id));
      setShowDeleteModal(false);
      toast.success("Board deleted successfully!");
    } catch {
      toast.error("Failed to delete board");
    }
  };

  // ✅ Add / Update / Delete Task
  const addTask = async (task, columnId) => {
    if (!token) return toast.error("Login required");
    try {
      const res = await axios.post(
        `${API_BASE}/tasks`,
        {
          title: task.title,
          description: task.desc,
          date: task.date,
          status: columnId,
          board: activeBoardId,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBoards((prev) =>
        prev.map((b) =>
          b._id === activeBoardId
            ? {
                ...b,
                lists: {
                  ...b.lists,
                  [columnId]: [...(b.lists[columnId] || []), res.data],
                },
              }
            : b
        )
      );
      toast.success("Task added successfully!");
    } catch {
      toast.error("Failed to add task");
    }
  };

  const updateTask = async (updatedTask) => {
    if (!token) return toast.error("Login required");
    try {
      const taskId = updatedTask._id || updatedTask.id;
      const res = await axios.put(
        `${API_BASE}/tasks/${taskId}`,
        {
          title: updatedTask.title,
          description: updatedTask.desc || updatedTask.description,
          date: updatedTask.date,
          status: modalColumn,
          board: activeBoardId,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setBoards((prev) =>
        prev.map((b) =>
          b._id === activeBoardId
            ? {
                ...b,
                lists: {
                  ...b.lists,
                  [modalColumn]: b.lists[modalColumn].map((t) =>
                    t._id === taskId ? res.data : t
                  ),
                },
              }
            : b
        )
      );
      toast.success("Task updated successfully!");
      setEditTask(null);
    } catch {
      toast.error("Error updating task");
    }
  };

  const deleteTask = async (taskId) => {
    if (!token) return toast.error("Login required");
    try {
      await axios.delete(`${API_BASE}/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBoards((prev) =>
        prev.map((b) => ({
          ...b,
          lists: Object.fromEntries(
            Object.entries(b.lists).map(([k, arr]) => [
              k,
              arr.filter((t) => t._id !== taskId),
            ])
          ),
        }))
      );
      toast.success("Deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  // ✅ Drag & Drop
  const onDragEnd = async (result) => {
    const { source, destination } = result;
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    const board = boards.find((b) => b._id === activeBoardId);
    const startList = [...board.lists[source.droppableId]];
    const [moved] = startList.splice(source.index, 1);
    const endList = [...board.lists[destination.droppableId]];
    endList.splice(destination.index, 0, moved);

    setBoards((prev) =>
      prev.map((b) =>
        b._id === activeBoardId
          ? {
              ...b,
              lists: {
                ...b.lists,
                [source.droppableId]: startList,
                [destination.droppableId]: endList,
              },
            }
          : b
      )
    );

    try {
      await axios.put(
        `${API_BASE}/tasks/${moved._id}`,
        { status: destination.droppableId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch {
      toast.error("Failed to update task position");
    }
  };

  const activeBoard =
    boards.find((b) => b._id === activeBoardId) || {
      lists: { todo: [], inprogress: [], done: [] },
    };

  if (loading)
    return (
      <div
        className={`h-screen flex items-center justify-center overflow-hidden ${
          dark ? "bg-gray-900" : "bg-sky-50"
        }`}
      >
        <div className="flex text-4xl md:text-6xl font-bold select-none">
          <span
            className="text-indigo-500 animate-slideLeft"
            style={{ animationDelay: "0s" }}
          >
            Pro
          </span>
          <span
            className="text-sky-500 animate-slideRight"
            style={{ animationDelay: "0.1s" }}
          >
            Todo
          </span>
        </div>
      </div>
    );

  return (
    <div
      className={`min-h-screen flex flex-col ${
        dark ? "bg-gray-900 text-gray-200" : "bg-sky-50 text-gray-800"
      }`}
    >
      <Toaster position="top-center" />

      {/* HEADER */}
      <header
        className={`h-14 px-6 flex items-center justify-between ${
          dark ? "bg-gray-900 border-gray-800" : "bg-white border-b border-sky-100"
        }`}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-full hover:bg-sky-100 dark:hover:bg-gray-700"
          >
            {sidebarOpen ? <FiChevronLeft /> : <FiChevronRight />}
          </button>

          <span className="text-lg font-bold bg-gradient-to-r from-sky-500 to-indigo-500 bg-clip-text text-transparent">
            Pro-Todo
          </span>

          <button
            onClick={() => setShowArchive(true)}
            className={`px-3 py-1 rounded-lg text-sm flex items-center ${
              dark ? "bg-gray-800" : "bg-sky-100"
            }`}
          >
            <FiArchive className="mr-1" /> Archive ({archivedBoards.length})
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setDark(!dark)}
            className="p-2 rounded-full hover:bg-sky-100 dark:hover:bg-gray-700"
          >
            {dark ? <FiSun /> : <FiMoon />}
          </button>

          <ProfileMenu
  user={user}
  setUser={setUser}   // ✅ this function now exists
  onLogout={onLogout}
  darkMode={dark}
/>

        </div>
      </header>

      {/* BODY */}
      <div className="flex flex-1 overflow-hidden">
        {sidebarOpen && (
          <Sidebar
            boards={boards}
            activeBoardId={activeBoardId}
            setActiveBoardId={setActiveBoardId}
            addBoard={() => setShowAddBoardModal(true)}
            onArchive={handleArchiveBoard}
            onDelete={handleDeleteClick}
            darkMode={dark}
          />
        )}

        {/* ✅ Main Board */}
        <main className="flex-1 p-6 overflow-auto">
          {activeBoardId && (
            <h1 className="text-3xl font-bold mb-6">{activeBoard.name}</h1>
          )}


          <AddTaskModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            onSave={addTask}
            onUpdate={updateTask}
            column={modalColumn}
            task={editTask}
            darkMode={dark}
          />

          <AddBoardModal
            isOpen={showAddBoardModal}
            onClose={() => setShowAddBoardModal(false)}
            onConfirm={(name) => {
              addBoard(name);
              setShowAddBoardModal(false);
            }}
            darkMode={dark}
          />

          {/* ✅ Inline No Board State */}
          {boards.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-center mb-8">
              <h2
                className={`text-2xl font-semibold mb-3 ${dark ? "text-gray-400" : "text-gray-600"
                  }`}
              >
                No Board Added
              </h2>
              <p
                className={`mb-6 text-sm ${dark ? "text-gray-500" : "text-gray-400"
                  }`}
              >
                Create your first board to get started 🚀
              </p>
              <button
                onClick={() => setShowAddBoardModal(true)}
                className={`px-4 py-2 rounded-xl font-semibold flex items-center gap-2 transition-all ${dark
                  ? "bg-gray-700 hover:bg-gray-600 text-white"
                  : "bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white"
                  }`}
              >
                <FiPlus className="text-lg" /> Add Board
              </button>
            </div>
          )}

          {/* ✅ Task Columns */}
          {boards.length > 0 && (
            <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-5">
              <DragDropContext onDragEnd={onDragEnd}>
                {Object.entries(activeBoard.lists ?? {}).map(([colId, tasks = []]) => (

                  <Droppable key={colId} droppableId={colId}>
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`rounded-2xl p-4 shadow-md transition-all ${dark ? "bg-gray-800" : "bg-white"
                          }`}
                      >
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          {ICONS[colId]}{" "}
                          {colId === "todo"
                            ? "To Do"
                            : colId === "inprogress"
                              ? "In Progress"
                              : "Done"}{" "}
                          <span className="ml-auto text-sm text-gray-500">
                            ({tasks.length})
                          </span>
                        </h2>

                        {tasks.map((task, index) => (
                          <Draggable key={task._id} draggableId={task._id} index={index}>
                            {(p) => (
                              <div
                                {...p.draggableProps}
                                {...p.dragHandleProps}
                                ref={p.innerRef}
                                onClick={() => {
                                  setEditTask(task);
                                  setModalColumn(colId);
                                  setShowModal(true);
                                }}
                                className={`mb-3 p-4 rounded-xl border shadow-sm cursor-pointer transition-all hover:shadow-lg overflow-hidden ${dark
                                  ? "bg-gray-700 border-gray-600 text-gray-100"
                                  : "bg-white border-gray-200 text-gray-900"
                                  }`}
                              >
                                <div className="flex justify-between items-start mb-1">
                                  <h3 className="font-semibold text-base">{task.title}</h3>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteTask(task._id);
                                    }}
                                    className="p-1 rounded-full hover:bg-rose-500/20 text-rose-500"
                                  >
                                    <FiTrash2 />
                                  </button>
                                </div>

                                {task.description && (
                                  <TaskDescription desc={task.description} />
                                )}

                                {task.date && (
                                  <div className="flex items-center gap-1 mt-1">
                                    <FiCalendar className="text-green-500 text-xs" />
                                    <span className="text-[11px] text-green-500">
                                      {new Date(task.date).toLocaleDateString()}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}
                          </Draggable>
                        ))}

                        {provided.placeholder}

                        <button
                          onClick={() => {
                            setEditTask(null);
                            setModalColumn(colId);
                            setShowModal(true);
                          }}
                          className={`mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-xl font-semibold shadow-sm transition-all ${dark
                            ? "bg-[#4F46E5] hover:bg-[#6366F1] text-white"
                            : "bg-[#4F46E5] hover:bg-[#6366F1] text-white"
                            }`}
                        >
                          <FiPlus className="text-lg" /> Add Task
                        </button>
                      </div>
                    )}
                  </Droppable>
                ))}
              </DragDropContext>
            </div>
          )}

          {/* ✅ Archive Drawer */}
          {showArchive && (
            <ArchiveDrawer
              boards={archivedBoards}
              onRestore={handleRestoreBoard}
              onDeleteClick={handleDeleteClick}
              darkMode={dark}
              onClose={() => setShowArchive(false)}
            />
          )}

          {/* ✅ Delete Confirm Modal */}
          <DeleteConfirmModal
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={confirmDeleteBoard}
            title={boardToDelete?.name}
            darkMode={dark}
          />
        </main>
      </div>
    </div>
  );
}
