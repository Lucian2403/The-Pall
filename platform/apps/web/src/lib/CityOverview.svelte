<script lang="ts">
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import {
        cityWalkingSeconds,
        activityRunning,
        type CityOverviewSnapshot,
        type CityPointOfInterest,
    } from "@the-pall/game-core";
    import CityMapViewport from "./CityMapViewport.svelte";
    import ActivityProgress from "./ActivityProgress.svelte";
    import {createActivitySync} from "./activity-sync";
    import { cityMapAssets as assets } from "./city-map-assets";
    import { createCityMapAudio } from "./city-map-audio";

    let {
        characterId,
        onReviewAnnouncement,
    }: { characterId: string; onReviewAnnouncement: () => void } = $props();
    let city = $state<CityOverviewSnapshot | null>(null),
        selectedId = $state(""),
        search = $state(""),
        directoryOpen = $state(false);
    let status = $state<"loading" | "ready" | "error">("loading"),
        errorMessage = $state(""),
        pending = $state(false);
    let time = $state(0),
        requestInFlight = $state(false);
    let clockBase = 0,
        clockAt = 0,
        disposed = false;
    let controller: AbortController | undefined;
    let activitySync:ReturnType<typeof createActivitySync>|undefined;
    let audio: ReturnType<typeof createCityMapAudio> | undefined;
    let failedIcons = $state<Record<string, boolean>>({});
    const base = $derived(
        "/api/characters/" +
            encodeURIComponent(characterId) +
            "/free-play/city",
    );
    const root = $derived("/characters/" + encodeURIComponent(characterId));
    const points = $derived(
        [...(city?.pointsOfInterest ?? [])].sort(
            (a, b) => a.displayOrder - b.displayOrder,
        ),
    );
    const filtered = $derived(
        points.filter((p) =>
            p.name.toLowerCase().includes(search.trim().toLowerCase()),
        ),
    );
    const selected = $derived(points.find((p) => p.id === selectedId));
    const activityBusy = $derived(activityRunning(city?.activity));
    const current = $derived(
        points.find((p) => p.id === city?.currentLocationId),
    );
    const travelDestination = $derived(
        points.find((p) => p.id === city?.journey?.destinationId),
    );
    const seconds = $derived(
        city && current && selected
            ? cityWalkingSeconds(
                  current.position,
                  selected.position,
                  city.config,
              )
            : 0,
    );
    const remaining = $derived(
        city?.journey
            ? Math.max(
                  0,
                  Math.ceil((Date.parse(city.journey.arrivesAt) - time) / 1000),
              )
            : 0,
    );
    const progress = $derived(
        city?.journey
            ? Math.max(
                  0,
                  Math.min(
                      100,
                      (100 * (time - Date.parse(city.journey.startedAt))) /
                          (Date.parse(city.journey.arrivesAt) -
                              Date.parse(city.journey.startedAt)),
                  ),
              )
            : 0,
    );
    function href(p: CityPointOfInterest | undefined) {
        return p?.availability === "available" &&
            p.destination &&
            /^[a-z0-9-]+(?:\/[a-z0-9-]+)*$/.test(p.destination)
            ? root + "/" + p.destination
            : null;
    }
    function select(id: string) {
        selectedId = id;
    }
    async function apply(snapshot: CityOverviewSnapshot) {
        const previous = city;
        clockBase = Date.parse(snapshot.serverNow);
        clockAt = performance.now();
        time = clockBase;
        const deadline=snapshot.journey?.arrivesAt??(activityRunning(snapshot.activity)?snapshot.activity?.endsAt:null);
        activitySync?.update(snapshot.serverNow,deadline);
        city = snapshot;
        status = "ready";
        errorMessage = "";
        if (
            !selectedId ||
            !snapshot.pointsOfInterest.some((p) => p.id === selectedId)
        )
            selectedId =
                snapshot.journey?.destinationId ?? snapshot.currentLocationId;
        audio?.set(snapshot.journey ? "walking" : "city");
        if (
            !snapshot.journey &&
            (snapshot.arrived ||
                (previous?.journey &&
                    snapshot.currentLocationId ===
                        previous.journey.destinationId))
        ) {
            const destination = href(
                snapshot.pointsOfInterest.find(
                    (p) => p.id === snapshot.currentLocationId,
                ),
            );
            if (destination && !disposed) {
                audio?.set(null);
                await goto(destination);
            }
        }
    }
    async function load():Promise<boolean> {
        if (requestInFlight || pending || disposed) return false;
        requestInFlight = true;
        controller = new AbortController();
        try {
            const response = await fetch(base, {
                cache: "no-store",
                signal: controller.signal,
            });
            if (
                !response.ok &&
                [401, 403, 404, 409].includes(response.status)
            ) {
                city = null;
                activitySync?.update(undefined,null);
                audio?.set(null);
            }
            if (!response.ok)
                throw Error(
                    response.status === 503
                        ? "City database update required: npm run city-travel:migrate"
                        : response.status === 409
                          ? "City access has changed. Reopen the city overview."
                          : "City destinations could not be loaded.",
                );
            const snapshot = (await response.json()) as CityOverviewSnapshot;
            if (disposed) return false;
            if (
                snapshot.cityId !== "grand-cylinder-city" ||
                !Array.isArray(snapshot.pointsOfInterest) ||
                !snapshot.config ||
                !snapshot.serverNow
            )
                throw Error("City data unavailable");
            await apply(snapshot);
            return true;
        } catch (error) {
            if (!disposed) {
                errorMessage =
                    error instanceof Error
                        ? error.message
                        : "City destinations could not be loaded.";
                status = city ? "ready" : "error";
            }
            return false;
        } finally {
            requestInFlight = false;
        }
    }
    async function walk() {
        if (
            !city ||
            !selected ||
            selected.availability !== "available" ||
            city.journey ||
            pending ||
            requestInFlight
        )
            return;
        if (selected.id === city.currentLocationId) {
            const destination = href(selected);
            if (destination) await goto(destination);
            return;
        }
        if (activityBusy) return;
        pending = true;
        errorMessage = "";
        controller = new AbortController();
        try {
            const response = await fetch(base + "/travel", {
                method: "POST",
                headers: { "content-type": "application/json" },
                signal: controller.signal,
                body: JSON.stringify({
                    destinationId: selected.id,
                    expectedRevision: city.revision,
                    requestId: crypto.randomUUID(),
                }),
            });
            if (!response.ok) {
                const result = await response.json().catch(() => ({}));
                throw Error(
                    result.error === "travel_in_progress"
                        ? "Travel is already in progress."
                        : result.error === "activity_in_progress"
                          ? "An activity is already in progress."
                          : result.error === "destination_unavailable"
                          ? "Destination unavailable."
                          : "Travel request could not be confirmed.",
                );
            }
            const snapshot = (await response.json()) as CityOverviewSnapshot;
            if (!disposed) await apply(snapshot);
        } catch (error) {
            if (!disposed)
                errorMessage =
                    error instanceof Error
                        ? error.message
                        : "Connection interrupted.";
        } finally {
            pending = false;
        }
    }
    onMount(() => {
        audio = createCityMapAudio();
        void load();
        activitySync=createActivitySync(load);
        const timer = window.setInterval(() => {
            if (city?.journey) time = clockBase + performance.now() - clockAt;
        }, 250);
        return () => {
            disposed = true;
            controller?.abort();
            clearInterval(timer);
            activitySync?.dispose();
            audio?.dispose();
        };
    });
