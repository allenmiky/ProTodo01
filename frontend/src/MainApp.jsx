import React, { useState, useEffect, useCallback, useMemo } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Toaster, toast } from "react-hot-toast";
import { 
  FiCalendar, 
  FiChevronLeft, 
  FiChevronRight, 
  FiArchive, 
  FiSun, 
  FiMoon, 
  FiPlus, 
  FiSearch,
  FiTrash2,
  FiEdit3,
  FiMoreVertical
} from "react-icons/fi";
import { FaClipboardList, FaCog, FaCheckCircle, FaThumbtack } from "react-icons/fa";
import axios from "axios";
import API_BASE from "./config/api";
import API from "./utils/api";
import ArchiveDrawer from "./components/ArchiveDrawer";
import DeleteConfirmModal from "./components/DeleteConfirmModal";
import Sidebar from "./components/Sidebar";
import ProfileMenu from "./components/ProfileMenu";
import AddTaskModal from "./components/AddTaskModal";
import AddBoardModal from "./components/AddBoardModal";
import TaskDescription from "./components/TaskDescription";
import TaskCardMenu from "./components/TaskCardMenu";
import ArchiveCard from "./components/ArchiveCard";
import TaskBar from "./components/TaskBar";

// Default columns like Trello
const DEFAULT_COLUMNS = [
  { 
    id: 'todo', 
    name: 'To Do', 
    icon: <FaClipboardList className="text-blue-500 text-lg" />, 
    color: 'blue' 
  },
  { 
    id: 'inprogress', 
    name: 'In Progress', 
    icon: <FaCog className="text-yellow-500 text-lg" />, 
    color: 'yellow' 
  },
  { 
    id: 'done', 
    name: 'Done', 
    icon: <FaCheckCircle className="text-green-500 text-lg" />, 
    color: 'green' 
  },
];

const COLORS = {
  blue: { 
    bg: 'bg-blue-50', 
    border: 'border-blue-200', 
    text: 'text-blue-700', 
    dark: { bg: 'bg-blue-900/20', border: 'border-blue-700', text: 'text-blue-300' }
  },
  yellow: { 
    bg: 'bg-yellow-50', 
    border: 'border-yellow-200', 
    text: 'text-yellow-700', 
    dark: { bg: 'bg-yellow-900/20', border: 'border-yellow-700', text: 'text-yellow-300' }
  },
  green: { 
    bg: 'bg-green-50', 
    border: 'border-green-200', 
    text: 'text-green-700', 
    dark: { bg: 'bg-green-900/20', border: 'border-green-700', text: 'text-green-300' }
  },
};

const getBoardColumns = (boardId) => {
  return DEFAULT_COLUMNS;
};

const useApi = (token) => {
  const makeRequest = useCallback(async (method, url, data = null) => {
    try {
      const config = {
        method,
        url: `${API_BASE}${url}`,
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000,
        ...(data && { data })
      };
      
      const response = await axios(config);
      return { data: response.data, error: null };
    } catch (error) {
      console.error("API Error:", error);
      return { 
        data: null, 
        error: error.response?.data?.message || error.message 
      };
    }
  }, [token]);

  return { makeRequest };
};

