import { useState } from "react";
import { useEffect } from "react";
import { useCallback } from "react";
import TodoItem from "./TodoItem";
import { getDeadlineStatus } from "./utils/deadline";

export default function TodoApp() {
  const initialTasks = [
    {
      id: 1,
      text: "Сделать зарядку",
      done: false,
      important: false,
      deferred: false,
      deadline: null,
    },
    {
      id: 2,
      text: "Выпить воду",
      done: true,
      important: false,
      deferred: false,
      deadline: null,
    },
    {
      id: 3,
      text: "Прочитать новости",
      done: false,
      important: false,
      deferred: false,
      deadline: null,
    },
  ];
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem("todo-tasks");

    const tasks = saved ? JSON.parse(saved) : initialTasks;

    return {
      past: [],
      present: tasks,
      future: [],
    };
  });
  const [draggedId, setDraggedId] = useState(null);
  const tasks = history.present;

  useEffect(() => {
    localStorage.setItem("todo-tasks", JSON.stringify(history.present));
  }, [history.present]);

  const [inputValue, setInputValue] = useState("");
  const [deadline, setDeadline] = useState("");

  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("none");
  const [search, setSearch] = useState("");
  let visibleTasks = tasks.filter((task) => {
    if (filter === "active") return !task.done;
    if (filter === "done") return task.done;
    if (filter === "important") return task.important;
    if (filter === "deferred") return task.deferred;
    return true; // all
  });
  // ПОИСК
  if (search.trim() !== "") {
    visibleTasks = visibleTasks.filter((task) =>
      task.text.toLowerCase().includes(search.toLowerCase()),
    );
  }

  if (sort === "alpha") {
    visibleTasks = [...visibleTasks].sort((a, b) =>
      a.text.localeCompare(b.text, "ru"),
    );
  }
  if (sort === "status") {
    visibleTasks = [...visibleTasks].sort((a, b) => a.done - b.done);
  }
  if (sort === "deadline") {
    visibleTasks = [...visibleTasks].sort((a, b) => {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline) - new Date(b.deadline);
    });
  }
  function commit(newTasks) {
    setHistory((prev) => ({
      past: [...prev.past, prev.present],
      present: newTasks,
      future: [],
    }));
  }
  function moveTask(dragId, hoverId) {
    setHistory((prev) => {
      const tasks = [...prev.present];

      const fromIndex = tasks.findIndex((t) => t.id === dragId);
      const toIndex = tasks.findIndex((t) => t.id === hoverId);

      if (fromIndex === -1 || toIndex === -1) return prev;

      const updated = [...tasks];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);

      return {
        past: [...prev.past, prev.present],
        present: updated,
        future: [],
      };
    });
  }

  function addTask() {
    const text = inputValue.trim();
    if (!text.trim()) return;
    // const deadline = deadline.value || null;

    commit([
      ...tasks,
      {
        id: Date.now(),
        text,
        done: false,
        deadline: deadline || null,
      },
    ]);
  }

  function editTask(id, text) {
    commit(tasks.map((task) => (task.id === id ? { ...task, text } : task)));
  }
  function toggleTask(id) {
    commit(
      tasks.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task,
      ),
    );
  }

  function toggleImportant(id) {
    commit(
      tasks.map((task) =>
        task.id === id ? { ...task, important: !task.important } : task,
      ),
    );
  }
  function toggleDeferred(id) {
    commit(
      tasks.map((task) =>
        task.id === id ? { ...task, deferred: !task.deferred } : task,
      ),
    );
  }
  function deleteTask(id) {
    commit(tasks.filter((task) => task.id !== id));
  }

  const undo = useCallback(() => {
    setHistory((prev) => {
      if (prev.past.length === 0) return prev;

      const previous = prev.past[prev.past.length - 1];
      const newPast = prev.past.slice(0, -1);

      return {
        past: newPast,
        present: previous,
        future: [prev.present, ...prev.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory((prev) => {
      if (prev.future.length === 0) return prev;

      const next = prev.future[0];
      const newFuture = prev.future.slice(1);

      return {
        past: [...prev.past, prev.present],
        present: next,
        future: newFuture,
      };
    });
  }, []);

  return (
    <div className="todo-app">
      <h1>Todo</h1>
      <div className="add-task">
        <input
          type="text"
          placeholder="Новая задача"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              addTask();
            }
          }}
        />
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />
        <button onClick={addTask}>Добавить</button>
      </div>
      <div className="filters">
        <button
          className={filter === "all" ? "filter-btn active" : "filter-btn"}
          onClick={() => setFilter("all")}
        >
          Все
        </button>
        <button
          className={filter === "active" ? "filter-btn active" : "filter-btn"}
          onClick={() => setFilter("active")}
        >
          Активные
        </button>
        <button
          className={filter === "done" ? "filter-btn active" : "filter-btn"}
          onClick={() => setFilter("done")}
        >
          Выполненные
        </button>
        <button
          className={
            filter === "important" ? "filter-btn active" : "filter-btn"
          }
          onClick={() => setFilter("important")}
        >
          Важные
        </button>
        <button
          className={filter === "deferred" ? "filter-btn active" : "filter-btn"}
          onClick={() => setFilter("deferred")}
        >
          Отложенные
        </button>
      </div>
      <div className="search-sort">
        <input
          id="search"
          type="text"
          placeholder="Поиск..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div>
          <button id="sortAlpha" onClick={() => setSort("alpha")}>
            А-Я
          </button>
          <button id="status" onClick={() => setSort("status")}>
            По статусу
          </button>
          <button id="deadline" onClick={() => setSort("deadline")}>
            По дедлайну
          </button>
        </div>
      </div>

      <ul>
        {visibleTasks.map((task) => (
          <TodoItem
            key={task.id}
            task={task}
            deadlineStatus={getDeadlineStatus(task.deadline)}
            onToggle={toggleTask}
            onDelete={deleteTask}
            onToggleImportant={toggleImportant}
            onToggleDeferred={toggleDeferred}
            onEdit={editTask}
            onMove={moveTask}
            onDragStart={setDraggedId}
            draggedId={draggedId}
          />
        ))}
      </ul>
      <div className="escape">
        <button
          id="undoBtn"
          onClick={undo}
          disabled={history.past.length === 0}
        >
          Отменить последнее действие ⭠
        </button>
        <button
          id="redoBtn"
          onClick={redo}
          disabled={history.future.length === 0}
        >
          Вернуть отмененные ⭢
        </button>
      </div>
    </div>
  );
}
