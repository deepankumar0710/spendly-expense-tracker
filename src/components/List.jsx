import { useMemo } from 'react';
import { CATS, money } from '../constants';

function List({ items, onDel, filter, setFilter }) {
  const shown = useMemo(() => {
    return items
      .filter((item) => filter === 'All' || item.cat === filter)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [items, filter]);

  return (
    <div className="card">
      <h2>Transactions</h2>

      <div className="chips">
        {['All', ...Object.keys(CATS)].map((c) => (
          <button
            key={c}
            className={'chip' + (filter === c ? ' on' : '')}
            onClick={() => setFilter(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="empty">No expenses here yet. Add one to get started.</p>
      ) : (
        <ul>
          {shown.map((item) => (
            <li key={item.id}>
              <span className="dot" style={{ background: CATS[item.cat] }} />
              <span>
                {item.title}
                <small>{item.cat}, {item.date}</small>
              </span>
              <b>{money(item.amount)}</b>
              <button
                className="del"
                onClick={() => onDel(item.id)}
                aria-label={'Delete ' + item.title}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default List;