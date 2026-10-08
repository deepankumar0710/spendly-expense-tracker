import { useState } from 'react';
import { CATS, CUR, iso } from '../constants';

function AddForm({ onAdd }) {
  const [form, setForm] = useState({
    title: '',
    amount: '',
    cat: 'Food',
    date: iso(new Date()),
  });
  const [error, setError] = useState('');

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const amount = parseFloat(form.amount);

    if (!form.title.trim()) {
      setError('Enter what you spent on.');
      return;
    }
    if (!(amount > 0)) {
      setError('Amount must be greater than 0.');
      return;
    }

    onAdd({
      id: Date.now(),
      title: form.title.trim(),
      amount: amount,
      cat: form.cat,
      date: form.date,
    });

    setError('');
    setForm({ ...form, title: '', amount: '' });
  };

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h2>Add expense</h2>

      <label>
        Title
        <input
          value={form.title}
          onChange={handleChange('title')}
          placeholder="e.g. Coffee"
        />
      </label>

      <div className="row2">
        <label>
          Amount ({CUR})
          <input
            type="number"
            min="0"
            step="any"
            value={form.amount}
            onChange={handleChange('amount')}
          />
        </label>
        <label>
          Date
          <input
            type="date"
            value={form.date}
            onChange={handleChange('date')}
          />
        </label>
      </div>

      <label>
        Category
        <select value={form.cat} onChange={handleChange('cat')}>
          {Object.keys(CATS).map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </label>

      {error && <p className="err" role="alert">{error}</p>}

      <button className="add" type="submit">Add expense</button>
    </form>
  );
}

export default AddForm;