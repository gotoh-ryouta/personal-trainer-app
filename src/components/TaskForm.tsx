import React, { useState } from 'react';
import { Task } from '../types';

interface TaskFormProps {
  onAddTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ onAddTask }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Task['category']>('exercise');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) return;

    onAddTask({
      title,
      description,
      category,
      completed: false,
      dueDate: new Date(dueDate),
    });

    setTitle('');
    setDescription('');
    setCategory('exercise');
    setDueDate('');
  };

  return (
    <form onSubmit={handleSubmit} className="task-form">
      <h3>新しいタスクを追加</h3>
      <input
        type="text"
        placeholder="タスク名"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <textarea
        placeholder="詳細説明"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value as Task['category'])}
      >
        <option value="exercise">運動</option>
        <option value="nutrition">栄養</option>
        <option value="lifestyle">生活習慣</option>
      </select>
      <input
        type="datetime-local"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        required
      />
      <button type="submit">タスクを追加</button>
    </form>
  );
};

export default TaskForm;