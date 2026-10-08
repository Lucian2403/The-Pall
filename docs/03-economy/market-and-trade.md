# Market and Trade

Status: PROVISIONAL foundation.

## Core market model

The main city uses fixed-price buy and sell orders. There is no auction bidding.

- Sell order: seller posts quantity and unit price.
- Buy order: buyer escrows coins and posts quantity and unit price.
- Buyers may immediately purchase from existing sell orders.
- Sellers may immediately sell into existing buy orders.
- Matching/fulfilment follows price priority and then time priority where relevant.

## Market access and Commerce

The market is core game infrastructure and should not require Commerce 15 to participate.

All players who complete the basic city introduction should be able to:
- browse the market;
- buy from sell orders;
- sell into buy orders;
- create basic sell orders;
- create basic buy orders.

Commerce improves market capability rather than granting basic permission.

Possible Commerce benefits:
- modestly more active orders;
- slightly lower listing/sale fees;
- longer order durations;
- richer price history;
- better volume/liquidity information;
- margin/spread calculations;
- personal profit/loss reporting;
- bulk listing/management tools;
- later, limited remote market management or alerts.

Important market functionality must not become unusable to non-merchants.

### Fee principle

Commerce may reduce fees modestly but never to zero.

Illustrative direction only:
- base listing fee around 0.5%;
- base sales tax around 2%;
- highly skilled Commerce may reduce these somewhat, e.g. toward 0.25% and 1.5%.

Exact values are balance data.

## Hybrid commodity/equipment market

### Fungible commodities

Resources, processed materials, common components, consumables and other truly interchangeable goods use a standard order book.

Examples:
- Coal
- Iron Ingots
- Copper Wire
- Yarrow
- Bandages
- common ammunition
- standard filters where instances are mechanically identical

Orders show:
- unit price;
- quantity;
- location;
- seller/buyer where appropriate;
- market depth;
- trade history according to Commerce visibility.

### Serialized equipment

Equipment with individual state is sold as serialized item instances.

A listing should expose the properties that materially change what the buyer receives, such as:
- item name/model;
- quality tier;
- current durability / current maximum durability;
- installed fittings;
- maintenance state if relevant at sale;
- important modifiers/resistances;
- crafted-by provenance where applicable;
- repair history or permanent max-durability loss where relevant.

Example:
**Well-made Long Rifle**
- Durability: 82 / 110
- Sight: Standard Sight
- Sling: Fine Sling
- Crafted by: Rook & Sons
- Current max durability reflects previous major repairs

The purpose is not decorative clutter; buyers must understand why two rifles with the same base item_id may have different value.

## Bulk equipment listings

Non-fungible equipment can still be sold in quantity.

A seller or guild may create a grouped/bulk listing containing many serialized instances when the instances meet compatible grouping rules.

Recommended grouping keys:
- same base item_id;
- same quality tier;
- same fitting configuration;
- same current maximum durability class/profile where important;
- same seller and unit price.

The market UI may display:
**Well-made Long Rifle — 30 available**

Expanding the listing reveals the exact individual instances, including current durability and provenance.

Buyers can:
- inspect/select a particular unit;
- purchase multiple units;
- use a quick-buy option where the server clearly defines which instances are allocated.

Grouping is a UI convenience. The underlying rifles remain separate item instances.

A future guild/organization warehouse may allow authorized quartermasters to list guild-owned stock directly. This should not bypass market taxes or item-instance rules.

## Direct player trade

Direct trade requires both players to be in the same local world location.

The exact world topology (tile/node/location) is not yet locked, so the rule should be implemented generically as **same local trade location** rather than hard-coded to a specific map model.

Trade flow:
1. both players open a trade;
2. each adds items and/or coins;
3. both lock their side;
4. any change by either player unlocks both sides;
5. both confirm the final locked trade;
6. server validates ownership/capacity/state and atomically exchanges assets.

This is similar to established locked two-party trade systems and prevents last-second substitution.

## Crafting contracts

Crafting contracts let customers hire specialists without trust-based item handoffs.

Core fields:
- requested item;
- quantity;
- minimum acceptable quality;
- required/forbidden fittings if relevant;
- who supplies materials;
- payment;
- deadline;
- optional crafter requirements;
- failure terms.

### Example A — customer supplies materials

**Commission: Fine Field Respirator**
- Quantity: 1
- Minimum quality: Fine
- Customer supplies:
  - Fine Seal Assembly x1
  - Treated Glass x2
  - Pall Membrane x2
  - Brass Fittings x4
- Crafter supplies: ordinary consumables/fuel
- Payment: 1,400 coins
- Deadline: 12 hours

Materials and payment are escrowed by the server.

If the result meets the contract, the finished item goes to the customer and payment goes to the crafter.

If the result fails the minimum-quality condition, the contract rules determine whether the customer receives the downgraded result and the crafter forfeits payment. More advanced warranty/collateral terms can be added later.

### Example B — crafter supplies everything

**Order: Standard Repair Kits**
- Quantity: 20
- Minimum quality: Standard
- Crafter supplies all materials
- Payment: 1,800 coins
- Deadline: 24 hours

This behaves more like a production order.

### Example C — rare-material commission

**Commission: Well-made Pall Survey Coat**
- Customer supplies rare Pall membrane and expedition cloth.
- Crafter supplies common fittings, thread and sealant.
- Minimum quality: Well-made.
- Payment: 3,000 coins.

This is useful when the customer owns rare expedition materials but lacks the specialization/facility to use them.

### Example D — fitting commission

**Commission: Fine Reinforced Respirator Seal**
- Quantity: 2
- Customer supplies nothing.
- Minimum quality: Fine.
- Payment: 900 coins each.

The crafter can fulfill one or both depending on contract structure.

## Delivery contracts

Delivery contracts should eventually exist for both players and NPC/institutional issuers.

### Player delivery contract

A player can post:
- pickup location;
- destination;
- cargo;
- payment;
- deadline;
- optional collateral.

Example:
**Move 300 Coal**
- Pick up: Grand Cylinder City warehouse
- Deliver: East Marches depot
- Payment: 700 coins
- Deadline: 6 hours
- Collateral: 1,500 coins

This creates a genuine merchant/hauler profession.

### NPC/institutional delivery contract

NPC organizations can seed logistics gameplay and provide dependable work when player demand is thin.

Examples:
- Physicians' College needs medicine delivered to an expedition camp.
- Municipal Works needs timber moved to a rail repair site.
- Frontier caravan pays for filters and food delivered before departure.

Player contracts should remain the richer long-term system.

## Civic demand placement

Background civic demand should not masquerade as ordinary player buy orders.

It should appear on a separate city interface such as:
- Civic Requisitions Board;
- Institutional Orders;
- Municipal Contracts.

This keeps economic stabilization transparent and preserves the meaning of the player order book.

Examples:
- Municipal Fuel Office buying Coal;
- Physicians' Stores buying Bandages;
- Foundry Consortium buying Steel Plates.

Quotas, baseline prices and event-driven demand remain controlled by the economic system.

## Price history and Commerce

Price information should scale with Commerce skill.

Everyone sees enough information to trade safely:
- current best buy;
- current best sell;
- recent rough price;
- available quantity.

Higher Commerce may reveal progressively richer intelligence:
- longer historical timeline;
- daily/weekly volume;
- high/low/average/median;
- bid/ask spread;
- moving averages;
- volatility;
- personal realized profit/loss;
- regional/frontier comparison later;
- alerts/watchlists later.

Commerce should improve information and efficiency rather than create secret prices inaccessible to ordinary players.
