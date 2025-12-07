import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiX, FiPlus, FiTrash2, FiClock, FiChevronDown, FiChevronUp, FiMaximize2,
  FiCheckCircle, FiCalendar, FiZap, FiGlobe
} from "react-icons/fi";
import { FaClipboardList, FaCog, FaCheckCircle as FaCheck } from 'react-icons/fa';
import toast from 'react-hot-toast';
import axios from 'axios';
import API_BASE from "../config/api";
import API from "../utils/api";

const ICONS_MAP = {
  FaClipboardList,
  FaCog,
  FaCheck,
  FiClock,
  FiCheckCircle,
};
const ICON_KEYS = Object.keys(ICONS_MAP);
const ICON_COLORS = {
  FaClipboardList: "#4F46E5",
  FaCog: "#6B7280",
  FaCheck: "#10B981",
  FiClock: "#F59E0B",
  FiCheckCircle: "#22C55E",
};

const STATUS_LIST = ['todo', 'inprogress', 'done'];

// Language options
const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
];

const useBoardStatuses = (boardId) => {
  const [list, setList] = useState([]);
  useEffect(() => {
    if (!boardId) return;
    const raw = localStorage.getItem(`customStatuses_${boardId}`);
    setList(raw ? JSON.parse(raw) : []);
  }, [boardId]);
  const save = (next) => {
    localStorage.setItem(`customStatuses_${boardId}`, JSON.stringify(next));
    setList(next);
  };
  return [list, save];
};

const useStatusHistory = () => {
  const [h, setH] = useState([]);
  useEffect(() => { 
    const r = localStorage.getItem('statusHistory'); 
    if (r) setH(JSON.parse(r)); 
  }, []);
  const push = (e) => { 
    const n = [...h, e]; 
    setH(n); 
    localStorage.setItem('statusHistory', JSON.stringify(n)); 
  };
  return [h, push];
};

const Icon = ({ k, size = 16 }) => {
  const Comp = ICONS_MAP[k];
  return Comp ? <Comp size={size} /> : null;
};

// Language Selector Component
const LanguageSelector = ({ darkMode, currentLanguage, onLanguageChange }) => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  const currentLang = LANGUAGES.find(lang => lang.code === currentLanguage) || LANGUAGES[0];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all duration-200
          ${darkMode
            ? 'bg-gray-800 border-gray-600 text-gray-100 hover:border-indigo-500 shadow-sm hover:shadow-md'
            : 'bg-white border-gray-300 text-gray-900 hover:border-indigo-500 shadow-sm hover:shadow-md'
          }`}
      >
        <span className="flex items-center gap-2">
          <FiGlobe size={16} className="text-indigo-500" />
          <span className="text-lg">{currentLang.flag}</span>
          <span className="hidden sm:block">{currentLang.name}</span>
        </span>
        <FiChevronDown className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} size={16} />
      </button>

      {open && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`absolute z-20 mt-2 w-full rounded-xl border-2 shadow-xl backdrop-blur-sm
            ${darkMode 
              ? 'bg-gray-800/95 border-gray-600 shadow-2xl' 
              : 'bg-white/95 border-gray-300 shadow-2xl'
            }`}
        >
          {LANGUAGES.map((lang, i) => (
            <motion.div
              key={lang.code}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-center gap-3 px-4 py-3 text-sm border-b last:border-b-0 cursor-pointer transition-colors
                ${currentLanguage === lang.code
                  ? darkMode
                    ? 'bg-indigo-900/30 text-indigo-300 border-indigo-700'
                    : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  : darkMode
                    ? 'hover:bg-gray-700/50 border-gray-600 text-gray-200'
                    : 'hover:bg-gray-50 border-gray-100 text-gray-700'
                }`}
              onClick={() => { onLanguageChange(lang.code); setOpen(false); }}
            >
              <span className="text-lg">{lang.flag}</span>
              <span>{lang.name}</span>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

