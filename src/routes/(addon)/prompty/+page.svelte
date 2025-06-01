<!-- src/routes/(addon)/prompty/+page.svelte -->
<script lang="ts">
	import TopBar from "$lib/features/addon/layout/TopBar.svelte";
	import PromptManager from "$lib/components/prompts/PromptManager.svelte";
</script>

<main class="px-6">
	<TopBar />
	<PromptManager />

</main>