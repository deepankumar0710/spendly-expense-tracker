import { CATS, money } from '../constants';

function Chart({ items, filter, setFilter }) {
  const byCategory = {};
  items.forEach((item) => {
    byCategory[item.cat] = (byCategory[item.cat] || 0) + item.amount;
  });

  const max = Math.max(1, ...Object.values(byCategory));

  return (
    <div className="card">
      <h2>Spending by category</h2>

      {Object.keys(CATS).map((cat) => (
        <button
          key={cat}
          className={'bar' + (filter === cat ? ' on' : '')}
          onClick={() => setFilter(filter === cat ? 'All' : cat)}
          aria-pressed={filter === cat}
        >
          <span>{cat}</span>
          <span className="track">
            <span
              className="fill"
              style={{
                width: ((byCategory[cat] || 0) / max) * 100 + '%',
                background: CATS[cat],
              }}
            />
          </span>
          <span className="amt">{money(byCategory[cat] || 0)}</span>
        </button>
      ))}
    </div>
  );
}

export default Chart;