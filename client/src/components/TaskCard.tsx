import type { Task } from '../types/task';

interface TaskCardProps {
  task: Task;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  currentUser: {
    id: string;
    role: 'admin' | 'member';
  };
}

const TaskCard = ({ task, onEdit, onDelete, currentUser }: TaskCardProps) => {
  const canEdit = currentUser && (
    currentUser.role === 'admin' || 
    task.createdBy._id === currentUser.id || 
    task.assignee?._id === currentUser.id
  );
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done': return '✅';
      case 'in-progress': return '⚡';
      case 'todo': return '📋';
      default: return '📋';
    }
  };

  return (
    <div className="group bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 hover:bg-white/80">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex-1 group-hover:text-blue-700 transition-colors duration-200">
          {task.title}
        </h3>
        {isOverdue && (
          <div className="ml-2 p-1 bg-red-100 rounded-full">
            <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>

      {/* Status and Priority Badges */}
      <div className="flex gap-2 mb-4">
        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${
          task.priority === 'high' ? 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200' :
          task.priority === 'medium' ? 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border border-yellow-200' :
          'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200'
        }`}>
          {getPriorityIcon(task.priority)} {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
        </span>
        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${
          task.status === 'done' ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200' :
          task.status === 'in-progress' ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200' :
          'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border border-gray-200'
        }`}>
          {getStatusIcon(task.status)} {task.status === 'in-progress' ? 'In Progress' : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
        </span>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">{task.description}</p>
      )}

      {/* Metadata */}
      <div className="space-y-3 mb-4">
        <div className="grid grid-cols-1 gap-2 text-xs">
          <div className="flex items-center text-gray-600">
            <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="font-medium">Created by:</span> 
            <span className="ml-1">{task.createdBy.firstName} {task.createdBy.lastName}</span>
          </div>
          
          {task.assignee && (
            <div className="flex items-center text-gray-600">
              <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">Assigned to:</span>
              <span className="ml-1">{task.assignee.firstName} {task.assignee.lastName}</span>
            </div>
          )}
          
          <div className="flex items-center text-gray-600">
            <svg className="w-4 h-4 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="font-medium">Created:</span>
            <span className="ml-1">{new Date(task.createdAt).toLocaleDateString()}</span>
          </div>
          
          {task.dueDate && (
            <div className={`flex items-center ${isOverdue ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
              <svg className={`w-4 h-4 mr-2 ${isOverdue ? 'text-red-500' : 'text-orange-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">Due:</span>
              <span className="ml-1">{new Date(task.dueDate).toLocaleDateString()}</span>
              {isOverdue && <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">OVERDUE</span>}
            </div>
          )}
        </div>

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {task.tags.map((tag, index) => (
              <span key={index} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 border border-indigo-200">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {canEdit && (
        <div className="flex gap-3 pt-4 border-t border-gray-200/50">
          <button 
            onClick={() => onEdit(task._id)}
            className="flex-1 inline-flex justify-center items-center px-4 py-2.5 border border-gray-200 text-sm font-medium rounded-lg text-gray-700 bg-white/80 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 backdrop-blur-sm"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
          <button 
            onClick={() => onDelete(task._id)}
            className="flex-1 inline-flex justify-center items-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 shadow-lg"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
