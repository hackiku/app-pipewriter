<script lang="ts">
	import Button from "$lib/components/ui/button/button.svelte";

	import { Moon } from "@lucide/svelte"

</script>
<div class="w-screen h-screen bg-neutral-950 text-white">
	<h1>Welcome to SvelteKit</h1>
	<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>

	<Button class="flex gap-6">
		<Moon /><span>Coddioo </span>
	</Button>
</div>
