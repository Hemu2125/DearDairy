import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CheckSquare, Plus, Trash2, Calendar, Bell } from 'lucide-react';
import { toast } from 'sonner';
import { API } from './App';
import { format } from 'date-fns';
import Navbar from '../components/Navbar';

const TodosReminders = ({ user }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('todos');
  const [todos, setTodos] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTodo, setNewTodo] = useState('');
  const [newReminder, setNewReminder] = useState({ text: '', date: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const [todosRes, remindersRes] = await Promise.all([
        fetch(`${API}/todos`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/reminders`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (!todosRes.ok || !remindersRes.ok) throw new Error('Failed to fetch data');

      const todosData = await todosRes.json();
      const remindersData = await remindersRes.json();

      setTodos(todosData);
      setReminders(remindersData);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTodo = async () => {
    if (!newTodo.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API}/todos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: newTodo }),
      });

      if (!response.ok) throw new Error('Failed to add todo');

      const data = await response.json();
      setTodos([data, ...todos]);
      setNewTodo('');
      toast.success('To-do added!');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleToggleTodo = async (todo) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API}/todos/${todo.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ completed: !todo.completed }),
      });

      if (!response.ok) throw new Error('Failed to update todo');

      const updated = await response.json();
      setTodos(todos.map((t) => (t.id === todo.id ? updated : t)));
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDeleteTodo = async (todoId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API}/todos/${todoId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to delete todo');

      setTodos(todos.filter((t) => t.id !== todoId));
      toast.success('To-do deleted');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleAddReminder = async () => {
    if (!newReminder.text.trim() || !newReminder.date) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API}/reminders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: newReminder.text, reminder_date: newReminder.date }),
      });

      if (!response.ok) throw new Error('Failed to add reminder');

      const data = await response.json();
      setReminders([data, ...reminders]);
      setNewReminder({ text: '', date: '' });
      toast.success('Reminder added!');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleToggleReminder = async (reminder) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API}/reminders/${reminder.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ completed: !reminder.completed }),
      });

      if (!response.ok) throw new Error('Failed to update reminder');

      const updated = await response.json();
      setReminders(reminders.map((r) => (r.id === reminder.id ? updated : r)));
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDeleteReminder = async (reminderId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API}/reminders/${reminderId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to delete reminder');

      setReminders(reminders.filter((r) => r.id !== reminderId));
      toast.success('Reminder deleted');
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] paper-texture">
      {/* Fixed Navigation */}
      <Navbar user={user} />

      <div className="max-w-5xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Tabs */}
          <div className="flex gap-4 mb-8">
            <button
              data-testid="todos-tab-btn"
              onClick={() => setActiveTab('todos')}
              className={`px-8 py-3 rounded-full font-serif transition-all ${
                activeTab === 'todos'
                  ? 'bg-[#3E2723] text-white shadow-lg'
                  : 'bg-white text-[#3E2723] border border-[#3E2723] hover:bg-[#3E2723] hover:text-white'
              }`}
            >
              To-dos ({todos.filter(t => !t.completed).length})
            </button>
            <button
              data-testid="reminders-tab-btn"
              onClick={() => setActiveTab('reminders')}
              className={`px-8 py-3 rounded-full font-serif transition-all ${
                activeTab === 'reminders'
                  ? 'bg-[#3E2723] text-white shadow-lg'
                  : 'bg-white text-[#3E2723] border border-[#3E2723] hover:bg-[#3E2723] hover:text-white'
              }`}
            >
              Reminders ({reminders.filter(r => !r.completed).length})
            </button>
          </div>

          {loading ? (
            <div className="text-center text-[#5D4037] text-xl">Loading...</div>
          ) : activeTab === 'todos' ? (
            <div>
              {/* Add Todo */}
              <div className="bg-white p-6 rounded-sm shadow-lg border border-[#EFE6D5] mb-6">
                <div className="flex gap-3">
                  <input
                    data-testid="new-todo-input"
                    type="text"
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTodo()}
                    placeholder="Add a new to-do..."
                    className="flex-1 bg-transparent border-b-2 border-[#D7CCC8] focus:border-[#3E2723] px-0 py-2 rounded-none focus:outline-none transition-colors font-serif text-[#3E2723]"
                  />
                  <button
                    data-testid="add-todo-btn"
                    onClick={handleAddTodo}
                    className="bg-[#3E2723] text-white px-6 py-2 rounded-full hover:bg-[#5D4037] transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Add
                  </button>
                </div>
              </div>

              {/* Todos List */}
              <div className="space-y-3">
                {todos.length === 0 ? (
                  <div className="bg-white p-12 rounded-sm shadow-md border border-[#EFE6D5] text-center">
                    <CheckSquare className="w-16 h-16 text-[#C5A059] mx-auto mb-4" />
                    <p className="text-[#5D4037]">No to-dos yet. Add one above!</p>
                  </div>
                ) : (
                  todos.map((todo) => (
                    <motion.div
                      key={todo.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-white p-6 rounded-sm shadow-md border border-[#EFE6D5] flex items-center gap-4"
                      data-testid={`todo-item-${todo.id}`}
                    >
                      <input
                        data-testid={`todo-checkbox-${todo.id}`}
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => handleToggleTodo(todo)}
                        className="w-5 h-5 rounded border-[#3E2723] text-[#3E2723] focus:ring-[#3E2723] cursor-pointer"
                      />
                      <span className={`flex-1 font-serif ${todo.completed ? 'line-through text-[#A1887F]' : 'text-[#3E2723]'}`}>
                        {todo.text}
                      </span>
                      <button
                        data-testid={`delete-todo-btn-${todo.id}`}
                        onClick={() => handleDeleteTodo(todo.id)}
                        className="text-[#B71C1C] hover:text-[#5D4037] transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div>
              {/* Add Reminder */}
              <div className="bg-white p-6 rounded-sm shadow-lg border border-[#EFE6D5] mb-6">
                <div className="space-y-4">
                  <input
                    data-testid="new-reminder-text-input"
                    type="text"
                    value={newReminder.text}
                    onChange={(e) => setNewReminder({ ...newReminder, text: e.target.value })}
                    placeholder="Reminder text..."
                    className="w-full bg-transparent border-b-2 border-[#D7CCC8] focus:border-[#3E2723] px-0 py-2 rounded-none focus:outline-none transition-colors font-serif text-[#3E2723]"
                  />
                  <div className="flex gap-3">
                    <input
                      data-testid="new-reminder-date-input"
                      type="datetime-local"
                      value={newReminder.date}
                      onChange={(e) => setNewReminder({ ...newReminder, date: e.target.value })}
                      className="flex-1 bg-transparent border-b-2 border-[#D7CCC8] focus:border-[#3E2723] px-0 py-2 rounded-none focus:outline-none transition-colors font-serif text-[#3E2723]"
                    />
                    <button
                      data-testid="add-reminder-btn"
                      onClick={handleAddReminder}
                      className="bg-[#3E2723] text-white px-6 py-2 rounded-full hover:bg-[#5D4037] transition-colors flex items-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Reminders List */}
              <div className="space-y-3">
                {reminders.length === 0 ? (
                  <div className="bg-white p-12 rounded-sm shadow-md border border-[#EFE6D5] text-center">
                    <Bell className="w-16 h-16 text-[#C5A059] mx-auto mb-4" />
                    <p className="text-[#5D4037]">No reminders yet. Add one above!</p>
                  </div>
                ) : (
                  reminders.map((reminder) => (
                    <motion.div
                      key={reminder.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-white p-6 rounded-sm shadow-md border border-[#EFE6D5] flex items-start gap-4"
                      data-testid={`reminder-item-${reminder.id}`}
                    >
                      <input
                        data-testid={`reminder-checkbox-${reminder.id}`}
                        type="checkbox"
                        checked={reminder.completed}
                        onChange={() => handleToggleReminder(reminder)}
                        className="w-5 h-5 rounded border-[#3E2723] text-[#3E2723] focus:ring-[#3E2723] cursor-pointer mt-1"
                      />
                      <div className="flex-1">
                        <span className={`block font-serif mb-1 ${reminder.completed ? 'line-through text-[#A1887F]' : 'text-[#3E2723]'}`}>
                          {reminder.text}
                        </span>
                        <div className="flex items-center gap-2 text-sm text-[#8F9779]">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(reminder.reminder_date), 'MMM dd, yyyy h:mm a')}
                        </div>
                      </div>
                      <button
                        data-testid={`delete-reminder-btn-${reminder.id}`}
                        onClick={() => handleDeleteReminder(reminder.id)}
                        className="text-[#B71C1C] hover:text-[#5D4037] transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default TodosReminders;