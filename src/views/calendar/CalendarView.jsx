import { useState, useEffect } from 'react';
import { 
  getPreventiveMaintenanceTasks, 
  groupTasksByDate,
  getTasksForDate 
} from '../../viewmodels/calendar.viewmodel';

const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [groupedTasks, setGroupedTasks] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    const result = await getPreventiveMaintenanceTasks();
    
    if (result.success) {
      setTasks(result.data);
      setGroupedTasks(groupTasksByDate(result.data));
    }
    
    setLoading(false);
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleDateClick = (day) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(clickedDate);
    const dayTasks = getTasksForDate(tasks, clickedDate);
    setSelectedTasks(dayTasks);
  };

  const hasTasksOnDate = (day) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    return groupedTasks[dateKey] && groupedTasks[dateKey].length > 0;
  };

  const getTaskCountForDate = (day) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    return groupedTasks[dateKey] ? groupedTasks[dateKey].length : 0;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
          <p className="text-gray-600 font-medium">Loading calendar...</p>
        </div>
      </div>
    );
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/30 to-emerald-50/20 py-12">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
        {/* Page Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-900 via-emerald-900 to-teal-900 bg-clip-text text-transparent">Maintenance Calendar</h1>
          </div>
          <p className="text-base text-gray-600 ml-1">📅 Schedule and track preventive maintenance tasks</p>
        </div>

        {/* Calendar Card */}
        <div className="relative overflow-hidden rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-100 opacity-40"></div>
          <div className="relative bg-white/90 backdrop-blur-xl shadow-2xl border border-gray-200/50 p-8 sm:p-10 rounded-3xl">
            {/* Calendar Header */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-10">
              <button
                onClick={previousMonth}
                className="w-full sm:w-auto group px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 text-base font-bold flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <svg className="w-6 h-6 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
              </div>
              <button
                onClick={nextMonth}
                className="w-full sm:w-auto group px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 text-base font-bold flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Next
                <svg className="w-6 h-6 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Day Names */}
            <div className="grid grid-cols-7 gap-3 mb-6">
              {dayNames.map(day => (
                <div key={day} className="text-center font-bold text-gray-700 py-4 text-sm uppercase tracking-wider bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-3">
              {/* Empty cells for days before month starts */}
              {Array.from({ length: startingDayOfWeek }).map((_, index) => (
                <div key={`empty-${index}`} className="h-28 sm:h-36 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-gray-200"></div>
              ))}

              {/* Days of the month */}
              {Array.from({ length: daysInMonth }).map((_, index) => {
                const day = index + 1;
                const hasTasks = hasTasksOnDate(day);
                const taskCount = getTaskCountForDate(day);

                return (
                  <div
                    key={day}
                    onClick={() => handleDateClick(day)}
                    className={`relative h-28 sm:h-36 border-2 rounded-2xl p-4 cursor-pointer transition-all duration-300 transform hover:scale-105 hover:z-10 ${
                      hasTasks
                        ? 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-green-300 hover:border-green-500 hover:shadow-2xl'
                        : 'bg-white border-gray-200 hover:border-gray-400 hover:shadow-xl'
                    }`}
                  >
                    <div className="font-bold text-gray-900 text-lg sm:text-xl">{day}</div>
                    {hasTasks && (
                      <div className="absolute bottom-3 left-3 right-3">
                        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xs px-3 py-2 rounded-xl font-bold shadow-lg flex items-center justify-center gap-1">
                          <span>{taskCount}</span>
                          <span>{taskCount > 1 ? '📅' : '📆'}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      {selectedDate && selectedTasks.length > 0 && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 sm:p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl animate-scale-in">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  📅 {selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </h2>
                <p className="text-sm text-gray-500 mt-1">{selectedTasks.length} scheduled task{selectedTasks.length > 1 ? 's' : ''}</p>
              </div>
              <button
                onClick={() => {
                  setSelectedDate(null);
                  setSelectedTasks([]);
                }}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {selectedTasks.map(task => (
                <div key={task.id} className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-5 hover:shadow-lg transition-all">
                  <h3 className="text-base font-bold text-gray-900 mb-2">{task.subject}</h3>
                  {task.description && (
                    <p className="text-sm text-gray-600 mb-4">{task.description}</p>
                  )}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-white rounded-lg p-3 border border-blue-200">
                      <span className="text-gray-500 font-bold uppercase text-xs">Type</span>
                      <p className="text-gray-800 mt-1 font-semibold">{task.type}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-blue-200">
                      <span className="text-gray-500 font-bold uppercase text-xs">Status</span>
                      <p className="text-gray-800 mt-1 font-semibold">{task.status}</p>
                    </div>
                    {task.duration > 0 && (
                      <div className="bg-white rounded-lg p-3 col-span-2 border border-blue-200">
                        <span className="text-gray-500 font-bold uppercase text-xs">Duration</span>
                        <p className="text-gray-800 mt-1 font-semibold">⏱️ {task.duration} hours</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedDate && selectedTasks.length === 0 && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full shadow-2xl animate-scale-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </h2>
              <button
                onClick={() => setSelectedDate(null)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-sm text-gray-600">No tasks scheduled for this date.</p>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default CalendarView;
