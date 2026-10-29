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

      <!-- Alternating art/text rhythm: image/text, text/image, repeated. -->
      <section class="world-section landing-split section-width" aria-labelledby="world-heading">
        <div class="landing-media world-media" role="img" aria-label="The sky and the upper reaches of Grand Cylinder City, with the Cylinder rising above its rooftops"></div>
        <div class="landing-copy">
          <div class="section-heading">
            <p class="entry-eyebrow">THE WORLD</p>
            <h2 id="world-heading">Grand Cylinder City</h2>
          </div>
          <div class="section-prose landing-parchment">
            <p>Nearly a century ago, a catastrophe called <strong>The Plume</strong> poisoned much of the world. Nobody knows what caused it. Now, most survivors live behind the enormous walls of Grand Cylinder City, where factories run day and night and thousands struggle to earn their keep. Beyond the walls lie dangerous, largely uncharted territories. And farther still, <strong>the Pall</strong>, where few dare venture.</p>
            <p class="standout"><strong>You're just another person trying to get by.</strong></p>
          </div>
        </div>
      </section>

      <section class="freedom-section landing-split section-width" aria-labelledby="freedom-heading">
        <div class="landing-copy">
          <div class="section-heading">
            <p class="entry-eyebrow">YOUR PATH</p>
            <h2 id="freedom-heading">No fixed classes.</h2>
          </div>
          <div class="section-prose landing-parchment">
            <p>Learn a trade, take jobs, build a business, explore or fight your way through trouble. There are no fixed classes. How you develop your skills, earn your coin and spend your days is entirely up to you.</p>
          </div>
        </div>
        <div class="landing-media pall-media" role="img" aria-label="The Pall: an uncharted purple-hazed landscape with a solitary explorer overlooking distant mountains"></div>
      </section>

      <section class="story-section landing-split section-width" id="stories" aria-labelledby="stories-heading">
        <div class="landing-media story-media" role="img" aria-label="Council records room, with shelves of documents and heavy industrial furnishings"></div>
        <div class="landing-copy">
          <p class="entry-eyebrow">STORIES &amp; CHOICES</p>
          <h2 id="stories-heading">But there's more to life here than making money.</h2>
          <div class="landing-parchment">
            <p><strong>Mature, story-driven quests</strong> explore corruption, exploitation, poverty, survival and the darker side of human nature. You'll meet people with their own troubles and motives, face uncomfortable choices and uncover stories that don't always have a clear right or wrong. Sometimes, doing the decent thing comes at a price.</p>
          </div>
        </div>
      </section>

      <section class="craft-section landing-split section-width" id="crafting" aria-labelledby="crafting-heading">
        <div class="landing-copy">
          <p class="entry-eyebrow">CRAFTING &amp; PRODUCTION</p>
          <h2 id="crafting-heading">Master a trade.</h2>
          <div class="landing-parchment">
            <p><strong>Crafting is a profession in its own right.</strong> Gather resources, refine materials, manufacture components and assemble equipment. Your skills, tools, workshop, materials and decisions affect the quality of what you produce. There's genuine depth to mastering a trade.</p>
          </div>
        </div>
        <div class="landing-media craft-media" role="img" aria-label="Guther's smithing workshop with a heated forge and working tools"></div>
      </section>

      <section class="economy-section landing-split section-width" aria-labelledby="economy-heading">
        <div class="landing-media economy-media" role="img" aria-label="Illustrated crafting resources and components: metal plates, cloth, springs, tools, timber, ores, herbs and respirator"></div>
        <div class="landing-copy">
          <div class="section-heading">
            <p class="entry-eyebrow">THE ECONOMY</p>
            <h2 id="economy-heading">Every material has a purpose.</h2>
          </div>
          <div class="section-prose landing-parchment">
            <p>And unlike many MMORPGs, <strong>early-game materials don't become useless at higher levels</strong>. Coal, iron, leather, cloth and basic components remain part of advanced production, maintenance and repairs. Even the best equipment needs ordinary materials and the craftsmen who produce them. A newcomer supplying basic goods can still have a place in the endgame economy.</p>
          </div>
        </div>
      </section>

      <section class="exploration-section landing-split section-width" aria-labelledby="exploration-heading">
        <div class="landing-copy">
          <div class="section-heading">
            <p class="entry-eyebrow">EXPLORATION &amp; COMBAT</p>
            <h2 id="exploration-heading">Beyond the city.</h2>
          </div>
          <div class="section-prose landing-parchment">
            <p>Beyond the city, procedurally generated territories offer new places to explore, resources to uncover and dangers to face. Discover something valuable? Sell the information to other players, or keep it for yourself. Just make sure you're prepared. Equipment, supplies and decisions matter, especially when trouble turns into tactical, turn-based combat.</p>
            <p class="standout">Be a craftsman, merchant, explorer, fighter, or a little of everything. You don't have to chase the same goals as everyone else.</p>
          </div>
        </div>
        <div class="landing-media marches-media" role="img" aria-label="Grey Marches: a weathered wooden watchtower overlooking a misty, hazardous road and distant industrial skyline"></div>
      </section>

      <section class="principles-section section-width" aria-labelledby="principles-heading">
        <p class="entry-eyebrow">FREE TO PLAY</p>
        <h2 id="principles-heading">No pay-to-win. No forced PvP. No fixed classes.</h2>
      </section>

      <section class="development-section section-width" id="development" aria-labelledby="development-heading">
        <div>
          <p class="entry-eyebrow">DEVELOPMENT</p>
          <h2 id="development-heading">The Pall is taking shape.</h2>
          <div class="landing-parchment">
            <p><em>The Pall</em> is in active development, with new locations, quests, professions and gameplay systems being introduced as the world takes shape.</p>
          </div>
          <div class="development-links">
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
  .landing .entry-nav .brand img{
    width:clamp(138px,11.4vw,174px);
    max-height:94px;
    height:auto;
    object-fit:contain;
  }
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
    font:400 clamp(18px,1.5vw,20px)/1.6 Georgia,'Times New Roman',serif}
  .hero-actions{display:flex;gap:11px;flex-wrap:wrap;margin-top:22px}
  .entry-button.primary{background:#705037;border-color:#c39c65;color:#fff0d7}
  .entry-button.primary:hover{background:#866044}
  .entry-button.secondary{background:#201912e0}
  .hero-actions .entry-button{min-width:150px;min-height:45px}
  .hero-status{margin:16px 0 0;color:#e5cba8;font:14px/1.3 var(--pall-font-label,'Arial Narrow',sans-serif);
    letter-spacing:.08em;text-transform:uppercase}
  .section-width{max-width:1320px;margin:0 auto}
  /* Alternate each illustration with its own heading and reading panel.
     Text and images remain two balanced columns instead of tiny thumbnail cards. */
  .landing-split{
    display:grid;
    grid-template-columns:minmax(0,1fr) minmax(0,1.1fr);
    align-items:center;
    gap:clamp(24px,3.1vw,48px);
    padding:clamp(30px,3.7vw,54px) clamp(14px,2.4vw,34px);
    border-bottom:1px solid #5c4935;
  }
  .landing-copy{min-width:0}
  .section-heading h2,.landing-copy h2,.development-section h2{
    font:600 clamp(25px,2.5vw,36px)/1.2 var(--pall-font-reading,Georgia,serif);
    color:#f0dbc0;margin:8px 0 18px;
  }
  .landing-media{
    display:block;
    width:100%;
    min-width:0;
    height:clamp(300px,26vw,390px);
    background-color:#25201b;
    background-size:cover;
    background-position:center;
    background-repeat:no-repeat;
    border:1px solid #75583b;
    box-shadow:0 5px 16px #0006;
  }
  /* Only the upper skyline and Cylinder peak: not another full city panorama. */
  .world-media{
    background-image:url('/ui-kit/resources/TheCityVista.png');
    background-position:center top;
  }
  .pall-media{background-image:url('/locations/homepage/pall-zone.webp');background-position:center 48%}
  .story-media{background-image:url('/locations/records/records-room.webp');background-position:center}
  .craft-media{background-image:url('/workshop/environment.webp');background-position:center 53%}
  .economy-media{background-image:url('/locations/homepage/crafting-items.webp');background-position:center}
  .marches-media{background-image:url('/locations/homepage/grey-marches.webp');background-position:center 48%}
  .section-prose{max-width:100%}
  .section-prose p,.landing-copy p:not(.entry-eyebrow),.development-section p:not(.entry-eyebrow){
    color:#e1d1bb;font:500 clamp(16px,1.32vw,18px)/1.65 var(--pall-font-reading,Georgia,serif);
    margin:0 0 13px;
  }
  .section-prose p:last-child,.landing-copy p:last-child{margin-bottom:0}
  .section-prose strong,.landing-copy strong{font-weight:700;color:#f4dbb6}
  .standout{margin-top:20px!important;color:#edcda1!important;font-weight:600!important}
  .story-section{background:#252019}
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
  /*
   * Owner nine-slice parchment from the CRPG dialogue. Headings remain
   * outside these panels with their original type and colours.
   */
  .landing .landing-parchment{
    box-sizing:border-box;
    min-width:0;
    border-style:solid;
    border-color:transparent;
    border-width:27px 31px 25px 31px;
    border-image-source:url('/ui-kit/frames/dialogue-frame-trim.png');
    border-image-slice:145 190 125 190 fill;
    border-image-width:27px 31px 25px 31px;
    border-image-repeat:stretch;
    border-radius:0;
    background:transparent;
    padding:12px 16px 15px;
    box-shadow:0 7px 18px #0007;
    color:#271a12;
  }
  /* Body paragraphs alone use the clearer Georgia face. Heading, kicker and
     button typography remain in the existing owner-approved fonts. */
  .landing .landing-parchment p{
    margin:0 0 13px;
    font:400 clamp(17px,1.38vw,19px)/1.65 Georgia,'Times New Roman',serif;
    letter-spacing:0;
    color:#27190f;
    text-shadow:none;
  }
  .landing .landing-parchment p:last-child{margin-bottom:0}
  .landing .landing-parchment strong{font-weight:700;color:#23150e}
  .landing .landing-parchment .standout{color:#4b2d1a!important;font-weight:700!important}
  /* CTA links keep their semantic hrefs but use the exact three-state artwork
     as gameplay response buttons. */
  .landing a.entry-button{
    box-sizing:border-box;
    min-height:50px;
    border-style:solid;
    border-color:transparent;
    border-width:13px 34px 12px 34px;
    border-image-source:url('/ui-kit/buttons/button-normal-trim.png');
    border-image-slice:50 180 45 180 fill;
    border-image-width:13px 34px 12px 34px;
    border-image-repeat:stretch;
    border-radius:0;
    background:transparent;
    color:#25170e;
    padding:3px 9px;
    text-align:center;
    text-shadow:none;
    font:600 15px/1.35 var(--pall-font-reading,Georgia,serif);
  }
  .landing a.entry-button.primary,
  .landing a.entry-button.secondary{background:transparent;color:#25170e;border-color:transparent}
  .landing a.entry-button:hover,
  .landing a.entry-button.primary:hover{
    border-image-source:url('/ui-kit/buttons/button-hover-trim.png');
    background:transparent;
    color:#170d08;
  }
  .landing a.entry-button:active{
    border-image-source:url('/ui-kit/buttons/button-pressed-trim.png');
  }
  .landing a.entry-button:focus-visible{
    outline:2px solid #f0bf7c;outline-offset:3px;
  }
  @media(max-width:700px){
    .landing .landing-parchment{
      border-width:23px 25px 22px 25px;
      border-image-width:23px 25px 22px 25px;
      padding:10px 9px;
    }
  }
  @media(max-width:850px){
    .landing-split{grid-template-columns:1fr;gap:18px}
    .landing-media{height:clamp(245px,46vw,330px)}
    /* Text first for reading on narrow screens, without changing the alternating
       desktop rhythm or separating headings from their parchment paragraphs. */
    .landing-split .landing-copy{grid-row:1}
    .landing-split .landing-media{grid-row:2}
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