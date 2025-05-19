<!-- src/routes/+page.svelte -->

<script lang="ts">
	import LoginForm from "$lib/components/auth/LoginForm.svelte";
	import { Moon } from "@lucide/svelte"

</script>
<div class="w-screen h-screen bg- text-white">

	<LoginForm />

	<a href="/addon">Addon</a>

</div>
