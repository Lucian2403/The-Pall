<script lang="ts">
  import {page} from '$app/state';

  // Display only when a Stage 4 branch has reached the persisted DONE phase.
  // Navigation itself does not change the saved state or grant anything.
  const href=$derived('/characters/'+encodeURIComponent(page.params.id)+'/millhand/wage-claim');
</script>

<nav class="stage-next-step" aria-label="Next chapter">
  <p class="stage-next-step-label">NEXT STEP</p>
  <p class="stage-next-step-context">Your second job is complete. Continue towards home and face Flint's Wage Claim.</p>
  <a class="stage-next-step-link" {href}>Continue to The Wage Claim</a>
</nav>

<style>
  .stage-next-step{
    margin-top:14px;
    padding-top:12px;
    border-top:1px solid #bca482;
    color:#332316;
  }
  .stage-next-step-label{
    margin:0 0 7px;
    font:700 13px/1.25 var(--pall-font-label,'Arial Narrow',sans-serif);
    letter-spacing:.09em;
    color:#60402a;
  }
  .stage-next-step-context{
    margin:0 0 10px;
    font:15px/1.45 var(--pall-font-reading,Georgia,serif);
  }
  .stage-next-step-link{
    box-sizing:border-box;
    display:flex;
    align-items:center;
    justify-content:center;
    width:100%;
    min-height:47px;
    padding:7px 12px;
    text-align:center;
    color:#2d2016;
    text-decoration:none;
    font:700 16px/1.3 var(--pall-font-reading,Georgia,serif);
    background:transparent;
    border:solid transparent;
    border-width:10px 17px 9px;
    border-image-source:url('/ui-kit/buttons/button-normal-trim.png');
    border-image-slice:50 180 45 180 fill;
    border-image-width:10px 17px 9px;
    border-image-repeat:stretch;
  }
  .stage-next-step-link:hover{
    border-image-source:url('/ui-kit/buttons/button-hover-trim.png');
    color:#28190f;
  }
  .stage-next-step-link:focus-visible{
    border-image-source:url('/ui-kit/buttons/button-hover-trim.png');
    outline:2px solid #76512f;
    outline-offset:3px;
  }
  .stage-next-step-link:active{
    border-image-source:url('/ui-kit/buttons/button-pressed-trim.png');
  }
</style>
