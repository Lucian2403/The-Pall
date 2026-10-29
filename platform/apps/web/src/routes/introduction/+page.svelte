<script lang="ts">
  import {onMount} from 'svelte';
  import '$lib/pall-owner-ui.css';
  import '$lib/pall-entry-pages.css';
  import {APPROVED_WORLD_INTRO} from '$lib/approved-introductions';

  // The canonical world introduction is publicly readable. Only choosing
  // characters requires authentication; replaying lore never mutates progress.
  let signedIn=$state(false);
  onMount(()=>{void (async()=>{
    try{
      const response=await fetch('/api/me',{cache:'no-store'});
      signedIn=response.ok;
    }catch{signedIn=false;}
  })();});
</script>
<svelte:head>
  <title>The Pall — World Introduction</title>
  <meta name="description" content="Enter the world of The Pall and Grand Cylinder City." />
</svelte:head>
<div class="entry-page introduction-page">
  <div class="entry-wrap">
    <!-- Shared city panorama and gradient unite the navigation with the title. -->
    <div class="introduction-masthead">
      <nav class="entry-nav" aria-label="Page navigation">
        <a href="/" class="brand" aria-label="The Pall, home">
          <img src="/ui-kit/branding/logo-compact.png" alt="The Pall"/>
        </a>
        <div class="entry-links">
          <a href="/">Home</a>
          <a href="/characters">Characters</a>
          <a href="/account">Account</a>
        </div>
      </nav>
      <header class="entry-hero">
        <div>
          <span class="entry-eyebrow">Grand Cylinder City</span>
          <h1>{APPROVED_WORLD_INTRO.heading}</h1>
        </div>
      </header>
    </div>
    <main class="entry-content introduction-content">
      <article class="intro-manuscript" aria-label="World introduction">
        <span class="entry-eyebrow">The world beyond the walls</span>
        <div class="lore">
        {#each APPROVED_WORLD_INTRO.paragraphs as paragraph,i}
          <p class:ending={i>=APPROVED_WORLD_INTRO.paragraphs.length-2}>
            {#each paragraph as segment}
              {#if segment.style==='strong'}<strong>{segment.text}</strong>
              {:else if segment.style==='em'}<em>{segment.text}</em>
              {:else}{segment.text}{/if}
            {/each}
          </p>
        {/each}
        </div>
      </article>
      <nav class="continue" aria-label="Continue introduction">
        {#if signedIn}
          <a class="entry-button" href="/characters">Continue to character selection</a>
          <a href="/backgrounds">Choose a background</a>
        {:else}
          <a class="entry-button" href="/account?mode=register">Create account to play</a>
          <a href="/account">Sign in</a>
        {/if}
      </nav>
    </main>
  </div>
</div>
<style>
  /* The owner's accepted homepage/account visual language, scoped to /introduction. */
  .introduction-page{padding-top:13px}
  .introduction-page .entry-wrap{max-width:1160px}
  .introduction-masthead{
    position:relative;
    isolation:isolate;
    overflow:hidden;
    border:1px solid #745538;
    background:#24201b url('/ui-kit/resources/TheCityVista.png') center 31%/cover no-repeat;
  }
  .introduction-masthead::before{
    content:'';
    position:absolute;
    inset:0;
    z-index:0;
    pointer-events:none;
    background:
      linear-gradient(90deg,#15120fec 0%,#15120fc6 27%,#15120f37 67%,transparent 100%),
      linear-gradient(180deg,#100e0cbd 0%,#100e0c55 25%,transparent 58%);
  }
  .introduction-page .entry-nav{
    position:relative;
    z-index:1;
    flex-wrap:wrap;
    gap:12px;
    padding:10px clamp(14px,2.4vw,30px) 12px;
    border:0;
    background:transparent;
  }
  .introduction-page .entry-nav .brand img{
    display:block;
    width:clamp(174px,17vw,228px);
    max-height:118px;
    height:auto;
    object-fit:contain;
    filter:drop-shadow(0 2px 5px #0b0807cc);
  }
  .introduction-page .entry-links{
    justify-content:flex-end;
    gap:clamp(5px,.7vw,10px);
  }
  /* The button artwork is the same owner-supplied set used on /account. */
  .introduction-page .entry-links a,
  .introduction-page .continue a{
    display:inline-flex;
    align-items:center;
    justify-content:center;
    border-style:solid;
    border-color:transparent;
    border-image-source:url('/ui-kit/buttons/button-normal-trim.png');
    border-image-slice:50 180 45 180 fill;
    border-image-repeat:stretch;
    border-radius:0;
    background:transparent;
    color:#25170e;
    font:600 15px/1.3 var(--pall-font-reading,Georgia,serif);
    text-align:center;
    text-decoration:none;
    text-shadow:none;
    cursor:pointer;
  }
  .introduction-page .entry-links a{
    min-height:42px;
    padding:2px 5px;
    border-width:10px 21px 9px;
    border-image-width:10px 21px 9px;
    white-space:nowrap;
  }
  .introduction-page .entry-links a:hover,
  .introduction-page .continue a:hover{
    border-image-source:url('/ui-kit/buttons/button-hover-trim.png');
    color:#170d08;
    background:transparent;
    text-decoration:none;
  }
  .introduction-page .entry-links a:active,
  .introduction-page .continue a:active{
    border-image-source:url('/ui-kit/buttons/button-pressed-trim.png');
  }
  .introduction-page .entry-links a:focus-visible,
  .introduction-page .continue a:focus-visible{
    outline:2px solid #f0bf7c;
    outline-offset:3px;
  }
  .introduction-page .entry-hero{
    position:relative;
    z-index:1;
    display:flex;
    align-items:flex-end;
    min-height:clamp(190px,20vw,230px);
    border:0;
    padding:clamp(24px,3vw,40px);
    background:transparent;
  }
  .introduction-page .entry-hero::after{
    content:'';
    position:absolute;
    inset:0;
    z-index:0;
    pointer-events:none;
    background:linear-gradient(0deg,#15120fc9,transparent 67%);
  }
  .introduction-page .entry-hero > div{position:relative;z-index:1}
  .introduction-page .entry-hero h1{
    margin:8px 0 0;
    font:600 clamp(34px,4vw,54px)/1.13 var(--pall-font-reading,Georgia,serif);
    letter-spacing:-.02em;
    color:#f7e5cd;
  }
  .introduction-page .introduction-content{
    padding:clamp(20px,3.2vw,43px);
    border:1px solid #59452f;
    border-top:0;
    background:radial-gradient(ellipse at 52% 0%,#30271d 0%,#1b1916 75%);
  }
  /* Keep all canonical paragraphs in one readable parchment manuscript. */
  .introduction-page .intro-manuscript{
    max-width:900px;
    margin:0 auto;
    min-width:0;
    border-style:solid;
    border-color:transparent;
    border-width:27px 31px 25px;
    border-image-source:url('/ui-kit/frames/dialogue-frame-trim.png');
    border-image-slice:145 190 125 190 fill;
    border-image-width:27px 31px 25px;
    border-image-repeat:stretch;
    border-radius:0;
    background:transparent;
    box-shadow:0 8px 22px #0007;
    padding:clamp(15px,2.5vw,27px) clamp(13px,3.4vw,38px);
    color:#2b1b10;
  }
  .introduction-page .intro-manuscript .entry-eyebrow{
    color:#654027;
    font-weight:700;
  }
  .introduction-page .lore{
    max-width:73ch;
    margin:20px auto 4px;
    font:400 clamp(17px,1.5vw,19px)/1.73 Georgia,'Times New Roman',serif;
    color:#2b1d13;
  }
  .introduction-page .lore p{margin:0 0 1.16em}
  .introduction-page .lore p:last-child{margin-bottom:0}
  .introduction-page .lore strong{font-weight:700;color:#24150d}
  .introduction-page .lore p.ending{
    color:#352012;
    font-weight:600;
  }
  .introduction-page .continue{
    max-width:900px;
    margin:24px auto 4px;
    padding-top:18px;
    border-top:1px solid #705239;
    display:flex;
    align-items:center;
    justify-content:flex-start;
    gap:10px;
    flex-wrap:wrap;
  }
  .introduction-page .continue a{
    min-height:49px;
    padding:3px 10px;
    border-width:12px 29px 11px;
    border-image-width:12px 29px 11px;
    max-width:100%;
  }
  @media(max-width:750px){
    .introduction-page .entry-nav{padding:8px 13px 10px}
    .introduction-page .entry-links{width:100%;justify-content:flex-start;gap:5px 8px}
    .introduction-page .entry-links a{
      min-height:37px;
      padding:1px 3px;
      border-width:8px 17px;
      border-image-width:8px 17px;
      font-size:14px;
    }
    .introduction-page .entry-nav .brand img{width:clamp(162px,35vw,205px);max-height:110px}
    .introduction-masthead{background-position:55% 31%}
    .introduction-masthead::before{
      background:
        linear-gradient(180deg,#15120fdb 0%,#15120f70 38%,transparent 72%),
        linear-gradient(90deg,#15120fd9,#15120f22 100%);
    }
    .introduction-page .entry-hero{min-height:190px;padding:23px 21px}
  }
  @media(max-width:420px){
    .introduction-page{padding:9px}
    .introduction-page .introduction-content{padding:12px}
    .introduction-page .intro-manuscript{
      border-width:23px 25px 22px;
      border-image-width:23px 25px 22px;
      padding:10px 8px 14px;
    }
    .introduction-page .lore{font-size:17px;line-height:1.65}
    .introduction-page .continue{gap:8px}
    .introduction-page .continue a{
      flex:1 1 100%;
      min-height:43px;
      padding:2px 5px;
      border-width:10px 23px 9px;
      border-image-width:10px 23px 9px;
    }
  }
</style>