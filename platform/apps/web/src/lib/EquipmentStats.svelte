<script lang="ts">
 import type {EquipmentBonuses} from './inventory-types';
 import {measure} from './inventory-types';
 let {bonuses}:{bonuses:EquipmentBonuses}=$props();
</script>
<section class="equipment-bonuses" aria-label="Equipment-derived character stats">
 <h3>Equipment Stats</h3>
 <dl class="bonus-grid">
  <div><dt>Armor</dt><dd>{bonuses.armour}</dd></div>
  <div><dt>Damage</dt><dd>{bonuses.weaponDamage===null?'—':bonuses.weaponDamage}</dd></div>
  <div><dt>Pall Protection</dt><dd>{bonuses.pallProtection}</dd></div>
  <div><dt>Ash Protection</dt><dd>{bonuses.ashProtection}</dd></div>
  <div><dt>Max Weight</dt><dd>{measure(bonuses.maxWeightKg)} kg</dd></div>
  <div><dt>Inventory Slots</dt><dd>{bonuses.inventorySlots}</dd></div>
  <div><dt>Bag Volume</dt><dd>{measure(bonuses.maxVolumeL)} L</dd></div>
 </dl>
</section>
