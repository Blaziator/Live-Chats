import "./App.css";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import LandingPage from "./pages/landing";
import Authentication from "./pages/authentication";
import { AuthProvider } from "./contexts/AuthContext";
import {HistoryProvider} from "./contexts/HistoryContext";
import VideoMeetComponent from "./pages/VideoMeet";
import HomeComponent from "./pages/Home";
import History from "./pages/History";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <>
      <Router>
        <AuthProvider>
          <HistoryProvider>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<Authentication/>}/>
              <Route path="/home" element={<HomeComponent/>}/>
              <Route path="/history" element={<History/>} />
              <Route path="/:url" element={<VideoMeetComponent/>} />
              <Route path="*" element={<NotFound/>} />
            </Routes>
          </HistoryProvider>
        </AuthProvider>
      </Router>
    </>
  )
}

export default App;