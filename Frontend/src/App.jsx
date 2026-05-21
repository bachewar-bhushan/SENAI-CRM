import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/shared/Navbar';
import { CRMPage } from './pages/CRMPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { InboxPage } from './pages/InboxPage';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<CRMPage />} />
        <Route path="/inbox" element={<InboxPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
