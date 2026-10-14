const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

// API format -> the format your components already use
export const fromApi = (e) => ({
  id: e.id,
  title: e.title,
  amount: Number(e.amount), // the API sends "180.50" as a string
  cat: capitalize(e.category), // "food" -> "Food"
  date: e.date,
  notes: e.notes,
});

// Your component format -> API format
export const toApi = (x) => ({
  title: x.title,
  amount: Number(x.amount).toFixed(2), // "180.00"
  category: String(x.cat).toLowerCase(), // "Food" -> "food"
  date: x.date,
});