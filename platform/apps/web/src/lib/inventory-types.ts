/** Read-only server projection. Game windows do not calculate item stats. */
export type EquipSlot='head'|'face'|'torso'|'hands'|'feet'|'back'
 |'primary_weapon'|'secondary_weapon'|'respiratory_filter'|'accessory_1'|'accessory_2';
export type Item={
 id:string;code:string;name:string;category:string;description:string;
 rarity:string;armour:number;carrySlotsBonus:number;
 equipSlot:EquipSlot|null;equipmentSlot:EquipSlot|null;
 quantity:number;stackable:boolean;maxStack:number;qualityTier:number;
 weightKg:number;volumeL:number;carryVolumeBonusL:number;
 currentDurability:number|null;maxDurability:number|null;designStatus:string;
};
export type Container={
 slotsUsed:number;maxSlots:number;weightKg:number;volumeL:number;
 maxWeightKg:number;maxVolumeL:number;overCapacity:boolean;items:Item[]
};
export type EquipmentBonuses={
 armour:number;weaponDamage:number|null;pallProtection:number;ashProtection:number;
 maxWeightKg:number;inventorySlots:number;maxVolumeL:number
};
export type InventorySnapshot={revision:number;storageEnabled:boolean;
 pack:Container;chest:Container;equipment:{items:Item[]};bonuses:EquipmentBonuses};
export type Place='pack'|'home_chest'|'equipped';
export const equipmentSlots:{id:EquipSlot;label:string;x:number;y:number}[]=[
 {id:'head',label:'Head',x:35,y:0},
 {id:'face',label:'Face',x:68,y:0},
 {id:'respiratory_filter',label:'Filter',x:2,y:0},
 {id:'hands',label:'Hands',x:2,y:24},
 {id:'torso',label:'Body',x:35,y:24},
 {id:'back',label:'Back / Bag',x:68,y:24},
 {id:'primary_weapon',label:'Primary',x:2,y:48},
 {id:'secondary_weapon',label:'Secondary',x:68,y:48},
 {id:'accessory_1',label:'Accessory I',x:2,y:72},
 {id:'feet',label:'Feet',x:35,y:72},
 {id:'accessory_2',label:'Accessory II',x:68,y:72}
];
export const measure=(value:number)=>value.toFixed(1);
export const titleCase=(value:string)=>value.replace(/_/g,' ')
 .replace(/\b\w/g,letter=>letter.toUpperCase());
export const itemImage=(item:Item)=>item.code==='basic_clothes'
 ?'/items/daily-worker-clothes.webp'
 :item.code==='crude_small_bag'?'/items/simple-bag.webp':null;
export const itemMark=(item:Item)=>item.code==='basic_clothes'?'WC'
 :item.code==='crude_small_bag'?'SB'
 :item.name.split(/\s+/).map(word=>word[0]).join('').slice(0,3).toUpperCase();
export const itemType=(item:Item)=>item.rarity+' '+titleCase(item.category);
export const itemBenefit=(item:Item)=>item.category==='clothing'
 ?item.armour+' Armour'
 :item.carrySlotsBonus>0?item.carrySlotsBonus+' Slots':null;
