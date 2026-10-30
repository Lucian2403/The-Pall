<script lang="ts">
  /**
   * One-at-a-time background-creation portrait selector.
   * Only the user's explicit arrow or portrait click selects an avatar;
   * otherwise the displayed first portrait is a preview, not a saved choice.
   * The shared AvatarPicker grid used on other pages stays untouched.
   */
  let {sex,selectedId=null,onSelect}:{
    sex:'Male'|'Female';
    selectedId?:string|null;
    onSelect:(id:string)=>void;
  }=$props();

  const choices=$derived(Array.from({length:8},(_,index)=>
    sex.toLowerCase()+'-'+String(index+1).padStart(2,'0')));
  let displayedIndex=$state(0);
  const current=$derived(choices[displayedIndex]);

  // Reset the viewed image on sex changes and follow externally updated choices.
  $effect(()=>{
    const found=choices.indexOf(selectedId??'');
    displayedIndex=found>=0?found:0;
  });

  function move(direction:-1|1){
    const next=(displayedIndex+direction+choices.length)%choices.length;
    displayedIndex=next;
    onSelect(choices[next]);
  }
</script>

<div class="portrait-carousel" role="group" aria-label={sex+' portrait choices'}>
  <button class="arrow" type="button"
    aria-label="Previous portrait" onclick={()=>move(-1)}>
    <span aria-hidden="true">‹</span>
  </button>
  <button class="portrait-choice" class:chosen={selectedId===current}
    type="button" aria-label={sex+' portrait '+(displayedIndex+1)+'. Select this portrait'}
    aria-pressed={selectedId===current} onclick={()=>onSelect(current)}>
    <img src={'/ui-kit/avatars/'+current+'.webp'} alt="" draggable="false"/>
  </button>
  <button class="arrow" type="button"
    aria-label="Next portrait" onclick={()=>move(1)}>
    <span aria-hidden="true">›</span>
  </button>
</div>
<p class="sr-only" aria-live="polite">
  {sex} portrait {displayedIndex+1} of {choices.length}{selectedId===current?', selected':', not yet selected'}.
</p>

<style>
  .portrait-carousel{
    display:grid;
    grid-template-columns:38px minmax(0,210px) 38px;
    align-items:center;
    justify-content:center;
    gap:7px;
    width:100%;
    margin:16px auto 13px;
  }
  button{cursor:pointer}
  .portrait-choice{
    min-width:0;
    width:100%;
    padding:0;
    aspect-ratio:4/5;
    border:3px solid #69503a;
    border-radius:0;
    background:#201b16;
    box-shadow:0 5px 15px #20170f64;
    overflow:hidden;
  }
  .portrait-choice.chosen{
    border-color:#bd874b;
    outline:2px solid #7d522b;
    outline-offset:2px;
  }
  .portrait-choice img{
    display:block;
    width:100%;
    height:100%;
    object-fit:cover;
    object-position:center 18%;
  }
  .arrow{
    display:grid;
    place-items:center;
    min-width:0;
    height:53px;
    padding:0;
    border-style:solid;
    border-color:transparent;
    border-width:10px 11px 9px;
    border-image-source:url('/ui-kit/buttons/button-normal-trim.png');
    border-image-slice:50 180 45 180 fill;
    border-image-width:10px 11px 9px;
    border-image-repeat:stretch;
    border-radius:0;
    background:transparent;
    color:#301e11;
    font:600 30px/1 Georgia,serif;
  }
  .arrow:hover{border-image-source:url('/ui-kit/buttons/button-hover-trim.png')}
  .arrow:active{border-image-source:url('/ui-kit/buttons/button-pressed-trim.png')}
  .arrow span{display:block;transform:translateY(-2px)}
  button:focus-visible{outline:3px solid #bb8248;outline-offset:4px}
  .sr-only{
    position:absolute;
    width:1px;
    height:1px;
    padding:0;
    margin:-1px;
    overflow:hidden;
    clip:rect(0,0,0,0);
    white-space:nowrap;
    border:0;
  }
  @media(max-width:420px){
    .portrait-carousel{grid-template-columns:35px minmax(0,200px) 35px;gap:5px}
    .arrow{height:46px;border-width:9px 10px 8px;border-image-width:9px 10px 8px}
  }
</style>
