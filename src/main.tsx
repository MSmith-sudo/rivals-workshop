import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import './chapter.css';
import './court.css';
import './mind.css';
import './combat.css';
import './social.css';
import './music.css';
import './judgment.css';
import './enhancements.css';
import {ChapterBanner} from './WorkshopVisuals';
const ChapterOne = lazy(() => import('./ChapterOne'));
const ChapterTwo = lazy(() => import('./ChapterTwo'));
const ChapterThree = lazy(() => import('./ChapterThree'));
const ChapterFour = lazy(() => import('./ChapterFour'));
const ChapterFive = lazy(() => import('./ChapterFive'));
const ChapterSix = lazy(() => import('./ChapterSix'));
const ChapterSeven = lazy(() => import('./ChapterSeven'));
const WorkshopStudio = lazy(() => import('./WorkshopStudio'));
import { OfflineNotice } from './offline';
import './polish.css';
import './beta.css';
import {MobileShell,CompanionScreen} from './MobileShell';
import './mobile.css';

const SAVE_KEY = 'rivals-workshop.nickname';
function savedNickname() { try { return localStorage.getItem(SAVE_KEY) ?? ''; } catch { return ''; } }
const chapters = [
  { number: '07', symbol: '✺', title: 'The Final Judgment', description: 'Your flame. Your contradictions. Your legend, with receipts.', tag: 'FINAL IDENTITY & GROWTH' },
  { number: '06', symbol: '♫', title: 'The Soundtrack of Your Legend', description: 'Your entrance. Your battle montage. Your closing credits. Turn up your story.', tag: 'MUSIC & IDENTITY' },
    { number: '01', symbol: '◈', title: 'The Hero Behind the Player', description: 'The picks you love. The roles you dodge. The hill you’ll die on.', tag: 'PLAYER IDENTITY' },
  { number: '02', symbol: '⌖', title: 'The Balance Court', description: 'Defend your proposal. Hear the objections. Put your reasoning on trial.', tag: 'BALANCE & REASONING' },
  { number: '03', symbol: 'ϟ', title: 'The Mind Behind the Mechanics', description: 'Ten disciplines. Your match receipts. A provisional game-sense profile.', tag: 'GAME SENSE & REFLECTION' },
  { number: '04', symbol: '✧', title: 'Trial by Combat', description: 'Branching battles. Changing threats. Your instincts put into practice.', tag: 'TACTICAL ENCOUNTERS' },
  { number: '05', symbol: '◎', title: 'The Friend or the Menace', description: 'Squad moments. Useful instincts. Their hidden costs. A provisional teamwork mirror.', tag: 'SOCIAL & TEAMWORK' },
];

