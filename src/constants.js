export const CUR = '₹';

export const CATS = {
  Food: '#e8833a',
  Travel: '#3a86c8',
  Bills: '#7a5cc7',
  Shopping: '#d6457a',
  Health: '#2f9e75',
  Other: '#8a948f',
};

export const money = (n) => CUR + Math.round(n).toLocaleString('en-IN');

export const iso = (d) => d.toISOString().slice(0, 10);

const ago = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return iso(d);
};

export const seed = [
  { id: 1, title: 'Groceries', amount: 1850, cat: 'Food', date: ago(1) },
  { id: 2, title: 'Metro card top-up', amount: 500, cat: 'Travel', date: ago(2) },
  { id: 3, title: 'Electricity bill', amount: 2300, cat: 'Bills', date: ago(4) },
];