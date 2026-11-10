<script lang="ts">
  import {RECEIVING_BOOK_HOTSPOT} from '$lib/hauling-scenes';
  /** The ledger is painted into the reusable Municipal Receiving Desk.
   * Only its hit area and framed object label belong to this component.
   * Caller decides what checking a book means for its particular job.
   */
  let {onInspect,disabled=false,label='Receiving book'}:{
    onInspect:()=>void;disabled?:boolean;label?:string
  }=$props();
</script>

<button type="button" class="receiving-book-hotspot" data-workshop-object
  data-pall-sfx="paper" {disabled}
  style:left={RECEIVING_BOOK_HOTSPOT.left}
  style:top={RECEIVING_BOOK_HOTSPOT.top}
  style:width={RECEIVING_BOOK_HOTSPOT.width}
  style:height={RECEIVING_BOOK_HOTSPOT.height}
  aria-label={'Check '+label.toLowerCase()} title={'Check '+label.toLowerCase()}
  onclick={onInspect}>
  <span class="workshop-object-label">{label}</span>
</button>

<style>
  .receiving-book-hotspot{position:absolute;z-index:5;display:flex;
    align-items:flex-end;justify-content:center;padding:0;border:0;
    background:transparent;color:#f0dec4;cursor:pointer}
  .receiving-book-hotspot:disabled{cursor:wait;opacity:.6}
  .receiving-book-hotspot:focus-visible{outline:2px solid #f2d39b;outline-offset:2px}
  .receiving-book-hotspot:hover:not(:disabled){background:#ebc5851b}
  .receiving-book-hotspot :global(.workshop-object-label){pointer-events:none}
</style>
