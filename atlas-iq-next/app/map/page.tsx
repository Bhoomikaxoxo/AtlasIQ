'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import StaggeredMenu from '../../components/StaggeredMenu/StaggeredMenu';
import { Loader2 } from 'lucide-react';

const MapInner = dynamic(() => import('../../components/MapInner'), {
  ssr: false,
  loading: () => (
    <div className="map-instructions-overlay glass-panel" style={{ height: '100%' }}>
      <Loader2 className="loader-icon spinning" size={32} />
      <h3>Initializing Map Canvas...</h3>
    </div>
  )
});

export default function MapPage() {
  const router = useRouter();

  const handleNavigate = (targetPage: string) => {
    if (targetPage === 'landing') {
      router.push('/');
    } else {
      router.push(`/${targetPage}`);
    }
  };

  return (
    <div className="app-container with-sidebar">
      {/* Floating Staggered Menu */}
      <StaggeredMenu position="left" activePage="map" onNavigate={handleNavigate} />

      {/* Main Content */}
      <main className="main-content main-content--shifted">
        <MapInner />
      </main>
    </div>
  );
}
