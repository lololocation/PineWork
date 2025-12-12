
import React, { useMemo } from 'react';
import { Task, Language } from '../types';
import { XIcon, CheckCircleIcon, TrashIcon } from './Icons';
import { translations } from '../translations';

interface TaskHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  language: Language;
  onDeletePermanent: (id: string) => void;
}

const TaskHistoryModal: React.FC<TaskHistoryModalProps> = ({ isOpen, onClose, tasks, language, onDeletePermanent }) => {
  const t = translations[language];

  // Group completed tasks by date
  // 注意：这里仍然只显示 completed 的任务，无论它是否被软删除了 (deleted=true)。
  // 如果用户在主界面删除了任务（软删除），它依然会出现在这里。
  // 这里的删除是“永久删除”，会从数组里彻底移除。
  const historyData = useMemo(() => {
    const completedTasks = tasks.filter(task => task.completed);
    
    // Sort by createdAt descending
    completedTasks.sort((a, b) => b.createdAt - a.createdAt);

    const grouped: Record<string, Task[]> = {};
    completedTasks.forEach(task => {
        const date = new Date(task.createdAt);
        const dateKey = date.toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        });
        if (!grouped[dateKey]) {
            grouped[dateKey] = [];
        }
        grouped[dateKey].push(task);
    });
    return grouped;
  }, [tasks, language]);

  const dates = Object.keys(historyData);

  return (
    <div 
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-500 ${isOpen ? 'visible' : 'invisible pointer-events-none'}`}
    >
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/30 backdrop-blur-md transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${isOpen ? 'opacity-100' : 'opacity-0'}`} 
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div 
        className={`bg-white relative rounded-[2rem] shadow-2xl w-full max-w-lg h-[80vh] flex flex-col overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-8'}`}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-primary-50 border-b border-primary-100 flex-shrink-0">
          <div>
              <h2 className="text-xl font-bold text-primary-900">{t.taskHistory}</h2>
              <p className="text-xs text-primary-600 mt-1 opacity-70">{t.historyDesc}</p>
          </div>
          <button onClick={onClose} className="p-2 text-primary-600 hover:bg-primary-200 rounded-full transition-colors">
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-white space-y-8">
            {dates.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60">
                     <CheckCircleIcon className="w-16 h-16 mb-4 stroke-1" />
                     <p>{t.noHistory}</p>
                </div>
            ) : (
                dates.map((date) => (
                    <div key={date} className="animate-[fadeIn_0.3s_ease-out]">
                        <div className="sticky top-0 bg-white/95 backdrop-blur-sm py-2 mb-3 border-b border-gray-100 z-10">
                            <h3 className="text-sm font-bold text-primary-600 uppercase tracking-wider">{date}</h3>
                        </div>
                        <div className="space-y-3 pl-2">
                            {historyData[date].map(task => (
                                <div key={task.id} className="flex items-start gap-3 group justify-between">
                                    <div className="flex items-start gap-3 flex-1">
                                        <div className="mt-1 w-2 h-2 rounded-full bg-primary-200 group-hover:bg-primary-400 transition-colors flex-shrink-0"></div>
                                        <div>
                                            <p className="text-gray-700 text-sm leading-relaxed line-through decoration-gray-300 decoration-2">{task.text}</p>
                                            <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                                                {new Date(task.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => onDeletePermanent(task.id)}
                                        className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                        title={t.deletePermanently}
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>
    </div>
  );
};

export default TaskHistoryModal;
