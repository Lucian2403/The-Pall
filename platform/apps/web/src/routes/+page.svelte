<script lang="ts">
  import {onMount} from 'svelte';
  import '$lib/pall-owner-ui.css';
  import '$lib/pall-entry-pages.css';

  // The public entry point always renders, even if the account API is offline.
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
  <title>The Pall — Make a living. Find your own way.</title>
  <meta name="description" content="The Pall is a free-to-play, persistent browser MMORPG set in a harsh, industrial world. Your character, skills, possessions and progress remain between sessions."/>
</svelte:head>

<div class="entry-page landing">
  <div class="entry-wrap">
    <nav class="entry-nav" aria-label="Main navigation">
      <a href="/" class="brand" aria-label="The Pall, home">
        <img src="/ui-kit/branding/logo-compact.png" alt="The Pall"/>
        <span>A CITY ENDURES</span>
      </a>
      <div class="entry-links">
        <a href="#game">The game</a>
        <a href="#stories">Stories</a>
        <a href="#crafting">Crafting</a>
        <a href="#development">Development</a>
        <a href="/account">Sign in</a>
      </div>
    </nav>

    <main>
      <section class="landing-hero" id="game" aria-labelledby="landing-title">
        <div class="hero-art" role="img" aria-label="Panorama of Grand Cylinder City and its enormous central power structure"></div>
        <div class="hero-content">
          <p class="entry-eyebrow">THE GAME</p>
          <h1 id="landing-title">Make a living.<br/>Find your own way.</h1>
          <p class="hero-intro"><em>The Pall</em> is a free-to-play, persistent browser MMORPG set in a harsh, industrial world. Your character, skills, possessions and progress remain between sessions.</p>
          <div class="hero-actions">
            {#if signedIn}
              <a class="entry-button primary" href="/characters">Continue playing</a>
            {:else}
              <a class="entry-button primary" href="/account?mode=register">Create account</a>
              <a class="entry-button secondary" href="/account">Sign in</a>
            {/if}
          </div>
          <p class="hero-status">In active development</p>
        </div>
      </section>

      <section class="world-section section-width" aria-labelledby="world-heading">
        <div class="section-heading">
          <p class="entry-eyebrow">THE WORLD</p>
          <h2 id="world-heading">Grand Cylinder City</h2>
        </div>
        <div class="section-prose">
          <p>Nearly a century ago, a catastrophe called <strong>The Plume</strong> poisoned much of the world. Nobody knows what caused it. Now, most survivors live behind the enormous walls of Grand Cylinder City, where factories run day and night and thousands struggle to earn their keep. Beyond the walls lie dangerous, largely uncharted territories. And farther still, <strong>the Pall</strong>, where few dare venture.</p>
          <p class="standout"><strong>You're just another person trying to get by.</strong></p>
        </div>
      </section>

      <section class="freedom-section section-width" aria-labelledby="freedom-heading">
        <div class="section-heading">
          <p class="entry-eyebrow">YOUR PATH</p>
          <h2 id="freedom-heading">No fixed classes.</h2>
        </div>
        <div class="section-prose">
          <p>Learn a trade, take jobs, build a business, explore or fight your way through trouble. There are no fixed classes. How you develop your skills, earn your coin and spend your days is entirely up to you.</p>
        </div>
      </section>

      <section class="story-section" id="stories" aria-labelledby="stories-heading">
        <div class="story-image" role="img" aria-label="Council records room, with shelves of documents and heavy industrial furnishings"></div>
        <div class="story-content">
          <p class="entry-eyebrow">STORIES &amp; CHOICES</p>
          <h2 id="stories-heading">But there's more to life here than making money.</h2>
          <p><strong>Mature, story-driven quests</strong> explore corruption, exploitation, poverty, survival and the darker side of human nature. You'll meet people with their own troubles and motives, face uncomfortable choices and uncover stories that don't always have a clear right or wrong. Sometimes, doing the decent thing comes at a price.</p>
        </div>
      </section>

      <section class="craft-section section-width" id="crafting" aria-labelledby="crafting-heading">
        <div class="craft-image" role="img" aria-label="Guther's smithing workshop and its working forge"></div>
        <div class="craft-content">
          <p class="entry-eyebrow">CRAFTING &amp; PRODUCTION</p>
          <h2 id="crafting-heading">Master a trade.</h2>
          <p><strong>Crafting is a profession in its own right.</strong> Gather resources, refine materials, manufacture components and assemble equipment. Your skills, tools, workshop, materials and decisions affect the quality of what you produce. There's genuine depth to mastering a trade.</p>
        </div>
      </section>

      <section class="economy-section section-width" aria-labelledby="economy-heading">
        <div class="section-heading">
          <p class="entry-eyebrow">THE ECONOMY</p>
          <h2 id="economy-heading">Every material has a purpose.</h2>
        </div>
        <div class="section-prose">
          <p>And unlike many MMORPGs, <strong>early-game materials don't become useless at higher levels</strong>. Coal, iron, leather, cloth and basic components remain part of advanced production, maintenance and repairs. Even the best equipment needs ordinary materials and the craftsmen who produce them. A newcomer supplying basic goods can still have a place in the endgame economy.</p>
        </div>
      </section>

      <section class="exploration-section section-width" aria-labelledby="exploration-heading">
        <div class="section-heading">
          <p class="entry-eyebrow">EXPLORATION &amp; COMBAT</p>
          <h2 id="exploration-heading">Beyond the city.</h2>
        </div>
        <div class="section-prose">
          <p>Beyond the city, procedurally generated territories offer new places to explore, resources to uncover and dangers to face. Discover something valuable? Sell the information to other players, or keep it for yourself. Just make sure you're prepared. Equipment, supplies and decisions matter, especially when trouble turns into tactical, turn-based combat.</p>
          <p class="standout">Be a craftsman, merchant, explorer, fighter, or a little of everything. You don't have to chase the same goals as everyone else.</p>
        </div>
      </section>

      <section class="principles-section section-width" aria-labelledby="principles-heading">
        <p class="entry-eyebrow">FREE TO PLAY</p>
        <h2 id="principles-heading">No pay-to-win. No forced PvP. No fixed classes.</h2>
      </section>

      <section class="development-section section-width" id="development" aria-labelledby="development-heading">
        <div>
          <p class="entry-eyebrow">DEVELOPMENT</p>
          <h2 id="development-heading">The Pall is taking shape.</h2>
          <p><em>The Pall</em> is in active development, with new locations, quests, professions and gameplay systems being introduced as the world takes shape.</p>
          <div class="development-links">
            <a href="https://github.com/Lucian2403/The-Pall/commits/main/" target="_blank" rel="noopener noreferrer">Development updates</a>
            <a href="https://github.com/Lucian2403/The-Pall/tree/main/docs" target="_blank" rel="noopener noreferrer">Design documents</a>
            <a href="/introduction">Read the world introduction</a>
          </div>
        </div>
        <div class="development-action">
          <a class="entry-button primary" href={signedIn?'/characters':'/account?mode=register'}>
            {signedIn?'Your characters':'Create account'}
          </a>
        </div>
      </section>
    </main>

    <footer class="landing-footer">
      <a href="/" class="footer-brand">THE PALL</a>
      <span>In active development</span>
      <a href="/account">Account</a>
    </footer>
  </div>
</div>

<style>
  .landing{padding-top:13px}
  .landing .entry-wrap{max-width:1440px}
  .landing .entry-nav{padding:0 clamp(9px,1.1vw,18px) 12px}
  .landing-hero{position:relative;isolation:isolate;overflow:hidden;
    display:flex;align-items:flex-end;min-height:clamp(360px,33vw,465px);
    background:#24201b;border:1px solid #745538}
  .hero-art{position:absolute;z-index:-2;inset:0;
    background:url('/ui-kit/resources/TheCityVista.png') center 34%/cover no-repeat}
  .landing-hero:after{content:'';position:absolute;inset:0;z-index:-1;pointer-events:none;
    background:linear-gradient(90deg,#15120ff2 0%,#15120fd0 27%,#15120f38 65%,transparent 100%),
      linear-gradient(0deg,#15120fcb,transparent 55%)}
  .hero-content{max-width:730px;padding:clamp(23px,3.5vw,48px)}
  h1,h2,p{margin-top:0}
  h1{margin:10px 0 18px;font:600 clamp(37px,4vw,60px)/1.12 var(--pall-font-reading,Georgia,serif);
    letter-spacing:-.024em;color:#f7e5cd;text-shadow:0 2px 7px #0009}
  .hero-intro{max-width:680px;margin:0;color:#f0dfc6;
    font:500 clamp(17px,1.5vw,20px)/1.5 var(--pall-font-reading,Georgia,serif)}
  .hero-actions{display:flex;gap:11px;flex-wrap:wrap;margin-top:22px}
  .entry-button.primary{background:#705037;border-color:#c39c65;color:#fff0d7}
  .entry-button.primary:hover{background:#866044}
  .entry-button.secondary{background:#201912e0}
  .hero-actions .entry-button{min-width:150px;min-height:45px}
  .hero-status{margin:16px 0 0;color:#e5cba8;font:14px/1.3 var(--pall-font-label,'Arial Narrow',sans-serif);
    letter-spacing:.08em;text-transform:uppercase}
  .section-width{max-width:1320px;margin:0 auto}
  .world-section,.freedom-section,.economy-section,.exploration-section{
    display:grid;grid-template-columns:minmax(220px,.8fr) minmax(0,1.65fr);
    gap:clamp(18px,3vw,55px);padding:clamp(29px,4vw,56px) clamp(14px,2.5vw,34px);
    border-bottom:1px solid #5c4935}
  .section-heading h2,.story-content h2,.craft-content h2,.development-section h2{
    font:600 clamp(25px,2.5vw,36px)/1.2 var(--pall-font-reading,Georgia,serif);
    color:#f0dbc0;margin:8px 0 18px}
  .section-prose{max-width:900px}
  .section-prose p,.story-content p,.craft-content p,.development-section p{
    color:#e1d1bb;font:500 clamp(16px,1.32vw,18px)/1.65 var(--pall-font-reading,Georgia,serif);
    margin:0 0 13px}
  .section-prose p:last-child,.story-content p:last-child,.craft-content p:last-child{margin-bottom:0}
  .section-prose strong,.story-content strong,.craft-content strong{font-weight:700;color:#f4dbb6}
  .standout{margin-top:20px!important;color:#edcda1!important;font-weight:600!important}
  .story-section{max-width:1320px;margin:0 auto;display:grid;grid-template-columns:minmax(0,.85fr) minmax(0,1.15fr);
    background:#252019;border-bottom:1px solid #705437}
  .story-image{min-height:340px;background:url('/locations/records/records-room.webp') center/cover no-repeat}
  .story-content{padding:clamp(28px,4vw,56px);align-self:center}
  .craft-section{display:grid;grid-template-columns:minmax(0,.85fr) minmax(0,1.15fr);
    gap:clamp(22px,4vw,54px);align-items:center;padding:clamp(30px,4vw,58px) clamp(14px,2.5vw,34px);
    border-bottom:1px solid #5c4935}
  .craft-image{min-height:305px;background:url('/workshop/environment.webp') center 57%/cover no-repeat;
    border:1px solid #745538}
  .economy-section{background:linear-gradient(90deg,#1e1c18,#28231e)}
  .principles-section{border:1px solid #856540;background:#32271d;
    padding:clamp(22px,3vw,34px);margin:22px auto;text-align:center}
  .principles-section h2{margin:11px 0 0;color:#f4d6a8;
    font:600 clamp(22px,2.5vw,36px)/1.25 var(--pall-font-reading,Georgia,serif)}
  .development-section{display:flex;align-items:center;justify-content:space-between;gap:28px;
    padding:clamp(27px,4vw,52px) clamp(14px,2.5vw,34px);
    border-top:1px solid #594530;border-bottom:1px solid #594530}
  .development-section>div:first-child{max-width:860px}
  .development-links{display:flex;gap:18px 25px;flex-wrap:wrap;margin-top:23px}
  .development-links a{color:#edc38a;font:600 15px/1.35 var(--pall-font-reading,Georgia,serif);
    text-underline-offset:3px}
  .development-action{flex-shrink:0}
  .landing-footer{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;
    padding:19px clamp(14px,2.5vw,34px);font:14px/1.3 var(--pall-font-reading,Georgia,serif);color:#b8a68f}
  .landing-footer a{color:#e1b97b}
  .footer-brand{text-decoration:none;letter-spacing:.14em;
    font:16px var(--pall-font-label,'Arial Narrow',sans-serif)}
  @media(max-width:850px){
    .world-section,.freedom-section,.economy-section,.exploration-section{grid-template-columns:1fr;gap:5px}
    .story-section{grid-template-columns:1fr}
    .story-image{min-height:235px}
    .craft-section{grid-template-columns:1fr}
    .craft-image{min-height:235px}
  }
  @media(max-width:700px){
    .landing{padding:9px}
    .landing .entry-nav{flex-wrap:wrap}
    .landing .entry-links{gap:10px 16px}
    .landing-hero{min-height:440px}
    .hero-art{background-position:55% 35%}
    .landing-hero:after{background:linear-gradient(0deg,#15120ffb 0%,#15120fe0 55%,#15120f44 100%)}
    .hero-content{padding:21px}
    .development-section{align-items:flex-start;flex-direction:column}
  }
</style>