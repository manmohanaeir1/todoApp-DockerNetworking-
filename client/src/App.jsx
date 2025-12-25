'use client';

import { useState, useEffect } from 'react';
import TaskList from './components/TaskList';
import AddTaskDialog from './components/AddTaskDialog';
import LoadingSpinner from './components/LoadingSpinner';
import { taskService } from './services/taskService';

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch tasks on component mount
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await taskService.getAllTasks();
      setTasks(response.data);
    } catch (err) {
      setError('Failed to fetch tasks. Please try again.');
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (taskData) => {
    try {
      const response = await taskService.createTask(taskData);
      setTasks((prevTasks) => [response.data, ...prevTasks]);
      setIsDialogOpen(false);
      return { success: true };
    } catch (err) {
      console.error('Error creating task:', err);
      return {
        success: false,
        error: err.message || 'Failed to create task',
      };
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await taskService.deleteTask(taskId);
      setTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskId));
    } catch (err) {
      setError('Failed to delete task. Please try again.');
      console.error('Error deleting task:', err);
    }
  };

  const handleRetry = () => {
    fetchTasks();
  };

  // let sangam = 'unused variable here';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-900 to-black shadow-xl sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-center sm:text-left">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 w-10 h-10 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">✓</span>
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                    Task Manager Pro updated CICD
                  </h1>
                  <p className="text-gray-300 mt-1 text-sm md:text-base">
                    Streamlined task management with CI/CD pipeline
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsDialogOpen(true)}
              className="group bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              <span className="flex items-center gap-2">
                <svg 
                  className="w-5 h-5 transition-transform group-hover:rotate-90" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add New Task
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Stats Banner */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">Total Tasks</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">{tasks.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-800">Pending</p>
                <p className="text-2xl font-bold text-amber-900 mt-1">
                  {tasks.filter(t => t.status === 'pending').length}
                </p>
              </div>
              <div className="bg-amber-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-800">Completed</p>
                <p className="text-2xl font-bold text-emerald-900 mt-1">
                  {tasks.filter(t => t.status === 'completed').length}
                </p>
              </div>
              <div className="bg-emerald-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <LoadingSpinner />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-20 animate-pulse"></div>
              </div>
            </div>
            <p className="mt-6 text-gray-600 font-medium">Loading your tasks...</p>
            <p className="text-sm text-gray-500 mt-2">Preparing your workspace</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="bg-gradient-to-br from-red-50 to-white border border-red-200 rounded-2xl p-8 max-w-md mx-auto shadow-lg">
              <div className="relative mb-6">
                <div className="w-24 h-24 bg-gradient-to-r from-red-100 to-pink-100 rounded-full mx-auto flex items-center justify-center">
                  <svg
                    className="w-16 h-16 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Connection Error</h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleRetry}
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 shadow-md"
                >
                  Try Again
                </button>
                <button
                  onClick={() => setIsDialogOpen(true)}
                  className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 shadow-md"
                >
                  Create Task Offline
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Your Tasks</h2>
                <p className="text-gray-600 mt-1">
                  {tasks.length === 0 ? 'No tasks yet' : `${tasks.length} task${tasks.length !== 1 ? 's' : ''} in total`}
                </p>
              </div>
              {tasks.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Drag to reorder</span>
                </div>
              )}
            </div>
            
            {tasks.length === 0 ? (
              <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-white border-2 border-dashed border-gray-300 rounded-2xl">
                <div className="w-20 h-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full mx-auto flex items-center justify-center mb-6">
                  <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No tasks yet</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Get started by creating your first task. Organize your work and track progress efficiently.
                </p>
                <button
                  onClick={() => setIsDialogOpen(true)}
                  className="bg-gradient-to-r from-gray-900 to-black hover:from-black hover:to-gray-900 text-white px-8 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-offset-2 shadow-lg"
                >
                  Create Your First Task
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <TaskList tasks={tasks} onDeleteTask={handleDeleteTask} />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Add Task Dialog */}
      {isDialogOpen && (
        <AddTaskDialog onClose={() => setIsDialogOpen(false)} onSubmit={handleAddTask} />
      )}

      {/* Footer */}
      <footer className="mt-16 border-t bg-gradient-to-r from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">T</span>
                </div>
                <span className="font-bold text-gray-900">Task Manager Pro</span>
              </div>
              <p className="text-gray-600 text-sm">
                DevOps-ready task management with CI/CD integration
              </p>
            </div>
            <div className="flex items-center gap-6">
              <span className="text-sm text-gray-500">
                {tasks.length} task{tasks.length !== 1 ? 's' : ''} • Updated just now
              </span>
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-full">
                <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-800">CI/CD Active</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;