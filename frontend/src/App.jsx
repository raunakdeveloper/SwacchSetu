import React, { useEffect, useRef } from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ReportProvider } from "./context/ReportContext";
import { NoticeProvider } from "./context/NoticeContext";
import { WorkerProvider } from "./context/WorkerContext";
import { ToastProvider } from "./components/Toast";
import Footer from "./components/Footer";
import Routing from "./routings/Routing";

// Make sure this file exists!
import music from "./assets/music/music.mp3";

function App() {
  const audioRef = useRef(null);

  useEffect(() => {
    const hasPlayed = sessionStorage.getItem("songPlayed");

    const playMusic = () => {
      if (!audioRef.current) return;

      if (!hasPlayed) {
        audioRef.current.volume = 0.1;

        audioRef.current
          .play()
          .then(() => {
            sessionStorage.setItem("songPlayed", "true");
          })
          .catch(() => {});
      }
    };

    // Try autoplay
    playMusic();

    // Fallback on first click/touch
    const handleUserEvent = () => {
      playMusic();
      window.removeEventListener("click", handleUserEvent);
      window.removeEventListener("touchstart", handleUserEvent);
    };

    if (!hasPlayed) {
      window.addEventListener("click", handleUserEvent);
      window.addEventListener("touchstart", handleUserEvent);
    }

    return () => {
      window.removeEventListener("click", handleUserEvent);
      window.removeEventListener("touchstart", handleUserEvent);
    };
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <ReportProvider>
          <NoticeProvider>
            <WorkerProvider>
              <ToastProvider>
                {/* Audio tag (no loop) */}
                <audio ref={audioRef} src={music} preload="auto" />

                <div className="min-h-screen bg-gray-50 flex flex-col">
                  <main className="flex-1">
                    <Routing />
                  </main>
                  <Footer />
                </div>
              </ToastProvider>
            </WorkerProvider>
          </NoticeProvider>
        </ReportProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