const StatusSelect = ({ value, onChange, darkMode, customStatuses, onDelete }) => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  const all = [
    ...STATUS_LIST.map(s => ({ name: s, builtIn: true })),
    ...customStatuses.map(s => ({ ...s, builtIn: false })),
  ];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all duration-200
          ${darkMode
            ? 'bg-gray-800 border-gray-600 text-gray-100 hover:border-indigo-500 shadow-sm hover:shadow-md'
            : 'bg-white border-gray-300 text-gray-900 hover:border-indigo-500 shadow-sm hover:shadow-md'
          }`}
      >
        <span className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${
            value === 'todo' ? 'bg-blue-500' :
            value === 'inprogress' ? 'bg-yellow-500' :
            value === 'done' ? 'bg-green-500' : 'bg-indigo-500'
          }`} />
          {t(value) || value}
        </span>
        <FiChevronDown className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} size={16} />
      </button>

      {open && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`absolute z-20 mt-2 w-full rounded-xl border-2 shadow-xl backdrop-blur-sm
            ${darkMode 
              ? 'bg-gray-800/95 border-gray-600 shadow-2xl' 
              : 'bg-white/95 border-gray-300 shadow-2xl'
            }`}
        >
          {all.map((s, i) => (
            <motion.div
              key={s.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-center justify-between px-4 py-3 text-sm border-b last:border-b-0 cursor-pointer transition-colors
                ${value === s.name 
                  ? darkMode
                    ? 'bg-indigo-900/30 text-indigo-300 border-indigo-700'
                    : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  : darkMode
                    ? 'hover:bg-gray-700/50 border-gray-600 text-gray-200'
                    : 'hover:bg-gray-50 border-gray-100 text-gray-700'
                }`}
              onClick={() => { onChange(s.name); setOpen(false); }}
            >
              <span className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${
                  s.name === 'todo' ? 'bg-blue-500' :
                  s.name === 'inprogress' ? 'bg-yellow-500' :
                  s.name === 'done' ? 'bg-green-500' : 'bg-indigo-500'
                }`} />
                {t(s.name) || s.name}
              </span>
              {!s.builtIn && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onDelete(s.name); }}
                  className={`p-1.5 rounded-lg transition-colors ${
                    darkMode
                      ? 'hover:bg-rose-500/20 text-rose-400'
                      : 'hover:bg-rose-500/20 text-rose-500'
                  }`}
                >
                  <FiTrash2 size={14} />
                </button>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

const DueDateTimePicker = ({ value, onChange, darkMode }) => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  const clear = () => {
    onChange('');
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all duration-200
          ${darkMode
            ? 'bg-gray-800 border-gray-600 text-gray-100 hover:border-indigo-500 shadow-sm hover:shadow-md'
            : 'bg-white border-gray-300 text-gray-900 hover:border-indigo-500 shadow-sm hover:shadow-md'
          }`}
      >
        <span className="flex items-center gap-3">
          <FiClock size={18} className="text-indigo-500" />
          {value ? (
            <div className={`flex items-center gap-2 text-[13px] font-semibold ${
              darkMode ? 'text-green-400' : 'text-green-600'
            }`}>
              <FiCalendar className="text-xs" />
              <span>
                {new Date(value).toLocaleDateString()} •{" "}
                {new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          ) : (
            <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>{t("selectDateTime")}</span>
          )}
        </span>
        <FiChevronDown className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} size={16} />
      </button>

      {open && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`absolute z-30 mt-2 w-full rounded-xl border-2 shadow-2xl p-4 backdrop-blur-sm
            ${darkMode 
              ? 'bg-gray-800/95 border-gray-600' 
              : 'bg-white/95 border-gray-300'
            }`}
        >
          <div className="flex flex-col gap-3">
            <div className={`relative w-full px-4 py-3 rounded-xl border-2 ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 shadow-sm' 
                : 'bg-white border-gray-300 shadow-sm'
            }`}>
              <div className="flex items-center gap-3">
                <FiCalendar size={18} className="text-indigo-500" />
                <input
                  type="date"
                  value={value ? value.split('T')[0] : ''}
                  onChange={e => {
                    const time = value ? value.split('T')[1] || '00:00' : '00:00';
                    onChange(`${e.target.value}T${time}`);
                  }}
                  className={`bg-transparent outline-none flex-1 text-sm font-medium ${
                    darkMode ? 'text-gray-100' : 'text-gray-900'
                  }`}
                  style={{ colorScheme: darkMode ? 'dark' : 'light' }}
                />
              </div>
            </div>

            <div className={`relative w-full px-4 py-3 rounded-xl border-2 ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 shadow-sm' 
                : 'bg-white border-gray-300 shadow-sm'
            }`}>
              <div className="flex items-center gap-3">
                <FiClock size={18} className="text-indigo-500" />
                <input
                  type="time"
                  value={value ? value.split('T')[1] || '00:00' : ''}
                  onChange={e => {
                    const date = value ? value.split('T')[0] : '';
                    onChange(`${date}T${e.target.value}`);
                  }}
                  className={`bg-transparent outline-none flex-1 text-sm font-medium ${
                    darkMode ? 'text-gray-100' : 'text-gray-900'
                  }`}
                  style={{ colorScheme: darkMode ? 'dark' : 'light' }}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-3 gap-2">
            <button
              type="button"
              onClick={clear}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                darkMode
                  ? 'bg-rose-900/30 text-rose-400 border-rose-700 hover:bg-rose-900/50'
                  : 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
              }`}
            >
              {t('clear')}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors text-sm font-medium shadow-sm"
            >
              {t('done')}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default function AddTaskModal({
  isOpen, onClose, onSave, onUpdate, column, task, darkMode, boardId, loading, columns
}) {
  const { t, i18n } = useTranslation();
  const isEdit = task && Object.keys(task).length;

  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState(task?.desc || task?.description || '');
  const [dateTime, setDateTime] = useState('');
  const [subtasks, setSubtasks] = useState([]);
  const [status, setStatus] = useState(column || 'todo');
  const [newStatus, setNewStatus] = useState('');
  const [iconKey, setIconKey] = useState('FiCheckCircle');
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [rows, setRows] = useState(4);
  const [full, setFull] = useState(false);
  const [makeUnique, setMakeUnique] = useState(false);
  const descRef = useRef(null);
  const [tempCustomStatuses, setTempCustomStatuses] = useState([]);

  const [showAIPrompt, setShowAIPrompt] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const [customStatuses, setCustomStatuses] = useBoardStatuses(boardId);
  const [history, pushHistory] = useStatusHistory();
  const allCustomStatuses = [...customStatuses, ...tempCustomStatuses];

  // Language change handler
  const handleLanguageChange = (languageCode) => {
    i18n.changeLanguage(languageCode);
    toast.success(`Language changed to ${LANGUAGES.find(lang => lang.code === languageCode)?.name}`);
  };

  useEffect(() => {
    if (subtasks.length) {
      localStorage.setItem('draft_subtasks', JSON.stringify(subtasks));
    }
  }, [subtasks]);

  useEffect(() => {
    if (!isOpen) {
      localStorage.removeItem('draft_subtasks');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isEdit) {
      const saved = localStorage.getItem('draft_subtasks');
      if (saved) setSubtasks(JSON.parse(saved));
    }
  }, [isEdit]);

  useEffect(() => {
    if (!isOpen) return;
    if (isEdit) {
      setTitle(task.title || '');
      setDesc(task.desc || task.description || '');
      setDateTime(task.dateTime || task.date || '');
      setStatus(task.status || task.column || column || 'todo');
      setSubtasks((task?.subtasks || []).map(st => ({
        id: st._id || st.id || Date.now() + Math.random(),
        title: st.title,
        done: st.completed || false,
        subtasks: st.subtasks || [],
      })));
      if (task.history) pushHistory(task.history);
      if (task.userLang && task.userLang !== i18n.language) i18n.changeLanguage(task.userLang);
    } else {
      setTitle('');
      setDesc('');
      setDateTime('');
      setSubtasks([]);
      setStatus(column || 'todo');
    }
  }, [isOpen, task, column]);

  if (!isOpen) return null;

  const changeStatus = (st) => {
    if (status === st) return;
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    pushHistory({ from: status, to: st, time: new Date().toLocaleString('en-US', { timeZone: tz }), tz });
    setStatus(st);
  };

  const addCustom = () => {
    const name = newStatus.trim();
    if (!name) return;
    setTempCustomStatuses(prev => [...prev, { name, icon: iconKey }]);
    if (makeUnique) {
      const key = `customStatuses_${boardId}`;
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      if (!existing.some(s => s.name === name)) {
        const updated = [...existing, { name, icon: iconKey }];
        localStorage.setItem(key, JSON.stringify(updated));
        setCustomStatuses(updated);
      }
    }
    setNewStatus('');
    setIconKey('FiCheckCircle');
    setMakeUnique(false);
  };

  const delCustom = (name) => {
    const key = `customStatuses_${boardId}`;
    const next = customStatuses.filter(s => s.name !== name);
    localStorage.setItem(key, JSON.stringify(next));
    setCustomStatuses(next);
    if (status === name) setStatus('todo');
    toast.success(`"${name}" ${t('deletedFromBoard')}`);
  };

  const parseAIResponseToParts = (text) => {
    try {
      const parsed = JSON.parse(text);
      return parsed;
    } catch (e) {
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
      const out = {};
      const titleLine = lines.find(l => /^title[:\-]/i.test(l));
      const descLine = lines.find(l => /^description[:\-]/i.test(l));
      if (titleLine) out.title = titleLine.replace(/^title[:\-]\s*/i, '');
      if (descLine) out.description = descLine.replace(/^description[:\-]\s*/i, '');
      const subtasks = lines.filter(l => /^[-*]\s+/.test(l)).map(l => l.replace(/^[-*]\s+/, ''));
      if (subtasks.length) out.subtasks = subtasks;
      return out;
    }
  };

  const handleAISubmit = async () => {
    if (!aiPrompt.trim()) return toast.error(t('enterPromptFirst'));
    setAiLoading(true);

    let resultText = "";
    let backendData = null;

    try {
      try {
        const res = await API.post("ai/generate", { prompt: aiPrompt });
        resultText = res.data.result || "";
        backendData = res.data;
      } catch (err) {
        console.warn("Backend AI call failed", err);
      }

      if (!resultText) {
        const hfKey = import.meta.env.VITE_HF_API_KEY;
        if (hfKey) {
          const body = {
            inputs: aiPrompt,
            parameters: { max_new_tokens: 256, temperature: 0.6 },
          };
          const res = await axios.post(
            "https://api-inference.huggingface.co/models/google/flan-t5-small",
            body,
            {
              headers: { Authorization: `Bearer ${hfKey}` },
              timeout: 60000,
            }
          );

          if (Array.isArray(res.data) && res.data[0]?.generated_text)
            resultText = res.data[0].generated_text;
          else if (res.data?.generated_text) resultText = res.data.generated_text;
          else if (typeof res.data === "string") resultText = res.data;
          else resultText = JSON.stringify(res.data);
        }
      }

      if (!resultText) {
        resultText = JSON.stringify({
          title: aiPrompt.slice(0, 60),
          description: `${aiPrompt}. Create steps and checklist.`,
          subtasks: ["Draft", "Review", "Finalize"],
        });
      }

      let parsed = {};

      if (backendData?.task) {
        parsed = {
          title: backendData.task.title,
          description: backendData.task.description,
          subtasks: backendData.task.subtasks?.map(s => s.title) || [],
        };
      } else {
        parsed = parseAIResponseToParts(resultText);
      }

      if (parsed.title) setTitle(parsed.title);
      if (parsed.description || parsed.desc)
        setDesc(parsed.description || parsed.desc || "");
      if (Array.isArray(parsed.subtasks) && parsed.subtasks.length) {
        const next = parsed.subtasks.map(s => ({
          id: Date.now().toString() + Math.random(),
          title: s,
          done: false,
          subtasks: [],
        }));
        setSubtasks(prev => [...next, ...prev]);
      }
      if (parsed.due_in_days && !isNaN(Number(parsed.due_in_days))) {
        const days = Number(parsed.due_in_days);
        const dt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
        setDateTime(dt.toISOString());
      }

      toast.success(t('aiFilledTitleDesc'));
      setShowAIPrompt(false);
      setAiPrompt("");
    } catch (err) {
      console.error("AI error:", err);
      toast.error(t('aiGenerationFailed'));
    } finally {
      setAiLoading(false);
    }
  };

  const submit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    const payload = {
      title: title.trim(),
      desc: desc.trim(),
      date: dateTime ? new Date(dateTime).toISOString() : null,
      status,
      column: status,
      subtasks: subtasks.map(st => ({
        title: st.title,
        completed: st.done,
        subtasks: st.subtasks.map(child => ({
          title: child.title,
          completed: child.done,
        })),
      })),
      history,
      userLang: i18n.language,
    };
    if (!isEdit) {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      payload.history = [...history, { from: 'created', to: status, time: new Date().toLocaleString('en-US', { timeZone: tz }), tz }];
    }
    isEdit ? onUpdate({ ...task, ...payload }) : onSave(payload, status);
    
    if (!STATUS_LIST.includes(status)) {
      setTimeout(() => {
        window.dispatchEvent(new Event('customStatusAdded'));
      }, 100);
    }
    onClose();
  };

  const addSub = () => {
    const blank = { id: Date.now().toString(), title: '', done: false, subtasks: [] };
    setSubtasks([...subtasks, blank]);
  };

  const wrapper = full ? 'fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex p-4'
    : 'fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4';
  const panel = `${full ? 'w-[98vw] h-[96vh]' : 'w-full max-w-2xl max-h-[90vh]'} overflow-y-auto rounded-3xl border shadow-2xl p-8 ${
    darkMode 
      ? 'bg-gray-900 border-gray-700' 
      : 'bg-white border-gray-300'
  }`;

  return (
    <div className={wrapper}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={e => e.stopPropagation()} 
        className={panel}
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className={`text-3xl font-bold ${
            darkMode 
              ? 'text-gray-100' 
              : 'text-gray-800 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent'
          }`}>
            {isEdit ? t('editTask') : t('addTask')}
          </h2>
          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <LanguageSelector 
              darkMode={darkMode}
              currentLanguage={i18n.language}
              onLanguageChange={handleLanguageChange}
            />

            <button
              type="button"
              onClick={() => setShowAIPrompt(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center gap-2 hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <FiZap size={18} /> {t('aiAssist')}
            </button>

            <button type="button" onClick={() => setFull(v => !v)} className={`p-2.5 rounded-xl transition-colors border ${
              darkMode
                ? 'hover:bg-gray-700 text-gray-400 hover:text-indigo-400 border-gray-600 hover:border-indigo-500'
                : 'hover:bg-gray-100 text-gray-500 hover:text-indigo-500 border-gray-300 hover:border-indigo-300'
            }`}>
              <FiMaximize2 size={20} />
            </button>
            <button onClick={onClose} className={`p-2.5 rounded-xl transition-colors border ${
              darkMode
                ? 'hover:bg-gray-700 border-gray-600 hover:border-red-500'
                : 'hover:bg-gray-100 border-gray-300 hover:border-red-300'
            }`}>
              <FiX size={22} className={`${darkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-500 hover:text-red-500'}`} />
            </button>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-6">
          {/* Rest of the form remains exactly the same as before */}
          {/* Title Input */}
          <div>
            <label className={`block mb-3 text-sm font-semibold ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {t('title')}
            </label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              placeholder={t('enterTitle')}
              className={`w-full px-4 py-3.5 rounded-xl border-2 text-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 ${
                darkMode
                  ? 'bg-gray-800 border-gray-600 text-gray-100'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>

          {/* Description Input */}
          <div>
            <label className={`block mb-3 text-sm font-semibold ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {t('desc')}
            </label>
            <div className="relative">
              <textarea
                ref={descRef}
                rows={rows}
                value={desc}
                onChange={e => setDesc(e.target.value)}
                placeholder={t('enterDetails')}
                className={`w-full px-4 py-3.5 rounded-xl border-2 resize-none font-medium transition-all duration-200 shadow-sm hover:shadow-md focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 ${
                  darkMode
                    ? 'bg-gray-800 border-gray-600 text-gray-100'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
              <div 
                onMouseDown={(e) => { 
                  const start = e.clientY; 
                  const startRows = rows; 
                  const move = mv => { 
                    const d = Math.round((mv.clientY - start) / 10); 
                    setRows(Math.max(4, Math.min(30, startRows + d))); 
                  }; 
                  const up = () => { 
                    document.removeEventListener('mousemove', move); 
                    document.removeEventListener('mouseup', up); 
                  }; 
                  document.addEventListener('mousemove', move); 
                  document.addEventListener('mouseup', up); 
                }} 
                className={`absolute bottom-3 right-3 cursor-ns-resize p-1.5 rounded-lg transition-colors ${
                  darkMode
                    ? 'text-gray-400 hover:text-indigo-400 hover:bg-gray-700'
                    : 'text-gray-400 hover:text-indigo-500 hover:bg-gray-100'
                }`}
              >
                <FiChevronDown size={18} />
              </div>
            </div>
          </div>

          {/* Due Date and Status Row */}
          <div className={`grid grid-cols-1 lg:grid-cols-3 gap-4 p-5 rounded-2xl border-2 shadow-sm ${
            darkMode
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-300'
          }`}>
            {/* Due Date */}
            <div className="lg:col-span-2">
              <label className={`block mb-3 text-sm font-semibold ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {t('due')}
              </label>
              <DueDateTimePicker
                value={dateTime}
                onChange={setDateTime}
                darkMode={darkMode}
              />
            </div>

            {/* Status Select */}
            <div>
              <label className={`block mb-3 text-sm font-semibold ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {t('status')}
              </label>
              <StatusSelect
                value={status}
                onChange={changeStatus}
                darkMode={darkMode}
                customStatuses={allCustomStatuses}
                onDelete={delCustom}
              />
            </div>
          </div>

          {/* Quick Status Buttons */}
          <div className="flex gap-3 flex-wrap items-center">
            {STATUS_LIST.map(st => (
              <button 
                type="button" 
                key={st} 
                onClick={() => changeStatus(st)}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all duration-200 flex items-center justify-center min-h-[44px] ${
                  status === st 
                    ? 'ring-4 ring-indigo-500/30 border-indigo-500 bg-indigo-500 text-white shadow-lg' 
                    : darkMode
                      ? 'bg-gray-800 border-gray-600 text-gray-200 hover:bg-gray-700 hover:border-indigo-500 shadow-sm hover:shadow-md'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-indigo-400 shadow-sm hover:shadow-md'
                }`}
              >
                {t(st)}
              </button>
            ))}
            {customStatuses.map(s => (
              <div key={s.name} className="flex items-center gap-2">
                <button 
                  type="button" 
                  onClick={() => changeStatus(s.name)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all duration-200 flex items-center justify-center gap-2 min-h-[44px] ${
                    status === s.name 
                      ? 'ring-4 ring-indigo-500/30 border-indigo-500 bg-indigo-500 text-white shadow-lg' 
                      : darkMode
                        ? 'bg-gray-800 border-gray-600 text-gray-200 hover:bg-gray-700 hover:border-indigo-500 shadow-sm hover:shadow-md'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-indigo-400 shadow-sm hover:shadow-md'
                  }`}
                >
                  <Icon k={s.icon} size={16} /> 
                  <span>{s.name}</span>
                </button>
                <button 
                  type="button" 
                  onClick={() => delCustom(s.name)} 
                  className={`p-2 rounded-xl transition-colors h-[44px] w-[44px] flex items-center justify-center border ${
                    darkMode
                      ? 'hover:bg-rose-900/30 text-rose-400 border-transparent hover:border-rose-700'
                      : 'hover:bg-rose-50 text-rose-500 border-transparent hover:border-rose-200'
                  }`}
                >
                  <FiTrash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          {/* Custom Status Creation */}
          <div className={`p-5 rounded-2xl border-2 shadow-sm ${
            darkMode
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-300'
          }`}>
            <label className={`block mb-3 text-sm font-semibold ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {t('createCustomStatus')}
            </label>
            <div className="flex items-center gap-3">
              <input
                value={newStatus}
                onChange={e => setNewStatus(e.target.value)}
                placeholder={t('addCustom')}
                className={`flex-1 px-4 py-3 rounded-xl border-2 font-medium transition-all duration-200 shadow-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 ${
                  darkMode
                    ? 'bg-gray-800 border-gray-600 text-gray-100'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />

              <button
                type="button"
                onClick={() => setShowIconPicker(true)}
                className={`flex items-center justify-center gap-2 h-[52px] px-4 rounded-xl border-2 font-medium transition-all duration-200 shadow-sm hover:shadow-md ${
                  darkMode
                    ? 'border-gray-600 bg-gray-800 text-gray-200 hover:border-indigo-500'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-indigo-400'
                }`}
              >
                <Icon k={iconKey} size={20} />
              </button>

              <button
                type="button"
                onClick={addCustom}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
              >
                <FiPlus size={18} />{t('add')}
              </button>
            </div>

            {/* Make Unique Toggle */}
            <label className={`flex items-center justify-between mt-4 p-3 rounded-xl cursor-pointer text-sm font-medium transition-colors border ${
              darkMode
                ? 'hover:bg-gray-700 border-gray-600 text-gray-300'
                : 'hover:bg-gray-50 border-transparent hover:border-gray-200 text-gray-700'
            }`}>
              <span>{t('makeUniqueStatus')}</span>
              <div
                onClick={() => setMakeUnique(!makeUnique)}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-all duration-300 ${
                  makeUnique ? "bg-indigo-600" : darkMode ? "bg-gray-600" : "bg-gray-400"
                }`}
              >
                <div className={`bg-white w-4 h-4 rounded-full shadow-lg transform transition-all duration-300 ${
                  makeUnique ? "translate-x-6" : "translate-x-0"
                }`}></div>
              </div>
            </label>
          </div>

          {/* Icon Picker Modal - Same as before */}
          <AnimatePresence>
            {showIconPicker && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" 
                onClick={() => setShowIconPicker(false)}
              >
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={e => e.stopPropagation()} 
                  className={`w-full max-w-md rounded-3xl border shadow-2xl p-6 ${
                    darkMode 
                      ? 'bg-gray-900 border-gray-700' 
                      : 'bg-white border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-center mb-6">
                    <h3 className={`text-xl font-bold ${
                      darkMode ? 'text-gray-100' : 'text-gray-800'
                    }`}>
                      {t('pickAnIcon')}
                    </h3>
                    <button type="button" onClick={() => setShowIconPicker(false)} className={`p-2 rounded-xl transition-colors border ${
                      darkMode
                        ? 'hover:bg-gray-700 border-gray-600 hover:border-red-500'
                        : 'hover:bg-gray-100 border-gray-300 hover:border-red-300'
                    }`}>
                      <FiX size={20} className={`${darkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-500 hover:text-red-500'}`} />
                    </button>
                  </div>
                  <div className="grid grid-cols-5 gap-4">
                    {ICON_KEYS.map(k => {
                      const IconComponent = ICONS_MAP[k];
                      return (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          type="button"
                          key={k}
                          onClick={() => { setIconKey(k); setShowIconPicker(false); }}
                          className={`p-4 rounded-2xl border-2 transition-all duration-200 flex items-center justify-center ${
                            iconKey === k 
                              ? darkMode
                                ? 'ring-4 ring-indigo-500/30 border-indigo-500 bg-indigo-900/20'
                                : 'ring-4 ring-indigo-500/30 border-indigo-500 bg-indigo-50'
                              : darkMode
                                ? 'border-gray-600 hover:border-indigo-400 bg-gray-800 shadow-sm hover:shadow-md'
                                : 'border-gray-300 hover:border-indigo-400 bg-white shadow-sm hover:shadow-md'
                          }`}
                        >
                          <IconComponent size={24} color={ICON_COLORS[k]} />
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Subtasks Section - Same as before */}
          <div className={`p-5 rounded-2xl border-2 shadow-sm ${
            darkMode
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-300'
          }`}>
            <label className={`block text-sm font-semibold mb-4 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {t('addSub')}
            </label>
            {subtasks.map((sub, idx) => (
              <motion.div
                key={sub.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-4 rounded-2xl p-4 border-2 transition-all duration-200 ${
                  sub.done 
                    ? darkMode
                      ? 'bg-emerald-900/20 border-emerald-700 shadow-sm'
                      : 'bg-emerald-50 border-emerald-200 shadow-sm'
                    : darkMode
                      ? 'bg-gray-700 border-gray-600 shadow-sm hover:shadow-md'
                      : 'bg-white border-gray-300 shadow-sm hover:shadow-md'
                }`}
              >
                <div className="flex items-center gap-4">
                  <input
                    value={sub.title}
                    onChange={e => {
                      const c = [...subtasks];
                      c[idx].title = e.target.value;
                      setSubtasks(c);
                    }}
                    className={`flex-1 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 ${
                      sub.done 
                        ? darkMode
                          ? 'line-through text-emerald-300 bg-emerald-900/10 border-emerald-700'
                          : 'line-through text-emerald-700 bg-emerald-25 border-emerald-200'
                        : darkMode
                          ? 'bg-gray-800 border-gray-600 text-gray-100'
                          : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder={`${t('subtask')} ${idx + 1}`}
                  />

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const c = [...subtasks];
                        c[idx].done = !c[idx].done;
                        setSubtasks(c);
                      }}
                      className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 border-2 ${
                        sub.done 
                          ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg' 
                          : darkMode
                            ? 'bg-gray-700 border-gray-600 text-gray-400 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 shadow-sm hover:shadow-md'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 shadow-sm hover:shadow-md'
                      }`}
                    >
                      <FiCheckCircle size={20} />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const c = [...subtasks];
                        c.splice(idx, 1);
                        setSubtasks(c);
                      }}
                      className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 border-2 shadow-sm hover:shadow-md ${
                        darkMode
                          ? 'bg-gray-700 border-gray-600 text-gray-400 hover:bg-rose-500 hover:text-white hover:border-rose-500'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-rose-500 hover:text-white hover:border-rose-500'
                      }`}
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
            <button 
              type="button" 
              onClick={addSub} 
              className={`flex items-center gap-3 mt-4 text-lg font-semibold transition-colors px-4 py-3 rounded-xl border ${
                darkMode
                  ? 'text-indigo-400 hover:text-indigo-300 hover:bg-indigo-900/20 border-transparent hover:border-indigo-700'
                  : 'text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 border-transparent hover:border-indigo-200'
              }`}
            >
              <FiPlus size={20} />{t('addSub')}
            </button>
          </div>

          {/* Status History - Same as before */}
          <div className={`p-5 rounded-2xl border-2 shadow-sm ${
            darkMode
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-300'
          }`}>
            <button 
              type="button" 
              onClick={() => setShowHistory(v => !v)} 
              className={`text-lg font-semibold transition-colors flex items-center gap-2 ${
                darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'
              }`}
            >
              {t('history')}
              <FiChevronDown className={`transition-transform duration-200 ${showHistory ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {showHistory && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`mt-4 text-sm rounded-2xl p-4 border-2 ${
                    darkMode
                      ? 'border-gray-600 bg-gray-700'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  {history.length ? (
                    <ul className="space-y-3">
                      {history.map((h, i) => (
                        <li key={i} className={`flex items-center gap-3 p-3 rounded-xl shadow-sm border ${
                          darkMode
                            ? 'bg-gray-600 border-gray-500'
                            : 'bg-white border-gray-200'
                        }`}>
                          <span className={`font-semibold ${
                            darkMode ? 'text-indigo-400' : 'text-indigo-600'
                          }`}>{h.from}</span>
                          <span className="text-gray-400">→</span>
                          <span className={`font-semibold ${
                            darkMode ? 'text-green-400' : 'text-green-600'
                          }`}>{h.to}</span>
                          <span className={`text-xs ml-auto ${
                            darkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>{h.time}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className={`text-center py-4 ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>{t('noHistory')}</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Submit Button */}
          <motion.button 
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            type="submit" 
            disabled={loading}
            className={`
              w-full py-4 rounded-2xl font-bold text-lg transition-all duration-200 shadow-2xl
              ${loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white hover:shadow-3xl'
              }
            `}
          >
            {loading ? t('saving') : (isEdit ? t('update') : t('add'))}
          </motion.button>
        </form>

        {/* AI Prompt Modal - Same as before */}
        <AnimatePresence>
          {showAIPrompt && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" 
              onClick={() => setShowAIPrompt(false)}
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={e => e.stopPropagation()} 
                className={`w-full max-w-lg rounded-3xl border shadow-2xl p-6 ${
                  darkMode 
                    ? 'bg-gray-900 border-gray-700 text-gray-100' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-xl font-bold flex items-center gap-3 ${
                    darkMode ? 'text-gray-100' : 'text-gray-800'
                  }`}>
                    <FiZap className="text-yellow-500" /> {t('aiAssist')}
                  </h3>
                  <button onClick={() => setShowAIPrompt(false)} className={`p-2 rounded-xl transition-colors border ${
                    darkMode
                      ? 'hover:bg-gray-700 border-gray-600 hover:border-red-500'
                      : 'hover:bg-gray-100 border-gray-300 hover:border-red-300'
                  }`}>
                    <FiX size={20} />
                  </button>
                </div>

                <p className={`text-sm mb-4 ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {t('aiPromptDescription')}
                </p>

                <textarea 
                  value={aiPrompt} 
                  onChange={e => setAiPrompt(e.target.value)} 
                  placeholder={t('aiPromptPlaceholder')}
                  className={`w-full p-4 rounded-xl border-2 text-lg font-medium transition-all duration-200 shadow-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 ${
                    darkMode
                      ? 'bg-gray-800 border-gray-600 text-gray-100'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`} 
                  rows={4} 
                />

                <div className="flex items-center gap-3 justify-end mt-6">
                  <button 
                    onClick={() => { setAiPrompt(''); }} 
                    className={`px-6 py-3 rounded-xl font-semibold transition-colors border ${
                      darkMode
                        ? 'bg-rose-900/30 text-rose-400 border-rose-700 hover:bg-rose-900/50'
                        : 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
                    }`}
                  >
                    {t('clear')}
                  </button>
                  <button 
                    onClick={handleAISubmit} 
                    disabled={aiLoading}
                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:from-indigo-500 hover:to-purple-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                  >
                    {aiLoading ? (
                      <span className="flex items-center gap-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                        {t('generating')}
                      </span>
                    ) : t('generate')}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}