</script>

{#snippet poiIcon(p: CityPointOfInterest)}
    {#if assets.useFinalIcons && !failedIcons[p.id]}<img
            class="poi-icon"
            src={p.icon}
            alt=""
            onerror={() => {
                failedIcons = { ...failedIcons, [p.id]: true };
            }}
        />
    {:else}<span class="poi-icon symbol" aria-hidden="true">{p.symbol}</span
        >{/if}
{/snippet}
<main class="city-workspace" aria-labelledby="city-overview-title">
    <header class="heading">
        <h1 id="city-overview-title">City Map</h1>
        <p>Grand Cylinder City — Key locations within a short walk.</p>
    </header>
    {#if status === "loading"}<p role="status">Loading city destinations…</p>
    {:else if status === "error"}<p role="alert">{errorMessage}</p>
        <button
            type="button"
            onclick={() => {
                void load();
            }}>Retry</button
        >
    {:else if city}
        <div class="workspace">
            <aside
                class="directory panel"
                class:expanded={directoryOpen}
                aria-label="Location directory"
            >
                <button
                    class="directory-toggle"
                    type="button"
                    aria-expanded={directoryOpen}
                    onclick={() => {
                        directoryOpen = !directoryOpen;
                    }}
                    >Locations ({points.length}) {directoryOpen
                        ? "−"
                        : "+"}</button
                >
                <div class="directory-body">
                    <label class="search"
                        ><span class="visually-hidden">Search locations</span
                        ><svg
                            class="search-icon"
                            viewBox="0 0 20 20"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="1.8"
                            aria-hidden="true"
                            ><circle cx="8" cy="8" r="5.3" /><path
                                d="m12 12 5 5"
                            /></svg
                        ><input
                            type="search"
                            bind:value={search}
                            placeholder="Search location…"
                        /></label
                    >
                    <nav aria-label="City points of interest">
                        {#each filtered as point (point.id)}
                            <button
                                type="button"
                                class="directory-item"
                                class:selected={point.id === selectedId}
                                aria-pressed={point.id === selectedId}
                                onclick={() => select(point.id)}
                            >
                                {@render poiIcon(point)}<span
                                    class="location-name">{point.name}</span
                                >
                                {#if point.id === city.currentLocationId}<small
                                        class="current-badge"
                                        >Current location</small
                                    >
                                {:else if point.id === city.journey?.destinationId}<small
                                        >Walking</small
                                    >
                                {:else if point.availability === "unavailable"}<small
                                        >Unavailable</small
                                    >{/if}
                            </button>
                        {:else}<p class="no-results">
                                No matching locations.
                            </p>{/each}
                    </nav>
                </div>
            </aside>
            <CityMapViewport
                {points}
                width={city.config.width}
                height={city.config.height}
                {selectedId}
                currentId={city.currentLocationId}
                travelId={city.journey?.destinationId ?? null}
                onSelect={select}
            />
            <aside class="details panel" aria-label="Selected location">
                {#if city.activity&&activityBusy}
                    <div class="journey"><ActivityProgress activity={city.activity} serverNow={city.serverNow}/><p>Travel is unavailable during this activity.</p></div>
                {/if}
                {#if city.journey}
                    <div class="journey" role="status">
                        <strong
                            >Walking to {travelDestination?.name ??
                                "destination"}</strong
                        >
                        <p>{remaining} sec remaining</p>
                        <progress
                            max="100"
                            value={progress}
                            aria-label="Journey progress"
                        ></progress>
                    </div>
                {/if}
                {#if selected}
                    <h2>{@render poiIcon(selected)}{selected.name}</h2>
                    <p><strong>{selected.description}</strong></p>
                    <p class="walking-time">
                        {selected.id === city.currentLocationId
                            ? "Current location"
                            : seconds + " sec walk"}
                    </p>
                    {#if selected.availability === "unavailable"}<p
                            class="availability"
                        >
                            Unavailable — scene not implemented.
                        </p>{/if}
                    <button
                        type="button"
                        class="walk pall-framed-button"
                        disabled={pending ||
                            requestInFlight ||
                            !!city.journey ||
                            (activityBusy && selected.id !== city.currentLocationId) ||
                            selected.availability !== "available"}
                        onclick={() => {
                            void walk();
                        }}
                    >
                        {pending
                            ? "Starting…"
                            : selected.id === city.currentLocationId
                              ? "Enter location"
                              : "Walk there"}
                    </button>
                    <p class="hint">
                        Selecting a location does not start travel. Use “Walk
                        there” to move to it.
                    </p>
                {/if}
                {#if errorMessage}<p role="alert">{errorMessage}</p>
                    <button
                        type="button"
                        onclick={() => {
                            void load();
                        }}>Retry</button
                    >{/if}
            </aside>
        </div>
    {/if}
    <footer class="city-footer">
        <button class="review" type="button" onclick={onReviewAnnouncement}
            >Review announcement</button
        >
    </footer>
</main>

<style>
    .city-workspace {
        --city-paper: url("/ui-kit/city/parchment-grain.svg");
        --city-frame: url("/ui-kit/city/engraved-frame.svg");
        --city-ink: #332012;
        box-sizing: border-box;
        min-width: 0;
        flex: 1;
        container-type: inline-size;
        padding: clamp(8px, 1.1vw, 18px);
        color: var(--city-ink);
        border: 12px solid transparent;
        border-image: var(--city-frame) 24 stretch;
        background:
            var(--city-paper) repeat,
            radial-gradient(
                ellipse at 45% 32%,
                #f5dfb4 8%,
                #ecd0a0 57%,
                #b99160 100%
            );
        background-clip: padding-box;
        box-shadow: inset 0 0 34px #78512655;
        font-family: var(--pall-font-reading, Georgia, serif);
        text-shadow: none;
    }
    .heading {
        display: flex;
        align-items: baseline;
        gap: clamp(12px, 1.4vw, 24px);
        margin: 0 0 14px;
        flex-wrap: wrap;
    }
    h1 {
        font-size: clamp(30px, 3.2vw, 48px);
        margin: 0;
        line-height: 1.08;
        font-weight: 700;
        letter-spacing: -0.025em;
    }
    .heading p {
        margin: 0;
        font-style: italic;
        font-size: clamp(14px, 1.15vw, 18px);
        line-height: 1.35;
    }
    .workspace {
        display: grid;
        grid-template-columns: minmax(190px, 20fr) minmax(0, 55fr) minmax(
                210px,
                23fr
            );
        gap: 10px;
        align-items: stretch;
        height: clamp(480px, calc(100dvh - 220px), 900px);
        min-width: 0;
    }
    .panel {
        box-sizing: border-box;
        min-width: 0;
        min-height: 0;
        border: 9px solid transparent;
        border-image: var(--city-frame) 24 stretch;
        background:
            var(--city-paper) repeat,
            linear-gradient(135deg, #f2dcb4b0, #e7c48c88);
        background-clip: padding-box;
        box-shadow: inset 0 0 20px #94683e25;
    }
    .directory {
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }
    .directory-body {
        display: flex;
        flex: 1;
        min-height: 0;
        flex-direction: column;
    }
    .search {
        box-sizing: border-box;
        flex: none;
        margin: 1px 4px 8px;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 7px 9px;
        min-height: 38px;
        border: 1px solid #8f6a42;
        border-radius: 4px;
        box-shadow: inset 0 1px 3px #69472318;
        background: #f7e6c133;
    }
    .search-icon {
        width: 18px;
        height: 18px;
        flex: none;
        color: #372414;
    }
    .search input {
        width: 100%;
        min-width: 0;
        color: var(--city-ink);
        border: 0;
        background: transparent;
        font: 400 15px/1.3 var(--pall-font-reading, Georgia, serif);
    }
    .search input::placeholder {
        color: #80694c;
        opacity: 1;
    }
    .directory nav {
        flex: 1;
        min-height: 0;
        overflow-y: auto;
        overflow-x: hidden;
        scrollbar-width: thin;
        scrollbar-color: #ac8759 #edcea0;
        overscroll-behavior: contain;
    }
    .directory-item {
        position: relative;
        box-sizing: border-box;
        width: 100%;
        min-height: 46px;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 7px 9px;
        text-align: left;
        border: 1px solid transparent;
        border-top-color: #b99a6d99;
        color: inherit;
        background: transparent;
        font: 700 15px/1.2 var(--pall-font-reading, Georgia, serif);
        cursor: pointer;
        flex-wrap: nowrap;
    }
    .directory-item:last-child {
        border-bottom-color: #b99a6d99;
    }
    .directory-item.selected {
        z-index: 1;
        background: linear-gradient(100deg, #70461f, #3e2916 75%, #67431d);
        color: #fff0cd;
        border: 1px solid #f0b94f;
        border-radius: 3px;
        box-shadow:
            inset 0 0 0 1px #ffe2a583,
            inset 0 0 11px #e8a43b55,
            0 0 5px #ae692b99;
    }
    .directory-item.selected::before,
    .directory-item.selected::after {
        content: "";
        position: absolute;
        width: 7px;
        height: 7px;
        border: 1px solid #ffe5a4;
        pointer-events: none;
    }
    .directory-item.selected::before {
        left: 2px;
        top: 2px;
        border-right: 0;
        border-bottom: 0;
    }
    .directory-item.selected::after {
        right: 2px;
        bottom: 2px;
        border-left: 0;
        border-top: 0;
    }
    .directory-item:hover:not(.selected) {
        background: #b3894b27;
    }
    .location-name {
        flex: 1;
        min-width: 0;
        overflow-wrap: anywhere;
    }
    .directory-item small {
        flex: none;
        font: 400 11px/1.2 var(--pall-font-reading, Georgia, serif);
        color: #67492d;
    }
    .directory-item.selected small {
        color: #f5dfb3;
    }
    .current-badge {
        background: linear-gradient(#6b4a25, #493018);
        color: #fff2ce !important;
        padding: 3px 5px;
        border: 1px solid #d0a052;
        border-radius: 4px;
        white-space: nowrap;
    }
    .poi-icon {
        width: 22px;
        height: 22px;
        object-fit: contain;
        flex: none;
    }
    img.poi-icon {
        filter: brightness(0.57) sepia(0.35) saturate(1.25);
    }
    .directory-item.selected img.poi-icon {
        filter: brightness(1.35) saturate(0.85);
    }
    .symbol {
        display: inline-grid;
        place-items: center;
        font:
            700 21px Georgia,
            serif;
    }
    .details {
        padding: clamp(10px, 1.45vw, 22px);
        overflow: auto;
        overflow-wrap: anywhere;
        scrollbar-width: thin;
        scrollbar-color: #ac8759 #edcea0;
    }
    .details h2 {
        display: flex;
        align-items: center;
        gap: 9px;
        margin: 5px 0 20px;
        font-size: clamp(24px, 2.35vw, 36px);
        font-weight: 700;
        line-height: 1.13;
        border-bottom: 1px solid #8a603a;
        padding-bottom: 15px;
    }
    .details h2 .poi-icon {
        width: 24px;
        height: 24px;
    }
    .details p {
        font-size: 16px;
        line-height: 1.55;
        margin: 0 0 16px;
    }
    .details .walking-time {
        font-size: 17px;
        font-weight: 700;
        margin: 24px 0;
    }
    .details .availability {
        font-size: 14px;
        color: #68472c;
        margin-bottom: 12px;
    }
    .walk {
        display: flex;
        box-sizing: border-box;
        width: 100%;
        min-width: 0;
        max-width: 100%;
        min-height: 52px;
        margin: 18px 0;
        color: #362417;
        cursor: pointer;
        font-size: 19px;
        padding-inline: 6px;
        border-left-width: clamp(18px, 2vw, 34px);
        border-right-width: clamp(18px, 2vw, 34px);
    }
    .walk:disabled {
        opacity: 0.68;
        cursor: not-allowed;
    }
    .details .hint {
        border-top: 1px solid #98734d;
        padding-top: 13px;
        font-size: 14px;
        line-height: 1.45;
    }
    .journey {
        background: #624728;
        color: #f6e4bf;
        padding: 12px;
        margin-bottom: 12px;
    }
    .journey progress {
        width: 100%;
        accent-color: #bd913f;
    }
    .city-footer {
        display: flex;
        justify-content: flex-end;
        min-width: 0;
        margin-top: 9px;
    }
    .review {
        background: transparent;
        color: #624526;
        border: 0;
        border-bottom: 1px solid #9a774d;
        padding: 5px 2px;
        min-height: 30px;
        cursor: pointer;
        font: 400 13px var(--pall-font-reading, Georgia, serif);
    }
    .directory-toggle {
        display: none;
    }
    .no-results {
        padding: 10px;
    }
    .visually-hidden {
        position: absolute;
        clip: rect(0, 0, 0, 0);
        width: 1px;
        height: 1px;
        overflow: hidden;
    }
    button:focus-visible,
    input:focus-visible {
        outline: 2px solid #a26112;
        outline-offset: -2px;
    }
    @container (max-width:1000px) {
        .workspace {
            grid-template-columns: minmax(176px, 1fr) minmax(0, 2.4fr);
            height: auto;
        }
        .directory {
            height: clamp(420px, 60dvh, 680px);
        }
        .details {
            grid-column: 1/-1;
            max-height: none;
        }
    }
    @container (max-width:620px) {
        .heading {
            gap: 5px;
            margin-bottom: 10px;
        }
        .heading p {
            font-size: 13px;
        }
        .workspace {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        .directory {
            height: auto;
            order: 0;
        }
        .directory-toggle {
            display: block;
            min-height: 44px;
            color: var(--city-ink);
            background: transparent;
            border: 0;
            font: 700 16px var(--pall-font-reading, Georgia, serif);
            cursor: pointer;
        }
        .directory:not(.expanded) .directory-body {
            display: none;
        }
        .directory nav {
            max-height: 245px;
        }
        .details {
            order: 2;
        }
        .details h2 {
            font-size: 25px;
        }
        .details p {
            font-size: 15px;
        }
    }
    @media (max-width: 650px) {
        .city-workspace {
            border-width: 7px;
            padding: 7px;
        }
    }
</style>
