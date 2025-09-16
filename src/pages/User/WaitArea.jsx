import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import WaitingAreaUI from "../../components/waitlist/WaitingAreaUI";
import GameLoadingScreen from "../../components/ui/GameLoadingScreen";
import useQueueSSE from "../../hooks/useQueueSSE";

export default function WaitArea() {
  const location = useLocation();
  const { state } = location;
  const navigate = useNavigate();
  const [showGameLoader, setShowGameLoader] = useState(false);


  // const { waitingNumber, waitingMessage, remainingSeconds } = useQueueSSE(!!state); // Toggle SSE connection based on state presence
  const { waitingNumber, waitingMessage, remainingSeconds } = useQueueSSE();

  const handleGameZone = () => {
    setShowGameLoader(true);
    setTimeout(() => {
      navigate("/gamezone", {
        state: state
      });
    }, 3000);
  };

  const getUserData = () => {
    if (state?.userData) return state.userData;

    return {
      Name: localStorage.getItem("Name") || "",
      Contact: localStorage.getItem("Contact") || "",
      Number_of_People: localStorage.getItem("Number_of_People") || "",
      Table_Type: localStorage.getItem("Table_Type") || "",
      Gender: localStorage.getItem("Gender") || "",
    };
  };

  return showGameLoader ? (
    <GameLoadingScreen />
  ) : (
    <WaitingAreaUI
      userData={getUserData()}
      waitingNumber={waitingNumber}
      waitingTime={remainingSeconds}
      waitingMessage={waitingMessage}
      onPlayGameClick={handleGameZone}
    />
  );
}
