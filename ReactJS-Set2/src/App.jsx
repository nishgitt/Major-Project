import React, { useState, useEffect } from 'react';
import './style.css';

// Import components
import UseStateTasks from './components/useStateTasks';
import UseEffectTasks from './components/useEffectTasks';
import EventHandlingTasks from './components/eventHandlingTasks';
import RouterTasks from './components/routerTasks';
import NavigationTasks from './components/navigationTasks';
import FetchApiTasks from './components/fetchApiTasks';
import LocalStorageTasks from './components/localStorageTasks';

const CATEGORIES = [
  {
    name: 'Advanced useState',
    tasks: ['Marks Calculator', 'Employee Form', 'Multiple Counters', 'Favorite Movies', 'Expense Tracker']
  },
  {
    name: 'Advanced useEffect',
    tasks: ['API Refresh Counter', 'Online Connection', 'Screen Width Monitor', 'Quote Ticker', 'Color Rotator']
  },
  {
    name: 'Event Handling',
    tasks: ['Basic Calculator', 'Canvas Color Picker', 'Character Counter', 'Age Voting Checker', 'Image Slide Switcher']
  },
  {
    name: 'React Router',
    tasks: ['College Site', 'Nested Dashboards', 'Blog Dynamic Details', 'E-Commerce Cart', 'Protected Login Gate']
  },
  {
    name: 'Navigation / Multi-step',
    tasks: ['Quiz Wizard App', 'Retail Banking Ledger', 'Hospital Operations', 'LMS Workstation', 'Food Order Cart']
  },
  {
    name: 'Fetch API Integration',
    tasks: ['Comments Loader', 'Album Indexer', 'Photos Gallery', 'Random User Cards', 'Countries Explorer']
  },
  {
    name: 'Local Storage Sync',
    tasks: ['Name Greeter', 'Theme Preference', 'Persistent Todo List', 'Notes Workstation', 'Persistent Cart']
  }
];

export default function App() {
  const [activeCat, setActiveCat] = useState(0);
  const [activeSub, setActiveSub] = useState(0);
  
  // Theme state persistent (demonstrating LocalStorage Task 2 globally)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('globalThemePreference') || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('globalThemePreference', theme);
    if (theme === 'dark') {
      document.body.className = '';
    } else {
      document.body.className = 'light-theme';
    }
  }, [theme]);

  const selectCategory = (index) => {
    setActiveCat(index);
    setActiveSub(0); // reset to first subtask on category switch
  };

  const renderActiveTaskComponent = () => {
    switch (activeCat) {
      case 0: return <UseStateTasks activeSubTask={activeSub} />;
      case 1: return <UseEffectTasks activeSubTask={activeSub} />;
      case 2: return <EventHandlingTasks activeSubTask={activeSub} />;
      case 3: return <RouterTasks activeSubTask={activeSub} />;
      case 4: return <NavigationTasks activeSubTask={activeSub} />;
      case 5: return <FetchApiTasks activeSubTask={activeSub} />;
      case 6: return <LocalStorageTasks activeSubTask={activeSub} globalTheme={theme} setGlobalTheme={setTheme} />;
      default: return <div>Select a task category.</div>;
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar navigation */}
      <aside className="sidebar">
        <div className="logo-section">
          <span>⚡ React Set-2 Docs</span>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
          {CATEGORIES.map((cat, catIdx) => (
            <div className="category-group" key={catIdx}>
              <button 
                type="button" 
                className={`category-btn ${activeCat === catIdx ? 'active' : ''}`}
                onClick={() => selectCategory(catIdx)}
              >
                <span>{cat.name}</span>
                <span>{activeCat === catIdx ? '▼' : '▶'}</span>
              </button>

              {activeCat === catIdx && (
                <ul className="subtask-list">
                  {cat.tasks.map((taskName, taskIdx) => (
                    <li key={taskIdx}>
                      <button 
                        type="button"
                        className={`subtask-btn ${activeSub === taskIdx ? 'active' : ''}`}
                        onClick={() => setActiveSub(taskIdx)}
                      >
                        Task {taskIdx + 1}: {taskName}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </aside>

      {/* Main Panel Viewport */}
      <main className="main-content">
        <header className="top-bar">
          <div className="breadcrumbs">
            {CATEGORIES[activeCat].name} &nbsp;&rarr;&nbsp; <span>Task {activeSub + 1}: {CATEGORIES[activeCat].tasks[activeSub]}</span>
          </div>

          <button 
            type="button"
            className="btn-secondary" 
            style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? '☀️ Light UI' : '🌙 Dark UI'}
          </button>
        </header>

        <div className="content-viewport">
          {renderActiveTaskComponent()}
        </div>
      </main>
    </div>
  );
}
