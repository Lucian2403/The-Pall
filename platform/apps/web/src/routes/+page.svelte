<script lang="ts">
  import {onMount} from 'svelte';
  import '$lib/pall-owner-ui.css';
  import '$lib/pall-entry-pages.css';

  // The homepage remains public even when the API is offline.
  // A verified session only changes the main action to Continue playing.
  let signedIn=$state(false);
  onMount(()=>{
    void (async()=>{
      try{
        const response=await fetch('/api/me',{cache:'no-store'});
        signedIn=response.ok;
      }catch{signedIn=false;}
    })();
  });
</script>

<svelte:head>
  <title>The Pall — Persistent Browser MMORPG</title>
  <meta name="description" content="The Pall is a free-to-play, persistent browser, text-based MMORPG focused on character progression, exploration, crafting, trading and a player-driven economy." />
</svelte:head>

<div class="entry-page landing">
  <div class="entry-wrap">
    <nav class="entry-nav" aria-label="Main navigation">
      <a href="/" class="brand" aria-label="The Pall, home">
        <img src="/ui-kit/branding/logo-compact.png" alt="The Pall" />
        <span>A CITY ENDURES</span>
      </a>
      <div class="entry-links">
        <a href="#game">The game</a>
        <a href="/introduction">The world</a>
        <a href="#development">Development</a>
        <a href="/account">Sign in</a>
      </div>
    </nav>

    <main>
      <section class="landing-hero" aria-labelledby="landing-title">
        <div class="hero-art" role="img" aria-label="Panorama of Grand Cylinder City and its enormous central power structure"></div>
        <div class="hero-content">
          <p class="entry-eyebrow">THE PALL · A CITY ENDURES</p>
          <h1 id="landing-title">A persistent world.<br />Your own path.</h1>
          <p class="hero-intro">A free-to-play, text-based browser MMORPG focused on the lives players build, the work they undertake and the risks they choose.</p>
          <div class="hero-actions">
            {#if signedIn}
              <a class="entry-button primary" href="/characters">Continue playing</a>
            {:else}
              <a class="entry-button primary" href="/account?mode=register">Create account</a>
              <a class="entry-button secondary" href="/account">Sign in</a>
            {/if}
          </div>
          <p class="hero-status">In active development · Playable introductory content</p>
        </div>
      </section>

      <section class="overview content-width" id="game" aria-labelledby="about-heading">
        <div class="section-heading">
          <p class="entry-eyebrow">THE GAME</p>
          <h2 id="about-heading">A world shaped by what you do.</h2>
        </div>
        <div class="approved-description">
          <p>The Pall is a free-to-play, persistent browser, text-based MMORPG focused on character progression, exploration, crafting, trading and a player-driven economy.</p>
          <p>Develop your skills without fixed classes, pursue different professions, undertake interactive jobs and prepare for expeditions into dangerous territories. Gameplay combines illustrated, text-driven interactions with tactical turn-based combat, where preparation, equipment and decisions matter.</p>
          <p>The world continues to evolve, and your choices determine how you make your living, what you specialise in and how far you're willing to venture.</p>
          <p class="principles">No pay-to-win mechanics. No mandatory PvP. No fixed classes.</p>
          <p class="availability">The Pall is currently in active development, with new gameplay systems and content being introduced progressively.</p>
        </div>
      </section>

      <section class="features content-width" aria-labelledby="features-heading">
        <div class="section-heading">
          <p class="entry-eyebrow">HOW YOU PLAY</p>
          <h2 id="features-heading">More than a single profession.</h2>
        </div>
        <div class="features-grid">
          <article>
            <span class="feature-index">01 / PROGRESSION</span>
            <h3>Skills, not class walls</h3>
            <p>Your abilities grow through specialisation, equipment and experience. Your starting background doesn't dictate your entire future.</p>
          </article>
          <article>
            <span class="feature-index">02 / WORK</span>
            <h3>Decisions in the details</h3>
            <p>Practical jobs involve inspections, choices and complications rather than a single button or a guaranteed outcome.</p>
          </article>
          <article>
            <span class="feature-index">03 / ECONOMY</span>
            <h3>Production and trade</h3>
            <p>Resource gathering, manufacturing, logistics and commerce form interconnected parts of the planned player economy.</p>
          </article>
          <article>
            <span class="feature-index">04 / EXPLORATION</span>
            <h3>Beyond familiar ground</h3>
            <p>Prepare for journeys beyond the protected city, where information, supplies and judgment may matter as much as combat.</p>
          </article>
        </div>
      </section>

      <section class="free-play content-width" aria-labelledby="free-play-heading">
        <div class="free-play-copy">
          <p class="entry-eyebrow">OUR COMMITMENT</p>
          <h2 id="free-play-heading">Free to play. No advantage for sale.</h2>
          <p>Progression is intended to come from playing, learning, trading and making choices, never from purchasing power. PvP is voluntary by default. Support for development, should it be introduced, won't grant a gameplay advantage.</p>
        </div>
      </section>

      <section class="development content-width" id="development" aria-labelledby="development-heading">
        <div class="section-heading">
          <p class="entry-eyebrow">DEVELOPMENT</p>
          <h2 id="development-heading">Built in public, one system at a time.</h2>
          <p>The Pall is not yet a finished or publicly launched MMO. The playable experience is expanding through tested introductory chapters and new systems.</p>
        </div>
        <div class="development-grid">
          <article>
            <p class="dev-state">IMPLEMENTED FOR TESTING</p>
            <h3>Millhand introduction</h3>
            <p>The smithing workshop, The Missing Stamp and three distinct Stage 4 follow-up routes are available in the current development build.</p>
          </article>
          <article>
            <p class="dev-state">NEXT IN DEVELOPMENT</p>
            <h3>Further onboarding</h3>
            <p>Additional Millhand stages, more job interactions and continued interface and systems work.</p>
          </article>
          <article>
            <p class="dev-state">LONGER-TERM DESIGN</p>
            <h3>The wider world</h3>
            <p>The economy, exploration, professions, encounters and persistent systems will expand beyond the initial character experience.</p>
          </article>
        </div>
        <div class="development-links">
          <a href="https://github.com/Lucian2403/The-Pall/commits/main/" target="_blank" rel="noopener noreferrer">Development history</a>
          <a href="https://github.com/Lucian2403/The-Pall/tree/main/docs" target="_blank" rel="noopener noreferrer">Design documentation</a>
          <a href="/introduction">Read the world introduction</a>
        </div>
      </section>

      <section class="closing-cta content-width" aria-labelledby="closing-heading">
        <div>
          <p class="entry-eyebrow">WITHIN THE WALLS, WE REMAIN.</p>
          <h2 id="closing-heading">Begin with a life of your own.</h2>
        </div>
        <a class="entry-button primary" href={signedIn?'/characters':'/account?mode=register'}>
          {signedIn?'Your characters':'Create an account'}
        </a>
      </section>
    </main>
    <footer class="landing-footer">
      <a href="/" class="footer-brand">THE PALL</a>
      <span>In active development. No release date announced.</span>
      <a href="/account">Account</a>
    </footer>
  </div>
</div>

<style>
  .landing{padding-top:13px}
  .landing .entry-wrap{max-width:1440px}
  .landing .entry-nav{padding:0 clamp(9px,1.1vw,18px) 12px}
  .landing-hero{position:relative;min-height:clamp(360px,35vw,505px);
    display:flex;align-items:end;overflow:hidden;isolation:isolate;border:1px solid #745538;
    background:#27221c}
  .hero-art{position:absolute;inset:0;z-index:-2;
    background:url('/ui-kit/resources/TheCityVista.png') center 34%/cover no-repeat}
  .landing-hero:after{content:'';position:absolute;z-index:-1;inset:0;pointer-events:none;
    background:linear-gradient(90deg,#15120ef0 0%,#15120ecc 24%,#15120e42 59%,transparent 90%),
    linear-gradient(0deg,#15120edc 0%,transparent 52%)}
  .hero-content{padding:clamp(24px,3.4vw,54px);max-width:680px}
  h1,h2,h3,p{margin-top:0}
  .hero-content h1{margin:10px 0 17px;font:600 clamp(34px,4.1vw,60px)/1.12 var(--pall-font-reading,Georgia,serif);
    letter-spacing:-.025em;color:#f8e5cb;text-shadow:0 2px 7px #050404bb}
  .hero-intro{max-width:540px;font:500 clamp(17px,1.4vw,20px)/1.48 var(--pall-font-reading,Georgia,serif);
    color:#f0ddc3}
  .hero-actions{display:flex;gap:11px;flex-wrap:wrap;margin-top:22px}
  .entry-button.primary{background:#705037;border-color:#c39c65;color:#fff0d7}
  .entry-button.primary:hover{background:#866044}
  .entry-button.secondary{background:#201912e0}
  .hero-actions .entry-button{min-width:150px;min-height:45px}
  .hero-status{margin:20px 0 0;color:#ead1ad;font:13px/1.4 var(--pall-font-label,'Arial Narrow',sans-serif);letter-spacing:.07em}
  .content-width{max-width:1320px;margin:0 auto}
  .overview,.features,.development{padding:clamp(27px,3.5vw,49px) clamp(13px,2.4vw,34px);
    border-bottom:1px solid #5b4937}
  .section-heading h2,.free-play h2,.closing-cta h2{
    font:600 clamp(25px,2.4vw,35px)/1.18 var(--pall-font-reading,Georgia,serif);
    color:#f2dcc0;margin:7px 0 20px}
  .overview{display:grid;grid-template-columns:minmax(220px,.85fr) minmax(0,1.6fr);gap:clamp(20px,3vw,52px)}
  .approved-description{max-width:820px}
  .approved-description p{margin:0 0 15px;font:500 17px/1.63 var(--pall-font-reading,Georgia,serif);color:#eddec6}
  .approved-description .principles{font-weight:700;color:#f5d9aa}
  .approved-description .availability{font-size:15px;color:#cfbfa8;font-style:italic}
  .features-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}
  .features-grid article{border-top:2px solid #a78050;background:#24211c;padding:20px 18px 15px}
  .feature-index,.dev-state{font:14px/1.3 var(--pall-font-label,'Arial Narrow',sans-serif);
    letter-spacing:.09em;color:#e1ba82}
  .features-grid h3,.development-grid h3{font:600 21px/1.2 var(--pall-font-reading,Georgia,serif);
    margin:11px 0;color:#f1dcbe}
  .features-grid p,.development-grid p,.free-play p,.development .section-heading p{
    color:#d4c3ab;font:15px/1.57 var(--pall-font-reading,Georgia,serif)}
  .free-play{margin:26px auto;border:1px solid #84603d;
    background:linear-gradient(110deg,#30261c,#201b16);padding:clamp(23px,3vw,41px)}
  .free-play-copy{max-width:860px}
  .free-play h2{margin-bottom:14px}
  .free-play p:last-child{margin-bottom:0;font-size:16px;color:#e8d8c0}
  .development .section-heading{max-width:810px}
  .development-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px;margin-top:23px}
  .development-grid article{padding:18px;border:1px solid #5d4833;background:#211e1a}
  .dev-state{color:#d3ad7c;margin-bottom:10px}
  .development-links{display:flex;gap:23px;flex-wrap:wrap;padding-top:21px}
  .development-links a{color:#f0ca92;text-underline-offset:3px;font:600 15px/1.35 var(--pall-font-reading,Georgia,serif)}
  .closing-cta{display:flex;align-items:center;justify-content:space-between;gap:20px;
    padding:30px clamp(13px,2.4vw,34px);border-bottom:1px solid #5b4937}
  .closing-cta h2{margin-bottom:0}
  .landing-footer{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;
    padding:20px clamp(13px,2.4vw,34px);font:14px/1.3 var(--pall-font-reading,Georgia,serif);color:#b8a68f}
  .landing-footer a{color:#e1b97b}
  .footer-brand{text-decoration:none;letter-spacing:.14em;font:16px var(--pall-font-label,'Arial Narrow',sans-serif)}
  @media(max-width:1050px){
    .features-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
    .landing-hero{min-height:410px}
  }
  @media(max-width:700px){
    .landing{padding:9px}
    .landing .entry-nav{flex-wrap:wrap}
    .landing .entry-links{gap:10px 16px}
    .landing-hero{min-height:480px;align-items:end}
    .hero-art{background-position:54% 35%}
    .landing-hero:after{background:linear-gradient(0deg,#15120ffa 0%,#15120fcc 48%,#15120f22 100%)}
    .hero-content{padding:21px}
    .overview{grid-template-columns:1fr;gap:9px}
    .features-grid,.development-grid{grid-template-columns:1fr}
    .closing-cta{align-items:flex-start;flex-direction:column}
  }
  @media(prefers-reduced-motion:reduce){
    .landing *{scroll-behavior:auto}
  }
</style>
