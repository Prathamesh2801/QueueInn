import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import WaitingAreaUI from '../../components/waitlist/WaitingAreaUI';
import GameLoadingScreen from '../../components/ui/GameLoadingScreen';

export default function WaitArea() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [showGameLoader, setShowGameLoader] = useState(false);

  if (!state) {
    navigate('/');
    return null;
  }

  const handleGameZone = () => {
    setShowGameLoader(true);

    // After 3 seconds, navigate to /gamezone
    setTimeout(() => {
      navigate('/gamezone', { state });
    }, 5000);
  };

  return showGameLoader ? (
    <GameLoadingScreen />
  ) : (
    <WaitingAreaUI
      userData={state.userData}
      waitingNumber={state.waitingNumber}
      onPlayGameClick={handleGameZone}
    />
  );
}
