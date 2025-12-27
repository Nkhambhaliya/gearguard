import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useNavigate } from 'react-router-dom';
import { 
  subscribeToKanban, 
  moveRequest, 
  assignToSelf,
  isRequestOverdue 
} from '../../viewmodels/kanban.viewmodel';
import { RequestStatus } from '../../models/request.model';
import { useAuth } from '../../context/AuthContext';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';

const KanbanBoard = () => {
  const [columns, setColumns] = useState({
    [RequestStatus.NEW]: [],
    [RequestStatus.IN_PROGRESS]: [],
    [RequestStatus.REPAIRED]: [],
    [RequestStatus.SCRAP]: []
  });
  const [users, setUsers] = useState({});
  const [showDurationModal, setShowDurationModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [duration, setDuration] = useState('');
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Subscribe to realtime updates
    const unsubscribe = subscribeToKanban((data) => {
      setColumns(data);
    });

    loadUsers();

    return unsubscribe;
  }, []);

  const loadUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const usersMap = {};
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        usersMap[data.uid] = data;
      });
      setUsers(usersMap);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    // If dropped in same column, do nothing
    if (source.droppableId === destination.droppableId) return;

    const newStatus = destination.droppableId;
    
    // If moving to Repaired, ask for duration
    if (newStatus === RequestStatus.REPAIRED) {
      const request = Object.values(columns)
        .flat()
        .find(r => r.id === draggableId);
      setSelectedRequest(request);
      setShowDurationModal(true);
      return;
    }

    await moveRequest(draggableId, newStatus);
  };

  const handleAssignToSelf = async (requestId) => {
    await assignToSelf(requestId, currentUser.uid);
  };

  const handleDurationSubmit = async () => {
    if (selectedRequest && duration) {
      const { updateRequestStatus, setRequestDuration } = await import('../../viewmodels/request.viewmodel');
      await updateRequestStatus(selectedRequest.id, RequestStatus.REPAIRED);
      await setRequestDuration(selectedRequest.id, parseFloat(duration));
      setShowDurationModal(false);
      setDuration('');
      setSelectedRequest(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case RequestStatus.NEW:
        return 'bg-gray-100';
      case RequestStatus.IN_PROGRESS:
        return 'bg-blue-100';
      case RequestStatus.REPAIRED:
        return 'bg-green-100';
      case RequestStatus.SCRAP:
        return 'bg-red-100';
      default:
        return 'bg-gray-100';
    }
  };

  const renderCard = (request, index) => {
    const overdue = isRequestOverdue(request);
    const assignedUser = request.assignedTo ? users[request.assignedTo] : null;

    return (
      <Draggable key={request.id} draggableId={request.id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`relative overflow-hidden bg-white rounded-2xl shadow-md hover:shadow-2xl border-l-4 transition-all duration-300 transform ${
              overdue ? 'border-red-500 bg-red-50/50' : 'border-indigo-500'
            } ${snapshot.isDragging ? 'shadow-2xl scale-105 rotate-2 ring-4 ring-indigo-200' : 'hover:-translate-y-1'}`}
          >
            {/* Card Content */}
            <div className="p-5">
              {/* Header */}
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-gray-900 text-base flex-1 line-clamp-2 leading-snug">{request.subject}</h3>
                {overdue && (
                  <span className="ml-3 px-3 py-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-lg shadow-lg animate-pulse flex-shrink-0">
                    ⚠️ OVERDUE
                  </span>
                )}
              </div>
              
              {/* Description */}
              {request.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">{request.description}</p>
              )}
              
              {/* Metadata */}
              <div className="space-y-2 mb-4">
                {/* Type Badge */}
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg ${
                    request.type === 'Preventive' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {request.type === 'Preventive' ? '🛡️' : '🔧'}
                    {request.type}
                  </span>
                </div>
                
                {/* Scheduled Date */}
                {request.scheduledDate && (
                  <div className="flex items-center text-xs text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">
                    <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="font-medium">{new Date(request.scheduledDate.seconds * 1000).toLocaleDateString()}</span>
                  </div>
                )}
                
                {/* Duration */}
                {request.duration > 0 && (
                  <div className="flex items-center text-xs text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">
                    <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">{request.duration} hours</span>
                  </div>
                )}
              </div>

              {/* Assigned User */}
              {assignedUser && (
                <div className="flex items-center pt-3 border-t border-gray-100 mt-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center text-sm font-bold shadow-md">
                    {assignedUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="ml-3">
                    <p className="text-xs text-gray-500 font-medium">Assigned to</p>
                    <p className="text-sm text-gray-900 font-bold">{assignedUser.name}</p>
                  </div>
                </div>
              )}

              {/* Assign Button */}
              {!request.assignedTo && request.status === RequestStatus.NEW && (
                <button
                  onClick={() => handleAssignToSelf(request.id)}
                  className="mt-3 w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm py-3 px-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 font-bold shadow-md hover:shadow-lg"
                >
                  Assign to Me
                </button>
              )}
            </div>
          </div>
        )}
      </Draggable>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/20 py-8">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 bg-clip-text text-transparent">Kanban Board</h1>
            </div>
            <p className="text-base text-gray-600 ml-1 mt-2">🎯 Drag and drop cards to update their status</p>
          </div>
          <button
            onClick={() => navigate('/requests/create')}
            className="w-full lg:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 text-base font-bold flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            New Request
          </button>
        </div>

        {/* Kanban Columns Grid */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
          {Object.keys(columns).map((status) => {
            const statusTitle = status === RequestStatus.NEW ? '📥 New' :
                               status === RequestStatus.IN_PROGRESS ? '⚙️ In Progress' :
                               status === RequestStatus.REPAIRED ? '✅ Repaired' :
                               status === RequestStatus.SCRAP ? '🗑️ Scrap' : status;
            
            return (
              <div key={status} className="relative">
                {/* Column Container */}
                <div className={`rounded-3xl p-5 shadow-xl border-2 ${getStatusColor(status)} min-h-[800px] transition-all duration-300 hover:shadow-2xl`}>
                  {/* Column Header */}
                  <div className="flex items-center justify-between mb-5 pb-4 border-b-2 border-gray-200">
                    <h2 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                      {statusTitle}
                    </h2>
                    <span className="px-4 py-2 bg-white/90 backdrop-blur rounded-full text-sm text-gray-900 font-bold shadow-md">
                      {columns[status].length}
                    </span>
                  </div>
                  
                  {/* Droppable Area */}
                  <Droppable droppableId={status}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`space-y-4 min-h-[700px] rounded-2xl p-2 transition-all ${
                          snapshot.isDraggingOver ? 'bg-white/40' : ''
                        }`}
                      >
                        {columns[status].map((request, index) => 
                          renderCard(request, index)
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              </div>
            );
          })}
          </div>
        </DragDropContext>

      {showDurationModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4 animate-fade-in">
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full shadow-2xl animate-scale-in">
            <div className="mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Enter Duration</h2>
              <p className="text-sm text-gray-600">
                How many hours did this maintenance take?
              </p>
            </div>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="Enter hours (e.g., 2.5)"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base mb-6 font-semibold"
              step="0.5"
              min="0"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={handleDurationSubmit}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                ✓ Submit
              </button>
              <button
                onClick={() => {
                  setShowDurationModal(false);
                  setDuration('');
                  setSelectedRequest(null);
                }}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 transition-all duration-200 font-semibold border border-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default KanbanBoard;
