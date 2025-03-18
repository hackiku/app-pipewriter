<!-- $lib/iframe/layout/AppAbout.svelte -->
<script lang="ts">
	import { fade } from "svelte/transition";
	import { Copy, Check, X, Mail } from "lucide-svelte";
	import { showAboutModal } from "../stores/aboutStore";
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import FeedbackForm from "../components/FeedbackForm.svelte";

	const writerEmails = [
		"ernie@hemingway.gg",
		"franz@kafka.dev",
		"fyodor@dostoevsky.ru",
		"margaret@atwood.ca",
		"jane@austen.io",
		"james@joyce.ie",
		"italo@calvino.it",
		"albert@camus.dz",
		"hank@moody.ny",
		"isabel@allende.cl",
		"edgar@poe.xyz",
	];

	let email = "";
	let isSubmitting = false;
	let copied = false;
	let placeholder =
		writerEmails[Math.floor(Math.random() * writerEmails.length)];

	function closeModal() {
		showAboutModal.set(false);
	}

	function handleSubscriptionSuccess() {
		// Maybe show a success message
		setTimeout(() => {
			showAboutModal.set(false);
		}, 1500);
	}

	async function copyEmail() {
		await navigator.clipboard.writeText("ivan@pipewriter.io");
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}
</script>

<!-- Container -->
{#if $showAboutModal}
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div
		class="relative z-50 bg-gray-900/80 dark:bg-gray-950/80 h-screen -mx-2"
		on:click={closeModal}
		on:keydown={(e) => e.key === "Escape" && closeModal()}
	>
		<!-- Top border line -->
		<div class="border-t border-gray-200 dark:border-gray-700" />

		<!-- Modal content -->
		<!-- {#if $showAboutModal} -->
		<div
			class="fixed bottom-12 left-2 right-2"
			in:fade={{ duration: 200 }}
			out:fade={{ duration: 200 }}
		>
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<div
				class="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
				on:click|stopPropagation
			>
				<div class="flex justify-between items-start mb-6">
					<div>
						<h2 class="text-xl font-semibold">
							Great products start with words
						</h2>
						<p class="text-sm text-gray-600 dark:text-gray-300 mt-2">
							Google Docs is where writers write.
							<a
								href="https://pipewriter.io"
								class="text-primary font-semibold hover:underline hover:text-primary/90 transition-colors"
								>Pipewriter</a
							>
							makes it a bit more product designey so you can 10x your website copy
							decks and wireframes.
						</p>
						<p class="text-sm text-gray-600 dark:text-gray-300 mt-2">
							Obsessively designed for fellow copywriters, content strategists,
							and UX pros.
						</p>
					</div>
					<Button
						variant="ghost"
						size="sm"
						class="h-8 w-8 p-0"
						on:click={closeModal}
					>
						<X class="h-4 w-4" />
					</Button>
				</div>


				<FeedbackForm onSuccess={handleSubscriptionSuccess} />
				
				<div class="pt-4 border-t border-gray-200 dark:border-gray-700">
					<p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
						Support & talk life:
					</p>
					<div class="flex items-center justify-between">
						<a
							href="mailto:ivan@pipewriter.io"
							class="text-xl text-primary hover:text-primary/90 transition-colors"
						>
							ivan@pipewriter.io
						</a>
						<Button
							variant="ghost"
							size="sm"
							class="h-8 w-8 p-0"
							on:click={copyEmail}
						>
							{#if copied}
								<Check class="h-4 w-4 text-green-500" />
							{:else}
								<Copy class="h-4 w-4" />
							{/if}
						</Button>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	/* Ensure proper positioning */
	/* :global(.fixed) {
    position: fixed !important;
  } */
</style>
