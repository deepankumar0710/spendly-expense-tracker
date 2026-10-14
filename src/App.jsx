import { useState, useEffect } from 'react';
import List from './components/List';
import AddForm from './components/AddForm';
import Stats from './components/Stats';
import Chart from './components/Chart';
import { fetchExpenses, createExpense, deleteExpense as deleteExpenseApi } from './api/services';
import { fromApi, toApi } from './api/mappers';

const THEME_KEY = 'spendly:theme';

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
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('All');
  const [theme, setTheme] = useState(loadTheme);

  const loadExpenses = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchExpenses();
      setItems(data.map(fromApi));
    } catch (err) {
      console.error(err);
      setError('Could not load your expenses. Check that the server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (error) {
      console.error('Could not save theme:', error);
    }
  }, [theme]);

   const addExpense = async (expense) => {
    setError('');
    try {
      const created = await createExpense(toApi(expense));
      setItems((prev) => [fromApi(created), ...prev]);
      return true;
    } catch (err) {
      console.error(err);
      setError('Could not save the expense. Please try again.');
      return false;
    }
  };

  const deleteExpense = async (id) => {
    setError('');
    try {
      await deleteExpenseApi(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error(err);
      setError('Could not delete the expense. Please try again.');
    }
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

      {error && (
        <p className="app-error" role="alert">
          {error} <button onClick={loadExpenses}>Retry</button>
        </p>
      )}

      {loading ? (
        <p className="auth-loading">Loading your expenses...</p>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}

export default App;