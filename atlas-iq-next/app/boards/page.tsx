'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTravelStore, Board, Place } from '../../lib/store/useTravelStore';
import PlaceCard from '../../components/ui/PlaceCard';
import DetailModal from '../../components/ui/DetailModal';
import StaggeredMenu from '../../components/StaggeredMenu/StaggeredMenu';
import { Folder, Plus, Trash2, ArrowLeft } from 'lucide-react';

export default function BoardsPage() {
  const router = useRouter();
  const boards = useTravelStore((state) => state.boards);
  const deleteBoard = useTravelStore((state) => state.deleteBoard);
  const createBoard = useTravelStore((state) => state.createBoard);
  const enrichedPlaces = useTravelStore((state) => state.enrichedPlaces);

  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardDesc, setNewBoardDesc] = useState('');
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  // Mount check for Zustand hydration compatibility
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCreateBoard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoardName.trim()) return;
    createBoard(newBoardName.trim(), newBoardDesc.trim());
    setNewBoardName('');
    setNewBoardDesc('');
    setShowCreateModal(false);
  };

  const handleDeleteBoard = (boardId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this board? Pinned places inside will remain on the map.')) {
      deleteBoard(boardId);
      setSelectedBoard(null);
    }
  };

  const getBoardCover = (board: Board) => {
    if (board.placeIds.length > 0) {
      const place = enrichedPlaces[board.placeIds[0]];
      if (place) return place.photoUrl;
    }
    return null;
  };

  const getBoardPlacesList = (board: Board) => {
    return board.placeIds
      .map(id => enrichedPlaces[id])
      .filter(Boolean) as Place[];
  };

  const handleNavigate = (targetPage: string) => {
    if (targetPage === 'landing') {
      router.push('/');
    } else {
      router.push(`/${targetPage}`);
    }
  };

  const renderContent = () => {
    if (selectedBoard) {
      const board = boards.find(b => b.id === selectedBoard.id) || selectedBoard;
      const places = getBoardPlacesList(board);

      return (
        <div className="board-detail-container fade-in">
          <div className="board-detail-header">
            <button className="back-boards-btn" onClick={() => setSelectedBoard(null)}>
              <ArrowLeft size={16} />
              <span>All Boards</span>
            </button>

            <div className="board-title-area">
              <h2 className="board-detail-title">{board.name}</h2>
              {board.description && <p className="board-detail-desc">{board.description}</p>}
              <span className="spots-count-tag">{places.length} saved spots</span>
            </div>

            <button
              className="delete-board-btn"
              onClick={(e) => handleDeleteBoard(board.id, e)}
              title="Delete Board"
            >
              <Trash2 size={16} />
              <span>Delete Board</span>
            </button>
          </div>

          <div className="board-places-content">
            {places.length === 0 ? (
              <div className="empty-board-state">
                <Folder size={48} className="folder-icon" />
                <h3>This board is empty</h3>
                <p>Explore places and pin them here to build your collection.</p>
              </div>
            ) : (
              <div className="explore-grid">
                {places.map((place, idx) => (
                  <PlaceCard
                    key={`${place.id}-${idx}`}
                    place={place as any}
                    onClick={setSelectedPlace as any}
                  />
                ))}
              </div>
            )}
          </div>

          {selectedPlace && (
            <DetailModal
              place={selectedPlace as any}
              onClose={() => setSelectedPlace(null)}
            />
          )}
        </div>
      );
    }

    return (
      <div className="boards-dashboard fade-in">
        <div className="boards-dashboard-header">
          <div>
            <span className="subtitle-tag">Personal Collections</span>
            <h2 className="dashboard-title">Your Boards</h2>
          </div>
          <button className="create-board-dashboard-btn" onClick={() => setShowCreateModal(true)}>
            <Plus size={18} />
            <span>New Board</span>
          </button>
        </div>

        <div className="boards-grid">
          <div className="board-card create-trigger-card" onClick={() => setShowCreateModal(true)}>
            <div className="create-icon-circle">
              <Plus size={24} />
            </div>
            <span>Create Board</span>
          </div>

          {boards.map(board => {
            const coverUrl = getBoardCover(board);
            const count = board.placeIds.length;

            return (
              <div
                key={board.id}
                className="board-card"
                onClick={() => setSelectedBoard(board)}
              >
                <div className="board-card-cover-wrapper">
                  {coverUrl ? (
                    <div className="board-cover-img" style={{ backgroundImage: `url(${coverUrl})` }} />
                  ) : (
                    <div className="board-cover-fallback">
                      <Folder size={32} />
                    </div>
                  )}
                  <span className="board-badge-count">{count} spots</span>
                </div>
                <div className="board-card-info">
                  <h3>{board.name}</h3>
                  <p>{board.description || 'No description'}</p>
                </div>
              </div>
            );
          })}
        </div>

        {showCreateModal && (
          <div className="modal-overlay-blur" onClick={() => setShowCreateModal(false)}>
            <div className="create-board-modal glass-panel" onClick={(e) => e.stopPropagation()}>
              <h3>Create New Board</h3>
              <form onSubmit={handleCreateBoard}>
                <div className="input-group">
                  <label>Board Name</label>
                  <input
                    type="text"
                    value={newBoardName}
                    onChange={(e) => setNewBoardName(e.target.value)}
                    placeholder="e.g. Kyoto Autumn 2027"
                    autoFocus
                    required
                  />
                </div>
                <div className="input-group">
                  <label>Description</label>
                  <textarea
                    value={newBoardDesc}
                    onChange={(e) => setNewBoardDesc(e.target.value)}
                    placeholder="Notes, vibes, or plans..."
                    rows={3}
                  />
                </div>
                <div className="modal-dialog-actions">
                  <button type="submit" className="btn-confirm">Create</button>
                  <button type="button" className="btn-cancel" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!mounted) {
    return (
      <div className="explore-state" style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span>Loading Boards...</span>
      </div>
    );
  }

  return (
    <div className="app-container with-sidebar">
      {/* Floating Staggered Menu */}
      <StaggeredMenu position="left" activePage="boards" onNavigate={handleNavigate} />

      {/* Main Content */}
      <main className="main-content main-content--shifted">
        {renderContent()}
      </main>
    </div>
  );
}
