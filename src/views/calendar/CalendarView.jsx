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
        <div className="text-xl text-gray-600">Loading calendar...</div>
      </div>
    );
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="container mx-auto px-6 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Maintenance Calendar</h1>
        <p className="text-sm text-gray-500 mt-1">Schedule and track preventive maintenance</p>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        {/* Calendar Header */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={previousMonth}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>
          <h2 className="text-lg font-semibold text-gray-900">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button
            onClick={nextMonth}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
          >
            Next
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-3">
          {dayNames.map(day => (
            <div key={day} className="text-center font-medium text-gray-600 py-2 text-xs uppercase">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-3">
          {/* Empty cells for days before month starts */}
          {Array.from({ length: startingDayOfWeek }).map((_, index) => (
            <div key={`empty-${index}`} className="h-28 bg-gray-50 rounded-xl"></div>
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
                className={`h-28 border-2 rounded-xl p-3 cursor-pointer transition-all ${
                  hasTasks
                    ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-300 hover:border-blue-500 hover:shadow-lg'
                    : 'bg-white border-gray-100 hover:border-gray-300 hover:shadow-md'
                }`}
              >
                <div className="font-bold text-gray-800 text-lg">{day}</div>
                {hasTasks && (
                  <div className="mt-2">
                    <span className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs px-3 py-1.5 rounded-full font-semibold shadow-md">
                      {taskCount} task{taskCount > 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {selectedDate && selectedTasks.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Tasks for {selectedDate.toLocaleDateString()}
                </h2>
                <p className="text-sm text-gray-500 mt-1">{selectedTasks.length} scheduled task{selectedTasks.length > 1 ? 's' : ''}</p>
              </div>
              <button
                onClick={() => {
                  setSelectedDate(null);
                  setSelectedTasks([]);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              {selectedTasks.map(task => (
                <div key={task.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">{task.subject}</h3>
                  {task.description && (
                    <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                  )}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white rounded-lg p-2">
                      <span className="text-gray-500 font-medium">Type</span>
                      <p className="text-gray-800 mt-0.5">{task.type}</p>
                    </div>
                    <div className="bg-white rounded-lg p-2">
                      <span className="text-gray-500 font-medium">Status</span>
                      <p className="text-gray-800 mt-0.5">{task.status}</p>
                    </div>
                    {task.duration > 0 && (
                      <div className="bg-white rounded-lg p-2 col-span-2">
                        <span className="text-gray-500 font-medium">Duration</span>
                        <p className="text-gray-800 mt-0.5">{task.duration} hours</p>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {selectedDate.toLocaleDateString()}
              </h2>
              <button
                onClick={() => setSelectedDate(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="text-center py-8">
              <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm text-gray-600">No tasks scheduled for this date.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
