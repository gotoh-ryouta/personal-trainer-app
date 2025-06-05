import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Task } from '../types';
import { format } from 'date-fns';
import { useSound } from '../hooks/useSound';
import { FaRunning, FaAppleAlt, FaBed, FaClipboard, FaCheck, FaCircle, FaTrashAlt, FaCheckCircle, FaBullseye } from 'react-icons/fa';

interface SwipeableTaskListProps {
  tasks: Task[];
  onToggleComplete: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask?: (taskId: string) => void;
}

const SwipeableTaskList: React.FC<SwipeableTaskListProps> = ({
  tasks,
  onToggleComplete,
  onDeleteTask,
  onEditTask
}) => {
  const { playSuccess, playClick } = useSound();
  const [deletingTasks, setDeletingTasks] = useState<Set<string>>(new Set());

  const handleSwipeComplete = (taskId: string) => {
    playSuccess();
    onToggleComplete(taskId);
  };

  const handleSwipeDelete = (taskId: string) => {
    setDeletingTasks(prev => new Set(prev).add(taskId));
    setTimeout(() => {
      onDeleteTask(taskId);
      setDeletingTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
    }, 300);
  };

  const getCategoryIcon = (category: Task['category']) => {
    switch (category) {
      case 'exercise': return React.createElement(FaRunning);
      case 'nutrition': return React.createElement(FaAppleAlt);
      case 'lifestyle': return React.createElement(FaBed);
      default: return React.createElement(FaClipboard);
    }
  };

  const groupedTasks = tasks.reduce((acc, task) => {
    const dateKey = format(task.dueDate, 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  const today = format(new Date(), 'yyyy-MM-dd');

  return (
    <div className="swipeable-task-list">
      {Object.entries(groupedTasks).map(([date, dateTasks]) => (
        <div key={date} className="task-group">
          <h3 className="task-date-header">
            {date === today ? '今日' : format(new Date(date), 'M月d日')}
          </h3>
          {dateTasks.map((task, index) => (
            <SwipeableTaskItem
              key={task.id}
              task={task}
              index={index}
              isDeleting={deletingTasks.has(task.id)}
              onComplete={() => handleSwipeComplete(task.id)}
              onDelete={() => handleSwipeDelete(task.id)}
              onEdit={() => onEditTask?.(task.id)}
              getCategoryIcon={getCategoryIcon}
            />
          ))}
        </div>
      ))}
      {tasks.length === 0 && (
        <div className="empty-state">
          <span className="empty-icon">{React.createElement(FaBullseye)}</span>
          <p>タスクがありません</p>
          <p className="empty-hint">新しいタスクを追加しましょう！</p>
        </div>
      )}
    </div>
  );
};

interface SwipeableTaskItemProps {
  task: Task;
  index: number;
  isDeleting: boolean;
  onComplete: () => void;
  onDelete: () => void;
  onEdit?: () => void;
  getCategoryIcon: (category: Task['category']) => React.ReactElement;
}

const SwipeableTaskItem: React.FC<SwipeableTaskItemProps> = ({
  task,
  index,
  isDeleting,
  onComplete,
  onDelete,
  onEdit,
  getCategoryIcon
}) => {
  const x = useMotionValue(0);
  const background = useTransform(
    x,
    [-150, 0, 150],
    ['#e74c3c', '#ffffff', '#27ae60']
  );
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = 100;
    if (info.offset.x > threshold) {
      onComplete();
    } else if (info.offset.x < -threshold) {
      onDelete();
    }
  };

  return (
    <motion.div
      className={`swipeable-task-item ${task.completed ? 'completed' : ''} ${isDeleting ? 'deleting' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -300 }}
      transition={{ delay: index * 0.05 }}
      style={{ background }}
    >
      <motion.div
        className="task-content-wrapper"
        drag="x"
        dragConstraints={{ left: -150, right: 150 }}
        dragElastic={0.3}
        onDragEnd={handleDragEnd}
        style={{ x, opacity }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="swipe-indicator left">
          {React.createElement(FaCheckCircle)} <span>完了</span>
        </div>
        <div className="swipe-indicator right">
          {React.createElement(FaTrashAlt)} <span>削除</span>
        </div>
        
        <div className="task-content">
          <motion.button
            className="task-checkbox-modern"
            onClick={onComplete}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {task.completed ? React.createElement(FaCheck) : React.createElement(FaCircle)}
          </motion.button>
          
          <div className="task-info">
            <div className="task-header">
              <span className="task-category-icon">{getCategoryIcon(task.category)}</span>
              <h4 className={task.completed ? 'completed' : ''}>{task.title}</h4>
            </div>
            {task.description && (
              <p className="task-description">{task.description}</p>
            )}
            <div className="task-meta">
              <span className="task-time">
                {format(task.dueDate, 'HH:mm')}
              </span>
              {task.completed && <span className="completed-badge">{React.createElement(FaCheck)} 完了</span>}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SwipeableTaskList;