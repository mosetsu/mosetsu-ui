<script lang="ts">
    import { fly } from 'svelte/transition';

    export let visible: boolean = false;


</script>

{#if visible}
<div class="absolute bottom-16 flex gap-8 self-center rounded-md bg-gray-800 px-6 py-4" transition:fly={{ y: 64, duration: 360 }}>
	<span
		class="ic-pc scale-115 cursor-pointer text-white transition-all duration-150 hover:scale-100"
	></span>
	<span
		class="ic-base-module scale-115 cursor-pointer text-white transition-all duration-150 hover:scale-100"
	></span>
	<span
		class="ic-connect scale-115 cursor-pointer text-white transition-all duration-150 hover:scale-100"
	></span>
	<span
		class="ic-nodejs scale-115 cursor-pointer text-white transition-all duration-150 hover:scale-100"
	></span>
	<span
		class="ic-database scale-115 cursor-pointer text-white transition-all duration-150 hover:scale-100"
	></span>
</div>
{/if}

<style>
	.ic-base-module {
		display: inline-block;
		width: 24px;
		height: 24px;
		--svg: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23000' d='m17.578 4.432l-2-1.05C13.822 2.461 12.944 2 12 2s-1.822.46-3.578 1.382l-.321.169l8.923 5.099l4.016-2.01c-.646-.732-1.688-1.279-3.462-2.21m4.17 3.534l-3.998 2V13a.75.75 0 0 1-1.5 0v-2.286l-3.5 1.75v9.44c.718-.179 1.535-.607 2.828-1.286l2-1.05c2.151-1.129 3.227-1.693 3.825-2.708c.597-1.014.597-2.277.597-4.8v-.117c0-1.893 0-3.076-.252-3.978M11.25 21.904v-9.44l-8.998-4.5C2 8.866 2 10.05 2 11.941v.117c0 2.525 0 3.788.597 4.802c.598 1.015 1.674 1.58 3.825 2.709l2 1.049c1.293.679 2.11 1.107 2.828 1.286M2.96 6.641l9.04 4.52l3.411-1.705l-8.886-5.078l-.103.054c-1.773.93-2.816 1.477-3.462 2.21'/%3E%3C/svg%3E");
		background-color: currentColor;
		-webkit-mask-image: var(--svg);
		mask-image: var(--svg);
		-webkit-mask-repeat: no-repeat;
		mask-repeat: no-repeat;
		-webkit-mask-size: 100% 100%;
		mask-size: 100% 100%;
	}

	.ic-connect {
		display: inline-block;
		width: 24px;
		height: 24px;
		--svg: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Cpath fill='%23000' d='m24 10l-1.414 1.414L26.172 15H11.899A5.01 5.01 0 0 0 8 11.101V2H6v9.101A5 5 0 0 0 6 20.9V30h2v-9.101A5.01 5.01 0 0 0 11.899 17h14.273l-3.586 3.586L24 22l6-6ZM7 19a3 3 0 1 1 3-3a3.003 3.003 0 0 1-3 3'/%3E%3C/svg%3E");
		background-color: currentColor;
		-webkit-mask-image: var(--svg);
		mask-image: var(--svg);
		-webkit-mask-repeat: no-repeat;
		mask-repeat: no-repeat;
		-webkit-mask-size: 100% 100%;
		mask-size: 100% 100%;
	}

	.ic-nodejs {
		display: inline-block;
		width: 24px;
		height: 24px;
		background-repeat: no-repeat;
		background-size: 100% 100%;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 128 128'%3E%3Cpath fill='url(%23deviconNodejs0)' d='M66.958.825a6.07 6.07 0 0 0-6.035 0L11.103 29.76c-1.895 1.072-2.96 3.095-2.96 5.24v57.988c0 2.143 1.183 4.167 2.958 5.24l49.82 28.934a6.07 6.07 0 0 0 6.036 0l49.82-28.935c1.894-1.072 2.958-3.096 2.958-5.24V35c0-2.144-1.183-4.167-2.958-5.24z'/%3E%3Cpath fill='url(%23deviconNodejs1)' d='M116.897 29.76L66.841.825A8 8 0 0 0 65.302.23L9.21 96.798a6.3 6.3 0 0 0 1.657 1.43l50.057 28.934c1.42.833 3.076 1.072 4.615.595l52.66-96.925a3.7 3.7 0 0 0-1.302-1.072'/%3E%3Cpath fill='url(%23deviconNodejs2)' d='M116.898 98.225c1.42-.833 2.485-2.262 2.958-3.81L65.066.108c-1.42-.238-2.959-.119-4.26.715L11.104 29.639l53.606 98.355c.71-.12 1.54-.358 2.25-.715z'/%3E%3Cdefs%3E%3ClinearGradient id='deviconNodejs0' x1='34.513' x2='27.157' y1='15.535' y2='30.448' gradientTransform='translate(-129.242 -73.715)scale(6.18523)' gradientUnits='userSpaceOnUse'%3E%3Cstop stop-color='%233f873f'/%3E%3Cstop offset='.33' stop-color='%233f8b3d'/%3E%3Cstop offset='.637' stop-color='%233e9638'/%3E%3Cstop offset='.934' stop-color='%233da92e'/%3E%3Cstop offset='1' stop-color='%233dae2b'/%3E%3C/linearGradient%3E%3ClinearGradient id='deviconNodejs1' x1='30.009' x2='50.533' y1='23.359' y2='8.288' gradientTransform='translate(-129.242 -73.715)scale(6.18523)' gradientUnits='userSpaceOnUse'%3E%3Cstop offset='.138' stop-color='%233f873f'/%3E%3Cstop offset='.402' stop-color='%2352a044'/%3E%3Cstop offset='.713' stop-color='%2364b749'/%3E%3Cstop offset='.908' stop-color='%236abf4b'/%3E%3C/linearGradient%3E%3ClinearGradient id='deviconNodejs2' x1='21.917' x2='40.555' y1='22.261' y2='22.261' gradientTransform='translate(-129.242 -73.715)scale(6.18523)' gradientUnits='userSpaceOnUse'%3E%3Cstop offset='.092' stop-color='%236abf4b'/%3E%3Cstop offset='.287' stop-color='%2364b749'/%3E%3Cstop offset='.598' stop-color='%2352a044'/%3E%3Cstop offset='.862' stop-color='%233f873f'/%3E%3C/linearGradient%3E%3C/defs%3E%3C/svg%3E");
	}

	.ic-pc {
		display: inline-block;
		width: 24px;
		height: 24px;
		background-repeat: no-repeat;
		background-size: 100% 100%;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 14 14'%3E%3Cg fill='none'%3E%3Cpath fill='%232859c5' fill-rule='evenodd' d='M7 2.955a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H8q-.063 0-.125-.007a2 2 0 0 0 .104-.99a2.75 2.75 0 0 0 2.271-2.708v-4A2.75 2.75 0 0 0 7.5 3.5H7z' clip-rule='evenodd'/%3E%3Cpath fill='%238fbffa' fill-rule='evenodd' d='M13 1.612a1 1 0 0 1 1 1v4.625h-3.75V6.25A2.75 2.75 0 0 0 7.5 3.5H7v-.888a1 1 0 0 1 1-1z' clip-rule='evenodd'/%3E%3Cpath fill='%232859c5' d='M11.14 3.799a.766.766 0 1 0 1.532 0a.766.766 0 1 0-1.532 0'/%3E%3Cpath fill='%232859c5' fill-rule='evenodd' d='M3.75 11.75h1.5v.75H6A.75.75 0 0 1 6 14H3a.75.75 0 0 1 0-1.5h.75z' clip-rule='evenodd'/%3E%3Cpath fill='%238fbffa' fill-rule='evenodd' d='M1.5 4.75A1.5 1.5 0 0 0 0 6.25v4a1.5 1.5 0 0 0 1.5 1.5h6a1.5 1.5 0 0 0 1.5-1.5v-4a1.5 1.5 0 0 0-1.5-1.5z' clip-rule='evenodd'/%3E%3C/g%3E%3C/svg%3E");
	}

	.ic-database {
		display: inline-block;
		width: 24px;
		height: 24px;
		--svg: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Cpath fill='%23000' d='M8.026 5.935c-1.286 1.315-1.286 2.815 0 4.13c.757.774 1.926 1.54 3.488 2.215C14.633 13.63 19.046 14.5 24 14.5s9.367-.871 12.486-2.22c1.562-.675 2.73-1.441 3.488-2.215c1.286-1.315 1.286-2.815 0-4.13c-.757-.774-1.926-1.54-3.488-2.215C33.367 2.37 28.954 1.5 24 1.5s-9.367.871-12.486 2.22c-1.562.675-2.73 1.441-3.488 2.215'/%3E%3Cpath fill='%23000' fill-rule='evenodd' d='M3.997 8.001L4 7.954V8c0 1.607.76 3.016 1.881 4.163c1.116 1.14 2.656 2.098 4.442 2.87C13.9 16.58 18.736 17.5 24 17.5s10.1-.92 13.677-2.466c1.786-.773 3.326-1.73 4.441-2.871C43.24 11.016 44 9.567 44 7.96l.076 1.335c.047.88.11 2.136.173 3.643c.107 2.566.214 5.865.243 9.277c-.128 1.764-1.829 3.796-5.556 5.49C35.19 29.409 29.91 30.5 24 30.5s-11.19-1.092-14.936-2.794c-3.727-1.695-5.428-3.727-5.556-5.49c.03-3.413.136-6.712.243-9.278A310 310 0 0 1 3.997 8M8.5 22a2 2 0 1 1 4 0a2 2 0 0 1-4 0m8.5 3.75a2 2 0 1 0 0-4a2 2 0 0 0 0 4' clip-rule='evenodd'/%3E%3Cpath fill='%23000' fill-rule='evenodd' d='M3.752 33.583a165 165 0 0 1-.214-5.8c1.2 1.035 2.677 1.923 4.285 2.654C12.04 32.354 17.76 33.5 24 33.5s11.96-1.146 16.177-3.063c1.608-.731 3.085-1.62 4.285-2.654c-.046 2.328-.13 4.287-.214 5.8a113 113 0 0 1-.233 3.32l-.004.054l-.012.121c-.024 1.575-.777 2.956-1.88 4.085c-1.116 1.14-2.656 2.098-4.442 2.87C34.1 45.58 29.263 46.5 24 46.5s-10.1-.92-13.677-2.466c-1.786-.773-3.326-1.73-4.442-2.871c-1.103-1.128-1.856-2.51-1.88-4.084l-.017-.175l-.058-.692a124 124 0 0 1-.174-2.629M10.5 39.5a2 2 0 1 0 0-4a2 2 0 0 0 0 4m6.5 1.75a2 2 0 1 0 0-4a2 2 0 0 0 0 4' clip-rule='evenodd'/%3E%3C/svg%3E");
		background-color: currentColor;
		-webkit-mask-image: var(--svg);
		mask-image: var(--svg);
		-webkit-mask-repeat: no-repeat;
		mask-repeat: no-repeat;
		-webkit-mask-size: 100% 100%;
		mask-size: 100% 100%;
	}
</style>
