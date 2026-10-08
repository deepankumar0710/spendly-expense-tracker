import { money, iso } from '../constants';

function Stats({ items }) {
  const total = items.reduce((sum, item) => sum + item.amount, 0);

  const thisMonth = iso(new Date()).slice(0, 7);
  const monthTotal = items
    .filter((item) => item.date.startsWith(thisMonth))
    .reduce((sum, item) => sum + item.amount, 0);

  const byCategory = {};
  items.forEach((item) => {
    byCategory[item.cat] = (byCategory[item.cat] || 0) + item.amount;
  });
  const top = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="stats">
      <div className="card stat big">
        <span>Total spent</span>
        <b>{money(total)}</b>
      </div>
      <div className="card stat">
        <span>This month</span>
        <b>{money(monthTotal)}</b>
      </div>
      <div className="card stat">
        <span>Top category</span>
        <b>{top ? top[0] : '-'}</b>
      </div>
    </div>
  );
}

export default Stats;