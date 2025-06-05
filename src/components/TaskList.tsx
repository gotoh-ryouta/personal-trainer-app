import React from 'react';
import { Task } from '../types';
import { format } from 'date-fns';

interface TaskListProps {
  tasks: Task[];
  onToggleComplete: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onToggleComplete, onDeleteTask }) => {
  const getCategoryColor = (category: Task['category']) => {
    switch (category) {
      case 'exercise':
        return '#4ade80';
      case 'nutrition':
        return '#60a5fa';
      case 'lifestyle':
        return '#f59e0b';
      default:
        return '#94a3b8';
    }
  };

  return (
    <div className="task-list">
      {tasks.length === 0 ? (
        <p className="empty-state">今日のタスクはありません</p>
      ) : (
        tasks.map((task) => (
          <div key={task.id} className="task-item">
            <div className="task-content">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => onToggleComplete(task.id)}
                className="task-checkbox"
              />
              <div className="task-details">
                <h3 className={task.completed ? 'completed' : ''}>{task.title}</h3>
                <p>{task.description}</p>
                <div className="task-meta">
                  <span 
                    className="category-badge"
                    style={{ backgroundColor: getCategoryColor(task.category) }}
                  >
                    {task.category === 'exercise' && '運動'}
                    {task.category === 'nutrition' && '栄養'}
                    {task.category === 'lifestyle' && '生活習慣'}
                  </span>
                  <span className="due-date">
                    期限: {format(task.dueDate, 'MM/dd HH:mm')}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => onDeleteTask(task.id)}
              className="delete-button"
            >
              削除
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default TaskList;