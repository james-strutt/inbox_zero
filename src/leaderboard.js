const URL = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/scores`;
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const HEADERS = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Accept-Profile': 'inbox_zero', 'Content-Profile': 'inbox_zero' };

export async function fetchTop(limit = 10) {
  const res = await fetch(`${URL}?select=name,score,won,created_at&order=score.desc,created_at.asc&limit=${limit}`, { headers: HEADERS });
  if (!res.ok) throw new Error(`Leaderboard read failed (${res.status})`);
  return res.json();
}

export async function submitScore({ name, score, dodged, hits, won }) {
  const res = await fetch(URL, {
    method: 'POST',
    headers: { ...HEADERS, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify({ name: name.trim().slice(0, 16), score, dodged, hits, won }),
  });
  if (!res.ok) throw new Error(`Score submit failed (${res.status})`);
}
