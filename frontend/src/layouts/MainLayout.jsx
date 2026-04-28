import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import TopBar from '../components/layout/TopBar';

export default function MainLayout() {
  const [language, setLanguage] = useState(
    () => localStorage.getItem('language') || 'en'
  );
  const navigate = useNavigate();

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const handleUpload = () => {
    navigate('/documents');
  };

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      <Sidebar onUpload={handleUpload} />
      <div className="flex flex-col flex-1 ml-64 min-w-0">
        <TopBar language={language} onLanguageChange={handleLanguageChange} />
        <main className="flex-1 overflow-auto mt-16">
          <Outlet context={{ language, setLanguage: handleLanguageChange }} />
        </main>
      </div>
    </div>
  );
}