// Simple Task Card Menu Component
const SimpleTaskCardMenu = ({ taskId, pinned, onDelete, onArchive, onPin, onEdit, darkMode }) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    {
      label: pinned ? 'Unpin' : 'Pin',
      icon: <FaThumbtack size={14} />,
      onClick: onPin,
      color: 'text-yellow-600'
    },
    {
      label: 'Edit',
      icon: <FiEdit3 size={14} />,
      onClick: onEdit,
      color: 'text-blue-600'
    },
    {
      label: 'Archive',
      icon: <FiArchive size={14} />,
      onClick: onArchive,
      color: 'text-gray-600'
    },
    {
      label: 'Delete',
      icon: <FiTrash2 size={14} />,
      onClick: onDelete,
      color: 'text-red-600'
    },
  ];

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`p-1.5 rounded-lg transition-colors ${
          darkMode 
            ? 'hover:bg-gray-600 text-gray-400' 
            : 'hover:bg-gray-100 text-gray-500'
        }`}
      >
        <FiMoreVertical size={16} />
      </button>

      {isOpen && (
        <div 
          className={`absolute right-0 top-8 z-10 w-48 rounded-xl border shadow-2xl backdrop-blur-sm ${
            darkMode 
              ? 'bg-gray-800 border-gray-600' 
              : 'bg-white border-gray-200'
          }`}
        >
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                item.onClick();
                setIsOpen(false);
              }}
              className={`flex items-center gap-3 w-full px-4 py-3 text-sm font-medium transition-colors border-b last:border-b-0 ${
                darkMode
                  ? 'hover:bg-gray-700 border-gray-600 text-gray-200'
                  : 'hover:bg-gray-50 border-gray-100 text-gray-700'
              } ${item.color}`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}

      {/* Close when clicking outside */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default function MainApp({ initialUser, token, onLogout, darkMode, setDarkMode, popupContext }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("user");
      return saved && saved !== "undefined" ? JSON.parse(saved) : initialUser || null;
    } catch {
      return initialUser || null;
    }
  });

  const [boards, setBoards] = useState([]);
  const [archivedBoards, setArchivedBoards] = useState([]);
  const [activeBoardId, setActiveBoardId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showAddBoardModal, setShowAddBoardModal] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [modalColumn, setModalColumn] = useState("todo");
  const [editTask, setEditTask] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [boardToDelete, setBoardToDelete] = useState(null);
  const [archivedCards, setArchivedCards] = useState({});
  const [showArchivedCards, setShowArchivedCards] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [dragState, setDragState] = useState({ isDragging: false, draggedFrom: null });
  const [operationLoading, setOperationLoading] = useState({ 
    addTask: false, 
    updateTask: false, 
    dragDrop: false 
  });

  const { makeRequest } = useApi(token);
  const activeBoard = useMemo(() => 
    boards.find((b) => b._id === activeBoardId) || {
      _id: "default",
      name: "Add Board",
      lists: { todo: [], inprogress: [], done: [] }
    }, [boards, activeBoardId]
  );

  const boardColumns = useMemo(() => 
    getBoardColumns(activeBoardId), [activeBoardId]
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('search-input')?.focus();
      }
      if (e.key === 'Escape') {
        setShowModal(false);
        setShowAddBoardModal(false);
        setShowArchive(false);
        setShowArchivedCards(false);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  const fetchBoards = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const { data, error } = await makeRequest('get', '/boards');
      
      if (error) throw new Error(error);

      if (Array.isArray(data)) {
        const fixedBoards = data.map((b) => ({
          ...b,
          lists: b.lists ?? { todo: [], inprogress: [], done: [] },
        }));

        setBoards(fixedBoards.filter((b) => !b.archived));
        setArchivedBoards(fixedBoards.filter((b) => b.archived));

        if (!activeBoardId && fixedBoards.length > 0) {
          setActiveBoardId(fixedBoards[0]._id);
        }
      }
    } catch (error) {
      console.error("Failed to load boards:", error);
      toast.error("Failed to load boards");
    } finally {
      setLoading(false);
    }
  }, [token, activeBoardId, makeRequest]);

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  const fetchTasks = useCallback(async () => {
    if (!token || !activeBoardId) return;
    try {
      const { data, error } = await makeRequest('get', `/tasks/${activeBoardId}`);
      if (error) throw new Error(error);

      const grouped = data.reduce((acc, task) => {
        const col = task.status || "todo";
        if (!acc[col]) acc[col] = [];
        acc[col].push({
          ...task,
          subtasks: (task.subtasks || []).map(st => ({
            id: st._id,
            title: st.title,
            done: st.completed || false,
          })),
        });
        return acc;
      }, {});

      // Ensure all columns have arrays
      boardColumns.forEach(col => {
        if (!grouped[col.id]) grouped[col.id] = [];
      });

      // Sort pinned tasks to top
      Object.keys(grouped).forEach(col => {
        grouped[col].sort((a, b) => (b.pinned === true) - (a.pinned === true));
      });

      setBoards((prev) =>
        prev.map((b) =>
          b._id === activeBoardId ? { ...b, lists: grouped } : b
        )
      );
    } catch (err) {
      console.error("Error loading tasks:", err);
      toast.error("Failed to load tasks");
    }
  }, [activeBoardId, token, makeRequest, boardColumns]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addBoard = async (boardName) => {
    const name = typeof boardName === "string" ? boardName.trim() : "";
    if (!name) return toast.error("Please enter a valid board name");

    try {
      const { data, error } = await makeRequest('post', '/boards', { name });
      if (error) throw new Error(error);

      const boardWithLists = {
        ...data,
        lists: { todo: [], inprogress: [], done: [] },
      };

      setBoards(prev => {
        const newBoards = [...prev, boardWithLists];
        setActiveBoardId(data._id);
        return newBoards;
      });

      toast.success("Board added successfully!");
    } catch (err) {
      console.error("Add board error:", err);
      toast.error("Failed to add board");
    }
  };

  const handleArchiveBoard = async (board) => {
    try {
      const { data, error } = await makeRequest('patch', `/boards/${board._id}/archive`, {});
      if (error) throw new Error(error);

      const archivedBoard = data;
      setBoards((prev) => prev.filter((b) => b._id !== board._id));
      setArchivedBoards((prev) => [...prev, archivedBoard]);

      if (activeBoardId === board._id) {
        const nextBoard = boards.find((b) => b._id !== board._id);
        setActiveBoardId(nextBoard?._id || null);
      }
      
      toast.success(`"${board.name}" archived`);
    } catch (err) {
      console.error("Archive board error:", err);
      toast.error("Failed to archive board");
    }
  };

  const handleRestoreBoard = async (board) => {
    try {
      const { error } = await makeRequest('patch', `/boards/${board._id}/restore`, {});
      if (error) throw new Error(error);

      setArchivedBoards((prev) => prev.filter((b) => b._id !== board._id));
      setBoards((prev) => [...prev, { ...board, archived: false }]);
      toast.success(`"${board.name}" restored`);
    } catch (err) {
      console.error("Restore board error:", err);
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
      const { error } = await makeRequest('delete', `/boards/${boardToDelete._id}`);
      if (error) throw new Error(error);

      setBoards((prev) => prev.filter((b) => b._id !== boardToDelete._id));
      setArchivedBoards((prev) => prev.filter((b) => b._id !== boardToDelete._id));
      setShowDeleteModal(false);
      setBoardToDelete(null);
      toast.success("Board deleted successfully!");
    } catch (err) {
      console.error("Delete board error:", err);
      toast.error("Failed to delete board");
    }
  };

  const addTask = async (task, columnId) => {
    if (!token) return toast.error("Login required");
    
    setOperationLoading(prev => ({...prev, addTask: true}));
    try {
      const { data, error } = await makeRequest('post', '/tasks', {
        title: task.title,
        description: task.desc,
        date: task.date,
        status: columnId,
        board: activeBoardId,
        subtasks: task.subtasks || [],
      });
      
      if (error) throw new Error(error);

      setBoards((prev) =>
        prev.map((b) =>
          b._id === activeBoardId
            ? {
                ...b,
                lists: {
                  ...b.lists,
                  [columnId]: [
                    ...(b.lists[columnId] || []),
                    {
                      ...data,
                      subtasks: (data.subtasks || []).map((st) => ({
                        id: st._id,
                        title: st.title,
                        done: st.completed || false,
                      })),
                    },
                  ],
                },
              }
            : b
        )
      );

      setShowModal(false);
      toast.success("Task added successfully!");
    } catch (error) {
      console.error("Add task error:", error);
      toast.error("Failed to add task");
    } finally {
      setOperationLoading(prev => ({...prev, addTask: false}));
    }
  };

  const updateTask = async (updatedTask) => {
    if (!token) return toast.error("Login required");
    
    setOperationLoading(prev => ({...prev, updateTask: true}));
    try {
      const taskId = updatedTask._id || updatedTask.id;
      const payload = {
        title: updatedTask.title,
        description: updatedTask.desc || updatedTask.description,
        date: updatedTask.date,
        status: updatedTask.status || modalColumn,
        board: activeBoardId,
        completed: updatedTask.completed || false,
        subtasks: (updatedTask.subtasks || []).map(st => ({
          _id: st._id,
          title: st.title,
          status: st.status || modalColumn,
          completed: st.completed || false,
        })),
      };

      const { data, error } = await makeRequest('put', `/tasks/${taskId}`, payload);
      if (error) throw new Error(error);

      setBoards((prev) =>
        prev.map((b) =>
          b._id === activeBoardId
            ? {
                ...b,
                lists: {
                  ...b.lists,
                  [modalColumn]: b.lists[modalColumn].map((t) =>
                    t._id === taskId ? data : t
                  ),
                },
              }
            : b
        )
      );

      setShowModal(false);
      setEditTask(null);
      toast.success("Task updated successfully!");
    } catch (err) {
      console.error("Update task error:", err);
      toast.error("Error updating task");
    } finally {
      setOperationLoading(prev => ({...prev, updateTask: false}));
    }
  };

  const handleCompleteTask = async (task) => {
    if (!task?._id) return;
    
    try {
      const { error } = await makeRequest('put', `/tasks/${task._id}`, {
        completed: !task.completed
      });
      
      if (error) throw new Error(error);

      setBoards((prev) =>
        prev.map((b) =>
          b._id === activeBoardId
            ? {
                ...b,
                lists: {
                  ...b.lists,
                  [task.status]: b.lists[task.status].map((t) =>
                    t._id === task._id ? { ...t, completed: !t.completed } : t
                  ),
                },
              }
            : b
        )
      );
    } catch (err) {
      console.error("Complete task error:", err);
      toast.error("Failed to update task");
    }
  };

  const handleArchiveTask = async (task) => {
    if (!task) return;
    
    try {
      const { error } = await makeRequest('patch', `/tasks/${task._id}/archive`, {});
      if (error) throw new Error(error);

      setBoards(prev =>
        prev.map(b => {
          if (b._id !== activeBoardId) return b;
          const newLists = Object.fromEntries(
            Object.entries(b.lists).map(([col, arr]) => [
              col,
              arr.filter(t => t._id !== task._id)
            ])
          );
          return { ...b, lists: newLists };
        })
      );

      setArchivedCards(prev => ({
        ...prev,
        [activeBoardId]: [...(prev[activeBoardId] || []), task]
      }));

      toast.success("Task archived!");
    } catch (err) {
      console.error("Archive task error:", err);
      toast.error("Failed to archive task");
    }
  };

  const deleteTask = async (taskId) => {
    if (!token) return toast.error("Login required");
    try {
      const { error } = await makeRequest('delete', `/tasks/${taskId}`);
      if (error) throw new Error(error);

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
      toast.success("Task deleted successfully");
    } catch (err) {
      console.error("Delete task error:", err);
      toast.error("Delete failed");
    }
  };

  const handlePinTask = async (taskId) => {
    if (!token) return toast.error("Login required");
    try {
      const { data, error } = await makeRequest('patch', `/tasks/${taskId}/pin`, {});
      if (error) throw new Error(error);

      const updatedTask = data;
      setBoards((prevBoards) =>
        prevBoards.map((board) => {
          if (board._id !== activeBoardId) return board;
          const newLists = Object.fromEntries(
            Object.entries(board.lists).map(([colId, tasks]) => {
              const updatedTasks = tasks.map((t) =>
                t._id === taskId ? { ...t, pinned: updatedTask.pinned } : { ...t }
              );
              const sortedTasks = [
                ...updatedTasks.filter((t) => t.pinned),
                ...updatedTasks.filter((t) => !t.pinned),
              ];
              return [colId, sortedTasks];
            })
          );
          return { ...board, lists: newLists };
        })
      );

      toast.success(updatedTask.pinned ? "Task pinned" : "Task unpinned");
    } catch (err) {
      console.error("Pin task error:", err);
      toast.error("Failed to pin task");
    }
  };

  const onDragStart = useCallback((result) => {
    setDragState({
      isDragging: true,
      draggedFrom: result.source.droppableId
    });
  }, []);

  const onDragEnd = useCallback(async (result) => {
    setDragState({ isDragging: false, draggedFrom: null });
    setOperationLoading(prev => ({...prev, dragDrop: true}));

    const { source, destination } = result;
    if (!destination) {
      setOperationLoading(prev => ({...prev, dragDrop: false}));
      return;
    }
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      setOperationLoading(prev => ({...prev, dragDrop: false}));
      return;
    }

    let movedTaskId = null;
    setBoards((prevBoards) => {
      return prevBoards.map((board) => {
        if (board._id !== activeBoardId) return board;
        const sourceTasks = Array.from(board.lists[source.droppableId] || []);
        const [movedTask] = sourceTasks.splice(source.index, 1);
        movedTaskId = movedTask?._id;

        if (source.droppableId === destination.droppableId) {
          sourceTasks.splice(destination.index, 0, movedTask);
          return {
            ...board,
            lists: {
              ...board.lists,
              [source.droppableId]: sourceTasks,
            },
          };
        }

        const destTasks = Array.from(board.lists[destination.droppableId] || []);
        destTasks.splice(destination.index, 0, movedTask);
        return {
          ...board,
          lists: {
            ...board.lists,
            [source.droppableId]: sourceTasks,
            [destination.droppableId]: destTasks,
          },
        };
      });
    });

    if (!movedTaskId) {
      setOperationLoading(prev => ({...prev, dragDrop: false}));
      return;
    }
    
    try {
      const { error } = await makeRequest('put', `/tasks/${movedTaskId}`, { 
        status: destination.droppableId 
      });
      if (error) throw new Error(error);
    } catch (err) {
      console.error("Drag drop error:", err);
      toast.error("Failed to update task position");
      fetchTasks(); // Revert to original state
    } finally {
      setOperationLoading(prev => ({...prev, dragDrop: false}));
    }
  }, [activeBoardId, makeRequest, fetchTasks]);

  const filteredTasksByColumn = useMemo(() => {
    const result = {};
    
    boardColumns.forEach(col => {
      const tasks = activeBoard?.lists?.[col.id] || [];
      
      const filtered = tasks.filter(task => {
        const matchesSearch = !searchTerm || 
          task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === "all" || task.status === filterStatus;
        
        return matchesSearch && matchesFilter;
      });

      const pinnedTasks = filtered.filter((t) => t.pinned);
      const unpinnedTasks = filtered.filter((t) => !t.pinned);
      result[col.id] = [...pinnedTasks, ...unpinnedTasks];
    });

    return result;
  }, [activeBoard, boardColumns, searchTerm, filterStatus]);

  if (loading)
    return (
      <div className={`h-screen flex items-center justify-center ${darkMode ? "bg-gray-900" : "bg-white"}`}>
        <div className="flex flex-col items-center">
          <div className="flex text-4xl md:text-6xl font-bold mb-4">
            <span className="text-indigo-500">Pro</span>
            <span className="text-sky-500">Todo</span>
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? "bg-gray-900 text-gray-200" : "bg-white text-gray-800"}`}>
      <Toaster 
        position="top-center" 
        toastOptions={{
          className: darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800',
        }}
      />

      {/* Header */}
      <header className={`h-16 px-6 flex items-center justify-between border-b ${
        darkMode
          ? "bg-gray-900 border-gray-700"
          : "bg-white border-gray-200"
      }`}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`p-2 rounded-xl transition-colors border ${
              darkMode
                ? "hover:bg-gray-800 border-gray-600"
                : "hover:bg-gray-50 border-gray-300"
            }`}
          >
            {sidebarOpen ? <FiChevronLeft size={20} /> : <FiChevronRight size={20} />}
          </button>

          <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            ProTodo
          </span>

          <button
            onClick={() => setShowArchive(true)}
            className={`px-4 py-2 rounded-xl text-sm flex items-center gap-2 transition-colors border ${
              darkMode
                ? "bg-gray-800 hover:bg-gray-700 border-gray-600"
                : "bg-white hover:bg-gray-50 border-gray-300"
            }`}
          >
            <FiArchive size={16} />
            Archive ({archivedBoards.length})
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center gap-4 flex-1 max-w-2xl mx-8">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              id="search-input"
              type="text"
              placeholder="Search tasks... (Ctrl+K)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-colors ${
                darkMode 
                  ? "bg-gray-800 border-gray-600 placeholder-gray-400 focus:border-indigo-500" 
                  : "bg-white border-gray-300 placeholder-gray-500 focus:border-indigo-400"
              } focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={`px-3 py-2.5 rounded-xl border text-sm transition-colors ${
              darkMode 
                ? "bg-gray-800 border-gray-600 focus:border-indigo-500" 
                : "bg-white border-gray-300 focus:border-indigo-400"
            } focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
          >
            <option value="all">All Status</option>
            {boardColumns.map(col => (
              <option key={col.id} value={col.id}>
                {col.name}
              </option>
            ))}
          </select>
        </div>

        {/* Theme Toggle and Profile */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2.5 rounded-xl border transition-colors ${
              darkMode
                ? "text-yellow-400 hover:bg-gray-800 border-gray-600"
                : "text-gray-600 hover:bg-gray-50 border-gray-300"
            }`}
          >
            {darkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
          </button>

          <ProfileMenu
            user={user}
            setUser={setUser}
            onLogout={onLogout}
            darkMode={darkMode}
            archivedCount={archivedBoards.length}
            onShowArchive={() => setShowArchive(true)}
          />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {sidebarOpen && (
          <Sidebar
            boards={boards}
            activeBoardId={activeBoardId}
            setActiveBoardId={setActiveBoardId}
            addBoard={() => setShowAddBoardModal(true)}
            onArchive={handleArchiveBoard}
            onDelete={handleDeleteClick}
            darkMode={darkMode}
          />
        )}

        {/* Main Area */}
        <main className="flex-1 p-6 overflow-auto">
          {/* Loading Overlay */}
          {operationLoading.dragDrop && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
              <div className={`p-4 rounded-xl border shadow-2xl flex items-center gap-3 ${
                darkMode ? "bg-gray-800 border-gray-600" : "bg-white border-gray-300"
              }`}>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
                <span className="text-sm font-medium">Updating task position...</span>
              </div>
            </div>
          )}

          {/* Board Header */}
          {boards.length > 0 && activeBoardId && (
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                {activeBoard.name}
              </h1>

              <div className="flex items-center gap-3">
                <TaskBar
                  onAddTask={() => {
                    setEditTask(null);
                    setModalColumn("todo");
                    setShowModal(true);
                  }}
                  onShowCardArchive={() => setShowArchivedCards(true)}
                  darkMode={darkMode}
                />

                {showArchivedCards && (
                  <ArchiveCard
                    archivedCards={archivedCards[activeBoardId] || []}
                    onClose={() => setShowArchivedCards(false)}
                    darkMode={darkMode}
                  />
                )}
              </div>
            </div>
          )}

          {/* Modals */}
          <AddTaskModal
            isOpen={showModal}
            onClose={() => {
              setShowModal(false);
              setEditTask(null);
            }}
            onSave={addTask}
            onUpdate={updateTask}
            column={modalColumn}
            task={editTask}
            darkMode={darkMode}
            boardId={activeBoardId}
            loading={operationLoading.addTask || operationLoading.updateTask}
            columns={boardColumns}
          />

          <AddBoardModal
            isOpen={showAddBoardModal}
            onClose={() => setShowAddBoardModal(false)}
            onConfirm={(name) => {
              addBoard(name);
              setShowAddBoardModal(false);
            }}
            darkMode={darkMode}
          />

          {/* Empty State */}
          {boards.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center mb-8">
              <h2 className={`text-2xl font-semibold mb-3 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                No Board Added
              </h2>
              <p className={`mb-6 text-sm ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                Create your first board to get started
              </p>
              <button
                onClick={() => setShowAddBoardModal(true)}
                className={`px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl ${
                  darkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-white"
                    : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white"
                }`}
              >
                <FiPlus size={18} /> Add Board
              </button>
            </div>
          ) : (
            /* Trello-style Columns */
            <div className="max-w-full mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
                  {boardColumns.map((column) => {
                    const tasks = filteredTasksByColumn[column.id] || [];
                    const colorConfig = COLORS[column.color] || COLORS.blue;
                    const currentColor = darkMode ? colorConfig.dark : colorConfig;

                    return (
                      <div key={column.id} className="flex flex-col">
                        <Droppable droppableId={column.id}>
                          {(provided, snapshot) => (
                            <div
                              {...provided.droppableProps}
                              ref={provided.innerRef}
                              className={`rounded-xl p-4 flex-1 transition-all duration-200 border-2 min-h-[600px] ${
                                snapshot.isDraggingOver 
                                  ? `${currentColor.bg} ${currentColor.border} shadow-lg` 
                                  : darkMode 
                                    ? "bg-gray-800/50 border-gray-600" 
                                    : "bg-gray-50 border-gray-200"
                              }`}
                            >
                              {/* Column Header */}
                              <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-white dark:bg-gray-700 shadow-sm">
                                <div className={`w-3 h-3 rounded-full ${currentColor.bg}`} />
                                <h3 className={`font-semibold text-lg flex items-center gap-2 ${currentColor.text}`}>
                                  {column.icon}
                                  {column.name}
                                  <span className="text-gray-500 dark:text-gray-400 text-sm font-normal">
                                    ({tasks.length})
                                  </span>
                                </h3>
                              </div>

                              {/* Tasks List */}
                              <div className="space-y-3">
                                {tasks.map((task, index) => {
                                  const uniqueId = `col-${column.id}-task-${task._id ?? index}`;

                                  return (
                                    <Draggable key={uniqueId} draggableId={String(uniqueId)} index={index}>
                                      {(provided, snapshot) => (
                                        <div
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                                            task.pinned
                                              ? "border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 shadow-sm"
                                              : task.completed
                                                ? darkMode
                                                  ? "bg-green-900/20 border-green-700"
                                                  : "bg-green-50 border-green-200"
                                                : darkMode
                                                  ? "bg-gray-700 border-gray-600 hover:border-gray-500"
                                                  : "bg-white border-gray-300 hover:border-gray-400"
                                          } ${
                                            snapshot.isDragging 
                                              ? "shadow-2xl rotate-1 scale-105" 
                                              : "hover:shadow-md"
                                          }`}
                                          onClick={() => {
                                            setEditTask(task);
                                            setModalColumn(column.id);
                                            setShowModal(true);
                                          }}
                                        >
                                          {/* Task Header */}
                                          <div className="flex justify-between items-start mb-3">
                                            <h4 className="font-semibold text-base pr-8 flex-1">
                                              {task.title}
                                            </h4>
                                            <div className="flex gap-1">
                                              {task.pinned && (
                                                <span className="text-yellow-500" title="Pinned">
                                                  <FaThumbtack size={14} />
                                                </span>
                                              )}
                                              <SimpleTaskCardMenu
                                                taskId={task._id}
                                                pinned={task.pinned}
                                                onDelete={() => deleteTask(task._id)}
                                                onArchive={() => handleArchiveTask(task)}
                                                onPin={() => handlePinTask(task._id)}
                                                onEdit={() => {
                                                  setEditTask(task);
                                                  setModalColumn(column.id);
                                                  setShowModal(true);
                                                }}
                                                darkMode={darkMode}
                                              />
                                            </div>
                                          </div>

                                          {/* Description */}
                                          {(task.description || task.desc) && (
                                            <TaskDescription 
                                              desc={task.description || task.desc} 
                                              darkMode={darkMode}
                                            />
                                          )}

                                          {/* Due Date */}
                                          {task.date && (
                                            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 mt-3">
                                              <FiCalendar className="text-xs" />
                                              <span>{new Date(task.date).toLocaleDateString()}</span>
                                            </div>
                                          )}

                                          {/* Subtasks and Complete Button */}
                                          <div className="flex justify-between items-center mt-4">
                                            {task.subtasks && task.subtasks.length > 0 && (
                                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                                {task.subtasks.filter(st => st.done).length}/{task.subtasks.length} subtasks
                                              </div>
                                            )}
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleCompleteTask(task);
                                              }}
                                              className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-sm transition-all duration-200 ${
                                                task.completed
                                                  ? "bg-green-500 border-green-600 text-white shadow-sm"
                                                  : "bg-white dark:bg-gray-800 border-gray-400 dark:border-gray-500 hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-500"
                                              }`}
                                              title={task.completed ? "Mark incomplete" : "Mark complete"}
                                            >
                                              {task.completed && "✓"}
                                            </button>
                                          </div>
                                        </div>
                                      )}
                                    </Draggable>
                                  );
                                })}
                              </div>

                              {provided.placeholder}

                              {/* Empty State */}
                              {tasks.length === 0 && !snapshot.isDraggingOver && (
                                <div className={`text-center py-16 rounded-xl border-2 border-dashed ${
                                  darkMode 
                                    ? "border-gray-600 text-gray-500 bg-gray-800/30" 
                                    : "border-gray-300 text-gray-400 bg-white"
                                }`}>
                                  <p className="text-sm">No tasks in this column</p>
                                  <p className="text-xs mt-1 text-gray-500 dark:text-gray-600">
                                    Drag tasks here or click + to add
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </Droppable>
                      </div>
                    );
                  })}
                </DragDropContext>
              </div>
            </div>
          )}

          {/* Archive Drawer */}
          {showArchive && (
            <ArchiveDrawer
              boards={archivedBoards}
              onRestore={handleRestoreBoard}
              onDeleteClick={handleDeleteClick}
              darkMode={darkMode}
              onClose={() => setShowArchive(false)}
            />
          )}

          {/* Delete Confirmation Modal */}
          <DeleteConfirmModal
            isOpen={showDeleteModal}
            onClose={() => {
              setShowDeleteModal(false);
              setBoardToDelete(null);
            }}
            onConfirm={confirmDeleteBoard}
            title={boardToDelete?.name}
            darkMode={darkMode}
          />
        </main>
      </div>
    </div>
  );
}