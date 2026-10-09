import { useEffect } from "react";

export default function App() {
  useEffect(() => {
    import("./game.js");
  }, []);

  return (
    <>
      <canvas id="stage" tabIndex="0" aria-label="Game view"></canvas>
      <div className="vignette"></div>
      <div id="stressGlow"></div>
      <div id="hurt"></div>
      <div id="floaters"></div>
      <div id="joy"><div id="joyKnob"></div></div>
      
      <div className="hud" id="hud">
        <div className="chip stress">
          <div className="stress-top"><span className="label">Stress</span><span id="stressState">Calm</span></div>
          <div className="meter"><div id="stressFill"></div></div>
        </div>
        <div className="chip clock">
          <div className="label">Wednesday</div>
          <div id="clock">9:00<small>AM</small></div>
          <div className="day"><div id="dayFill"></div></div>
        </div>
        <div className="chip score">
          <div className="label">Score</div>
          <div id="score">0</div>
          <span id="combo">x1</span>
        </div>
      </div>
      
      <div className="foot" id="foot">
        <div className="chip tally">
          <div><span className="label">Dodged</span><b id="dodged">0</b></div>
          <div><span className="label">Hits</span><b id="hits">0</b></div>
          <div className="buffs" id="buffs"></div>
        </div>
        <div className="btns">
          <button className="icon-btn" id="muteBtn" aria-label="Mute sound" title="Sound (M)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5 6 9H3v6h3l5 4z"/><path id="waves" d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg>
          </button>
          <button className="icon-btn" id="pauseBtn" aria-label="Pause" title="Pause (P)">
            <svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>
          </button>
          <div id="dashWrap">
            <svg id="dashRing" viewBox="0 0 70 70"><circle cx="35" cy="35" r="32" fill="none" stroke="rgba(244,239,228,.12)" strokeWidth="4"/><circle id="dashArc" cx="35" cy="35" r="32" fill="none" stroke="var(--teal)" strokeWidth="4" strokeLinecap="round" strokeDasharray="201" strokeDashoffset="0" transform="rotate(-90 35 35)"/></svg>
            <button id="dashBtn" aria-label="Chair spin dash">SPIN</button>
          </div>
        </div>
      </div>
      
      <div id="banner"><div className="t" id="bannerT"></div><div className="s" id="bannerS"></div></div>
      
      <section className="screen" id="startScreen" hidden>
        <article className="mail">
          <div className="mail-bar"><i className="dot r"></i><i className="dot y"></i><i className="dot g"></i><span>Inbox (4,812 unread)</span></div>
          <dl className="headers">
            <dt>From</dt><dd>Scott Jordan; literally everyone else</dd>
            <dt>To</dt><dd>You; All-Staff; All-Staff (2)</dd>
            <dt>Subject</dt><dd className="flag">RE: RE: FW: Quick question (URGENT!!)</dd>
          </dl>
          <div className="mail-body">
            <h1>Inbox <em>Zero</em></h1>
            <p className="lede">It's 9:00 on a Wednesday. Roll your chair around the floor and dodge every email, meeting invite and "quick question" until 5:00 PM. Get hit too often and your stress maxes out. Anything from Scott Jordan is aimed at you.</p>
            <div className="legend" id="legend"></div>
            <p className="keys desk-only"><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> or arrows to roll &nbsp;·&nbsp; <kbd>Space</kbd> chair-spin dash (brief immunity) &nbsp;·&nbsp; <kbd>P</kbd> pause</p>
            <p className="keys touch-only" id="touchKeys" hidden>Drag anywhere to roll. Tap SPIN to dash through trouble.</p>
            <form className="actions" id="startForm">
              <input id="nameInput" maxLength={16} required autoComplete="nickname" placeholder="Your name" aria-label="Your name for the leaderboard" />
              <button className="btn" id="startBtn">Clock in</button>
              <span className="best" id="bestLine"></span>
            </form>
            <ol className="board" id="boardTitle" aria-label="Top scores"></ol>
          </div>
        </article>
      </section>
      
      <section className="screen" id="pauseScreen" hidden>
        <article className="mail">
          <div className="mail-bar"><i className="dot r"></i><i className="dot y"></i><i className="dot g"></i><span>Status: Away</span></div>
          <div className="mail-body">
            <h2>Stepped away from desk</h2>
            <p className="lede">The emails will wait. They always do.</p>
            <div className="actions"><button className="btn" id="resumeBtn">Back to work</button><button className="btn ghost" id="quitBtn">Leave early</button></div>
          </div>
        </article>
      </section>
      
      <section className="screen" id="endScreen" hidden>
        <article className="mail">
          <div className="mail-bar"><i className="dot r"></i><i className="dot y"></i><i className="dot g"></i><span id="endBar">Automatic reply</span></div>
          <dl className="headers">
            <dt>From</dt><dd>You</dd>
            <dt>Subject</dt><dd id="endSubject">Automatic reply: Out of office</dd>
          </dl>
          <div className="mail-body">
            <h2 id="endTitle">Clocked off</h2>
            <p className="lede" id="endLede"></p>
            <div className="stats">
              <div className="stat hl"><span className="label">Score</span><b id="sScore">0</b></div>
              <div className="stat"><span className="label">Dodged</span><b id="sDodged">0</b></div>
              <div className="stat"><span className="label">Close calls</span><b id="sClose">0</b></div>
              <div className="stat"><span className="label">Scott Jordan dodged</span><b id="sScott">0</b></div>
              <div className="stat"><span className="label">Hits taken</span><b id="sHits">0</b></div>
              <div className="stat"><span className="label">Best</span><b id="sBest">0</b></div>
            </div>
            <p className="best" id="postMsg" role="status"></p>
            <ol className="board" id="boardEnd" aria-label="Top scores"></ol>
            <div className="actions">
              <button className="btn" id="againBtn">New workday</button>
              <button className="btn ghost" id="overtimeBtn" hidden>Do overtime</button>
            </div>
            <p className="sig">Sent from my chair</p>
          </div>
        </article>
      </section>
      
      <div id="loading">Loading the office…</div>
    </>
  );
}