function App() {
  const [route, setRoute] = useState(window.location.hash);
  useEffect(() => { const change = () => setRoute(window.location.hash); window.addEventListener('hashchange', change); return () => window.removeEventListener('hashchange', change); }, []);
  const [nickname, setNickname] = useState(savedNickname);
  const [draft, setDraft] = useState(nickname);
  const [stage, setStage] = useState<'nickname' | null>(null);
  const [storageMessage, setStorageMessage] = useState('');
  const dialog = useRef<HTMLDialogElement>(null);
  const startButton = useRef<HTMLButtonElement>(null);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (stage) { if (!dialog.current?.open) dialog.current?.showModal(); if (stage === 'nickname') input.current?.focus(); }
    else if (dialog.current?.open) { dialog.current.close(); startButton.current?.focus(); }
  }, [stage]);
  function start() { if(nickname){try{const saved=localStorage.getItem('rivals-workshop.last-route');window.location.hash=saved&&/^#chapter-[1-7](\/[-a-z0-9]+)?$/.test(saved)?saved:'#chapter-1';return;}catch{window.location.hash='chapter-1';return;}} setDraft(nickname); setStorageMessage(''); setStage('nickname'); }
  function save(event: React.FormEvent) {
    event.preventDefault(); const clean = draft.trim();
    if (!clean) { input.current?.setCustomValidity('Enter a nickname to continue.'); input.current?.reportValidity(); return; }
    setNickname(clean); setDraft(clean);
    try { localStorage.setItem(SAVE_KEY, clean); setStorageMessage('Nickname saved on this browser.'); }
    catch { setStorageMessage('Browser storage is unavailable. Your nickname will last for this visit only.'); }
    setStage(null); window.location.hash = 'chapter-1';
  }
  useEffect(()=>{if(/^#chapter-[1-7](\/[-a-z0-9]+)?$/.test(route))try{localStorage.setItem('rivals-workshop.last-route',route);}catch{}},[route]);
  if (route === '#companion') return <CompanionScreen/>;
  if (route === '#studio' || route === '#team') return <WorkshopStudio key={route} initialTab={route==='#team'?'team':'vault'}/>;
  if (route === '#chapter-7') return <><ChapterBanner key={7} chapter={7}/><ChapterSeven nickname={nickname} /></>;
  if (route === '#chapter-6') return <><ChapterBanner key={6} chapter={6}/><ChapterSix nickname={nickname} /></>;
  if (route === '#chapter-5') return <><ChapterBanner key={5} chapter={5}/><ChapterFive nickname={nickname} /></>;
  if (route === '#chapter-4') return <><ChapterBanner key={4} chapter={4}/><ChapterFour nickname={nickname} /></>;
  if (route === '#chapter-3') return <><ChapterBanner key={3} chapter={3}/><ChapterThree nickname={nickname} /></>;
  if (route === '#chapter-2') return <><ChapterBanner key={2} chapter={2}/><ChapterTwo nickname={nickname} /></>;
  if (route.startsWith('#chapter-1')) return <><ChapterBanner key={1} chapter={1}/><ChapterOne nickname={nickname} route={route} onHome={() => { window.location.hash = 'main'; }} /></>;
  return <>
    <a className="skip" href="#main">Skip to content</a>
    <header className="header"><a className="brand" href="#main" aria-label="Rivals Workshop home"><img src="./flame.svg" alt=""/><span>RIVALS<span className="brand-sub">WORKSHOP</span></span></a><nav aria-label="Main navigation"><a href="#studio">Player Vault & squad studio</a><a href="#how-it-works">The workshop</a><a href="#chapters">The chapters</a><a href="#chapter-2">The Balance Court</a></nav><span className="local-badge"><i/> V2.5 MOBILE BETA</span></header>
    <main id="main">
      <section className="hero" aria-labelledby="welcome">
        <div className="hero-art" role="img" aria-label="Marvel Rivals characters in the supplied splash artwork"/>
        <div className="hero-text"><div className="eyebrow"><span/> A LITTLE SELF-DISCOVERY. A LOT OF FRIENDLY FIRE.</div><p id="welcome" className="welcome">Welcome to Rivals Workshop</p><h1>FIND YOUR<br/><span>FLAME<span className="period">.</span></span></h1><p className="hero-copy">Your mains. Your game sense.<br/>Your delusions. Your legacy.</p><p className="intro">A player assessment for the squad that has opinions.<br className="desktop-break"/> Discover your instincts, challenge your hot takes, and own your playstyle.</p><div className="actions"><button className="primary" ref={startButton} onClick={start}>{nickname ? 'Continue Assessment' : 'Start Assessment'} <span aria-hidden="true">↗</span></button><a className="secondary" href="#how-it-works">Learn How It Works <span aria-hidden="true">↓</span></a></div><div className="hero-meta"><span>PRIVATE DISCORD BETA</span><span>YOUR DEVICE. YOUR DATA.</span></div></div>
        <div className="art-label"><span>EVERY PLAYER HAS A STORY.</span><strong>LET’S FIND YOURS.</strong></div><div className="issue">VOL. 01 <span> / </span> THE PLAYER EDITION</div>
      </section>
      <div className="warning"><span aria-hidden="true">⚠</span><p><strong>Warning:</strong> results may expose your ego, your habits, and your inability to swap.</p><span className="warning-end" aria-hidden="true">YOU’VE BEEN WARNED. ↗</span></div>
      <section id="chapters" className="chapters" aria-labelledby="chapter-title"><div className="section-heading"><div><p className="eyebrow">THE ROAD TO SELF-AWARENESS</p><h2 id="chapter-title">Seven playable chapters. <span>One evolving story.</span></h2></div><span className="section-note">THE ASSESSMENT BLUEPRINT ↘</span></div><div className="chapter-grid">{[...chapters].sort((a,b)=>Number(a.number)-Number(b.number)).map(chapter => <article className="chapter" key={chapter.number}><div className="chapter-top"><span className="chapter-icon" aria-hidden="true">{chapter.symbol}</span><span className="chapter-number">/{chapter.number}</span></div><p className="chapter-tag">{chapter.tag}</p><h3>{chapter.title}</h3><p>{chapter.description}</p><span className="preview-label">{Number(chapter.number) <= 7 ? <a href={`#chapter-${Number(chapter.number)}`}>OPEN CHAPTER →</a> : 'CHAPTER PREVIEW'}</span></article>)}</div></section>
      <section id="how-it-works" className="how" aria-labelledby="how-title"><div><p className="eyebrow">LESS RANKED ANXIETY. MORE YOU.</p><h2 id="how-title">Meet the player<br/>behind the picks.</h2><p>Rivals Workshop is a playful mirror for your Marvel Rivals identity. It’s a conversation starter for your squad, with room for honest reflection and a little affectionate roasting.</p></div><ol><li><span>01</span><div><h3>Make it personal</h3><p>Use your private beta login, then choose your nickname.</p></div></li><li><span>02</span><div><h3>Explore your player identity</h3><p>The seven chapters cover your mains, instincts, and gloriously questionable takes.</p></div></li><li><span>03</span><div><h3>Build your story</h3><p>Chapter 1 explores the hero behind the player. Chapter 2 puts your balance proposals on trial. Chapter 3 explores ten game-sense disciplines. Chapter 4 tests them in branching tactical encounters. Chapter 5 explores communication and teamwork tradeoffs. Chapter 6 explores the soundtrack of your legend. Chapter 7 brings your answers together in The Final Judgment.</p></div></li></ol></section>
      <aside className="privacy"><span className="privacy-icon" aria-hidden="true">⌂</span><div><h3>Built for your browser. Kept on your device.</h3><p>Your chapters and profiles save locally. The optional companion sends only reviewed answers after consent. Export a backup before clearing browser data.</p></div><span className="privacy-stamp">LOCAL BY DEFAULT</span></aside>
    </main>
    <footer><a className="footer-brand" href="#main">RIVALS WORKSHOP <span>/ FIND YOUR FLAME</span></a><p>Unofficial fan project. Not affiliated with Marvel or NetEase.<br/>Original role illustrations. Optional supplied art retains its owners’ rights.</p><span>PLAY HARD. REFLECT HARDER.</span></footer>
    <dialog ref={dialog} aria-labelledby="dialog-title" onCancel={() => setStage(null)} onClick={event => { if (event.target === dialog.current) { const bounds = dialog.current.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) setStage(null); } }}><button className="close" aria-label="Close assessment" onClick={() => setStage(null)}>×</button><form onSubmit={save}><p className="eyebrow">PLAYER SETUP / 01</p><h2 id="dialog-title">Every flame<br/>needs a name.</h2><p>What should the squad call you?</p><label htmlFor="nickname">Player nickname</label><input id="nickname" ref={input} value={draft} onChange={event => { input.current?.setCustomValidity(''); setDraft(event.target.value); }} maxLength={24} required autoComplete="nickname" placeholder="Your legendary alias" aria-describedby="nickname-help"/><p id="nickname-help" className="small">1–24 characters. Saved only on this browser.</p><button className="primary" type="submit">Enter the Workshop <span aria-hidden="true">↗</span></button></form></dialog>
  </>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><OfflineNotice/><Suspense fallback={<main className="studio" role="status">Opening your workshop…</main>}><App/></Suspense><MobileShell/></React.StrictMode>);











