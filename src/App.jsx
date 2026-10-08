import { useState, useEffect } from 'react';
import { seed } from './constants';
import List from './components/List';
import AddForm from './components/AddForm';
import Stats from './components/Stats';
import Chart from './components/Chart';

const ITEMS_KEY = 'spendly:items';
const THEME_KEY = 'spendly:theme';

function loadItems() {
  try {
    const raw = localStorage.getItem(ITEMS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (error) {
    console.error('Could not load saved expenses:', error);
  }
  return seed;
}

function loadTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch (error) {
    console.error('Could not load saved theme:', error);
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function App() {
  const [items, setItems] = useState(loadItems);
  const [filter, setFilter] = useState('All');
  const [theme, setTheme] = useState(loadTheme);

  useEffect(() => {
    try {
      localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Could not save expenses:', error);
    }
  }, [items]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (error) {
      console.error('Could not save theme:', error);
    }
  }, [theme]);

  const addExpense = (expense) => {
    setItems([expense, ...items]);
  };

  const deleteExpense = (id) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

    return (
    <div className="wrap">
      <header className="top">
        <div>
          <h1>Spendly</h1>
          <p className="sub">See where your money goes.</p>
        </div>
        <button className="ghost" onClick={toggleTheme}>
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>
      </header>

      <Stats items={items} />

      <div className="grid">
        <div className="col">
          <AddForm onAdd={addExpense} />
          <Chart items={items} filter={filter} setFilter={setFilter} />
        </div>
        <List
          items={items}
          onDel={deleteExpense}
          filter={filter}
          setFilter={setFilter}
        />
      </div>
    </div>
  );
}

export default App;