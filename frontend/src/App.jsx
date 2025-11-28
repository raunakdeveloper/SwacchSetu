import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ReportProvider } from './context/ReportContext';
import { NoticeProvider } from './context/NoticeContext';
import { WorkerProvider } from './context/WorkerContext';
import { ToastProvider } from './components/Toast';
import Footer from './components/Footer';
import Routing from './routings/Routing';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ReportProvider>
          <NoticeProvider>
            <WorkerProvider>
              <ToastProvider>
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