import { joinLobby } from './net.js';

const $ = id => document.getElementById(id);
const INVITE_TIMEOUT = 20000;

let lobby = null, peers = [], name = '', status = 'idle', pending = null, online = false;
let onDuelStart = () => {};

export function initLobby(handlers) {
  onDuelStart = handlers.onDuelStart;
  lobby = joinLobby({
    onPeers: list => { peers = list; render(); },
    onSignal,
    onStatus: (s, err) => {
      online = s === 'SUBSCRIBED';
      lobbyMessage(online ? '' : `Online play is unavailable right now (${s}${err ? ': ' + err.message : ''}). Retrying. Work networks often block live connections.`);
      render();
    },
  });
  $('acceptBtn').onclick = acceptInvite;
  $('declineBtn').onclick = declineOrCancel;
  $('onlineList').addEventListener('click', e => { const b = e.target.closest('button[data-id]'); if (b) invite(b.dataset.id); });
}

export function setLobbyName(n) { name = n.trim(); publish(); }
export function setLobbyStatus(s) { status = s; publish(); }
export function lobbyMessage(msg) { $('onlineMsg').textContent = msg; }

function publish() {
  if (!lobby) return;
  if (name) lobby.track(name, status); else lobby.untrack();
  render();
}

export function invite(peerId) {
  const peer = peers.find(p => p.id === peerId);
  if (pending || !peer || peer.status === 'busy') return;
  const duelId = crypto.randomUUID().slice(0, 8);
  pending = { kind: 'out', peer, duelId, timer: setTimeout(() => expire(duelId, `${peer.name} didn't answer.`), INVITE_TIMEOUT) };
  lobby.signal({ k: 'invite', to: peerId, name, duelId });
  lobbyMessage('');
  render();
}

function expire(duelId, msg) {
  if (pending?.duelId !== duelId) return;
  pending = null; lobbyMessage(msg); render();
}

function clearPending() { if (pending) clearTimeout(pending.timer); pending = null; }

function onSignal(m) {
  if (m.k === 'invite') {
    if (pending || status === 'busy') { lobby.signal({ k: 'decline', to: m.from, duelId: m.duelId, busy: true }); return; }
    pending = { kind: 'in', peer: { id: m.from, name: m.name }, duelId: m.duelId, timer: setTimeout(() => expire(m.duelId, ''), INVITE_TIMEOUT) };
    lobbyMessage(''); render(); return;
  }
  if (!pending || m.duelId !== pending.duelId) return;
  if (m.k === 'accept' && pending.kind === 'out') {
    const { peer, duelId } = pending; clearPending(); render();
    onDuelStart(duelId, peer, true);
  } else if (m.k === 'decline' && pending.kind === 'out') {
    const { peer } = pending; clearPending();
    lobbyMessage(`${peer.name} ${m.busy ? 'is in a game right now.' : 'declined.'}`); render();
  } else if (m.k === 'cancel' && pending.kind === 'in') {
    const { peer } = pending; clearPending();
    lobbyMessage(`${peer.name} cancelled the invite.`); render();
  }
}

function acceptInvite() {
  if (pending?.kind !== 'in') return;
  const { peer, duelId } = pending; clearPending();
  lobby.signal({ k: 'accept', to: peer.id, duelId });
  render();
  onDuelStart(duelId, peer, false);
}

function declineOrCancel() {
  if (!pending) return;
  const { peer, duelId, kind } = pending; clearPending();
  lobby.signal({ k: kind === 'in' ? 'decline' : 'cancel', to: peer.id, duelId });
  render();
}

function render() {
  const box = $('inviteBox'), list = $('onlineList');
  box.hidden = !pending;
  if (pending) {
    $('inviteText').textContent = pending.kind === 'in' ? `${pending.peer.name} wants to duel you.` : `Waiting for ${pending.peer.name}…`;
    $('acceptBtn').hidden = pending.kind !== 'in';
    $('declineBtn').textContent = pending.kind === 'in' ? 'Decline' : 'Cancel';
  }
  if (!online) { $('onlineCount').textContent = ''; list.replaceChildren(); return; }
  if (!name) { $('onlineCount').textContent = ''; list.replaceChildren(row('Enter your name above to appear online.')); return; }
  $('onlineCount').textContent = peers.length ? `${peers.length} other${peers.length === 1 ? '' : 's'} online` : 'Just you so far';
  list.replaceChildren(...(peers.length ? peers.map(peerRow) : [row('Nobody else is online right now. Leave this open and they will appear here.')]));
}

function row(text) { const li = document.createElement('li'); li.className = 'empty'; li.textContent = text; return li; }

function peerRow(peer) {
  const li = document.createElement('li');
  const n = document.createElement('span'); n.textContent = peer.name;
  const b = document.createElement('button'); b.className = 'btn small'; b.dataset.id = peer.id;
  b.textContent = peer.status === 'busy' ? 'In a game' : 'Invite';
  b.disabled = peer.status === 'busy' || !!pending;
  li.append(n, b);
  return li;
}
