import React, { useState, useEffect } from 'react';
import { getBoards, createBoard, addPlaceToBoard, removePlaceFromBoard } from '../../services/store';
import { Plus, Check, Folder } from 'lucide-react';
import './BoardPicker.css';

function BoardPicker({ place, onClose }) {
  const [boards, setBoards] = useState([]);
  const [newBoardName, setNewBoardName] = useState('');
  const [showCreateInput, setShowCreateInput] = useState(false);

  useEffect(() => {
    setBoards(getBoards());
  }, []);

  const handleToggleBoard = (boardId, isInBoard) => {
    if (isInBoard) {
      removePlaceFromBoard(boardId, place.id);
    } else {
      addPlaceToBoard(boardId, place);
    }
    setBoards(getBoards()); // Refresh state
  };

  const handleCreateBoardSubmit = (e) => {
    e.preventDefault();
    if (!newBoardName.trim()) return;
    
    const newBoard = createBoard(newBoardName.trim(), 'My saved spots');
    addPlaceToBoard(newBoard.id, place);
    setNewBoardName('');
    setShowCreateInput(false);
    setBoards(getBoards()); // Refresh state
  };

  return (
    <div className="board-picker glass-panel" onClick={(e) => e.stopPropagation()}>
      <div className="picker-header">
        <h4>Save to Board</h4>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      <div className="boards-list-container">
        {boards.length === 0 ? (
          <p className="no-boards-msg">No boards created yet.</p>
        ) : (
          boards.map((board) => {
            const isInBoard = board.placeIds.includes(place.id);
            return (
              <button
                key={board.id}
                className={`board-picker-item ${isInBoard ? 'active' : ''}`}
                onClick={() => handleToggleBoard(board.id, isInBoard)}
              >
                <div className="board-item-info">
                  <Folder size={16} className="folder-icon" />
                  <span className="board-name-txt">{board.name}</span>
                </div>
                {isInBoard ? (
                  <Check size={16} className="check-icon" />
                ) : (
                  <span className="add-indicator">+</span>
                )}
              </button>
            );
          })
        )}
      </div>

      <div className="picker-footer">
        {showCreateInput ? (
          <form className="create-board-form" onSubmit={handleCreateBoardSubmit}>
            <input
              type="text"
              placeholder="Board name..."
              value={newBoardName}
              onChange={(e) => setNewBoardName(e.target.value)}
              autoFocus
              className="create-board-input"
            />
            <div className="form-actions">
              <button type="submit" className="btn-confirm-create">Create</button>
              <button 
                type="button" 
                className="btn-cancel-create"
                onClick={() => setShowCreateInput(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button 
            className="btn-trigger-create" 
            onClick={() => setShowCreateInput(true)}
          >
            <Plus size={16} />
            <span>Create new board</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default BoardPicker;
