import { createClient } from '@supabase/supabase-js';

const client = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY, {
  realtime: { params: { eventsPerSecond: 30 } },
});

export const myId = crypto.randomUUID().slice(0, 8);

export function joinLobby({ onPeers, onSignal, onStatus }) {
  const ch = client.channel('iz-lobby', { config: { presence: { key: myId }, broadcast: { self: false } } });
  ch.on('presence', { event: 'sync' }, () => {
    const state = ch.presenceState();
    onPeers(Object.entries(state).filter(([id]) => id !== myId).map(([id, [meta]]) => ({ id, name: meta.name, status: meta.status })));
  });
  ch.on('broadcast', { event: 'signal' }, ({ payload }) => { if (payload.to === myId) onSignal(payload); });
  ch.subscribe((status, err) => onStatus(status, err));
  return {
    track: (name, status) => ch.track({ name, status }),
    untrack: () => ch.untrack(),
    signal: payload => ch.send({ type: 'broadcast', event: 'signal', payload: { ...payload, from: myId } }),
  };
}

export function openDuel(duelId, { onMsg, onPeerJoined, onPeerLeft }) {
  const ch = client.channel(`iz-duel-${duelId}`, { config: { presence: { key: myId }, broadcast: { self: false } } });
  let peerSeen = false;
  ch.on('broadcast', { event: 'd' }, ({ payload }) => onMsg(payload));
  ch.on('presence', { event: 'sync' }, () => {
    const others = Object.keys(ch.presenceState()).filter(id => id !== myId);
    if (others.length && !peerSeen) { peerSeen = true; onPeerJoined(); }
    else if (!others.length && peerSeen) onPeerLeft();
  });
  ch.subscribe(status => { if (status === 'SUBSCRIBED') ch.track({}); });
  return {
    send: payload => ch.send({ type: 'broadcast', event: 'd', payload }),
    close: () => client.removeChannel(ch),
  };
}
