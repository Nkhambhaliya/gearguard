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
            className={`bg-white p-4 rounded-lg shadow hover:shadow-md mb-3 border-l-4 transition-shadow ${
              overdue ? 'border-red-500' : 'border-blue-500'
            } ${snapshot.isDragging ? 'shadow-lg' : ''}`}
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold text-gray-900 text-sm flex-1">{request.subject}</h3>
              {overdue && (
                <span className="px-2 py-0.5 bg-red-50 text-red-600 text-xs font-medium rounded">
                  OVERDUE
                </span>
              )}
            </div>
            
            {request.description && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{request.description}</p>
            )}
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  request.type === 'Preventive' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'
                }`}>
                  {request.type}
                </span>
              </div>
              {request.scheduledDate && (
                <div className="flex items-center text-xs text-gray-600">
                  <svg className="w-4 h-4 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {new Date(request.scheduledDate.seconds * 1000).toLocaleDateString()}
                </div>
              )}
              {request.duration > 0 && (
                <div className="flex items-center text-xs text-gray-600">
                  <svg className="w-4 h-4 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {request.duration} hours
                </div>
              )}
            </div>

            {assignedUser && (
              <div className="flex items-center pt-2 border-t border-gray-100 mt-2">
                <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-xs font-medium">
                  {assignedUser.name.charAt(0).toUpperCase()}
                </div>
                <span className="ml-2 text-xs text-gray-600">{assignedUser.name}</span>
              </div>
            )}

            {!request.assignedTo && request.status === RequestStatus.NEW && (
              <button
                onClick={() => handleAssignToSelf(request.id)}
                className="mt-2 w-full bg-blue-600 text-white text-xs py-1.5 px-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Assign to Me
              </button>
            )}
          </div>
        )}
      </Draggable>
    );
  };

  return (
    <div className="container mx-auto px-6 py-8 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kanban Board</h1>
          <p className="text-sm text-gray-500 mt-1">Drag and drop to update status</p>
        </div>
        <button
          onClick={() => navigate('/requests/create')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Request
        </button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Object.keys(columns).map((status) => {
            const statusTitle = status === RequestStatus.NEW ? 'New' :
                               status === RequestStatus.IN_PROGRESS ? 'In Progress' :
                               status === RequestStatus.REPAIRED ? 'Repaired' :
                               status === RequestStatus.SCRAP ? 'Scrap' : status;
            
            return (
              <div key={status} className={`rounded-xl p-4 shadow-sm ${getStatusColor(status)}`}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-gray-900 text-sm">{statusTitle}</h2>
                  <span className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600">
                    {columns[status].length}
                  </span>
                </div>
                
                <Droppable droppableId={status}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="min-h-[500px]"
                    >
                      {columns[status].map((request, index) => 
                        renderCard(request, index)
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {showDurationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Enter Duration</h2>
              <p className="text-sm text-gray-500">
                How many hours did this maintenance take?
              </p>
            </div>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="Enter hours"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm mb-4"
              step="0.5"
              min="0"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={handleDurationSubmit}
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
              >
                Submit
              </button>
              <button
                onClick={() => {
                  setShowDurationModal(false);
                  setDuration('');
                  setSelectedRequest(null);
                }}
                className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KanbanBoard;
