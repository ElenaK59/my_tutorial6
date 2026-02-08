import { useState } from "react";
export default function TodoItem({
  task,
  deadlineStatus,
  onToggle,
  onDelete,
  onToggleImportant,
  onToggleDeferred,
  onEdit,
  onMove,
  onDragStart,
  draggedId,
}) {
  function deadlineStatusLabel(status) {
    switch (status) {
      case "overdue":
        return "Просрочено";
      case "today":
        return "Сегодня";
      case "tomorrow":
        return "Завтра";
      case "future":
        return "Будущее";
      default:
        return "";
    }
  }
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(task.text);

  function saveEdit() {
    const text = editValue.trim();
    if (text && text !== task.text) {
      onEdit(task.id, text);
    }
    setIsEditing(false);
  }

  function cancelEdit() {
    setEditValue(task.text);
    setIsEditing(false);
  }
  return (
    <li
      className={`task ${task.done ? "done" : ""} ${task.important ? "important" : ""} ${task.deferred ? "deferred" : ""}  `}
      draggable
      onDragStart={() => onDragStart(task.id)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={() => {
        if (draggedId !== task.id) {
          onMove(draggedId, task.id);
        }
      }}
    >
      {/* чекбокс */}
      <input
        type="checkbox"
        checked={task.done}
        onChange={() => onToggle(task.id)}
        className="task-checkbox"
      />

      {/* TEXT / EDIT */}
      {!isEditing ? (
        <span className="task-text" onDoubleClick={() => setIsEditing(true)}>
          {task.text}
        </span>
      ) : (
        <input
          className="task-edit"
          value={editValue}
          autoFocus
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={cancelEdit}
          onKeyDown={(e) => {
            if (e.key === "Enter") saveEdit();
            if (e.key === "Escape") cancelEdit();
          }}
        />
      )}

      {/* текст 
      <span className="task-text">{task.text}</span>*/}

      {/* meta: дата + статус */}
      <div className="task-meta">
        {task.deadline && (
          <>
            <span className="task-date">
              до {new Date(task.deadline).toLocaleDateString("ru-RU")}
            </span>
            <span className={`task-status ${deadlineStatus}`}>
              {deadlineStatusLabel(deadlineStatus)}
            </span>
          </>
        )}
      </div>

      {/* кнопки */}
      <div className="task-actions">
        <button onClick={() => onToggleImportant(task.id)}>
          {task.important ? "⭐" : "☆"}
        </button>
        <button onClick={() => onToggleDeferred(task.id)}>
          {task.deferred ? "⏰" : "🕒"}
        </button>
        <button className="delete" onClick={() => onDelete(task.id)}>
          ✕
        </button>
      </div>
    </li>
  );
}
