<!-- $lib/iframe/layout/AppAbout.svelte -->
<script lang="ts">
  import { fade } from "svelte/transition";
  import { Copy, Check, X, Mail } from "lucide-svelte";

  // Props
  const props = $props<{
    showAboutModal: boolean;
    onToggleAboutModal: () => void;
  }>();

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

  let email = $state("");
  let isSubmitting = $state(false);
  let copied = $state(false);
  let placeholder = $state(
    writerEmails[Math.floor(Math.random() * writerEmails.length)]
  );

  function closeModal() {
    props.onToggleAboutModal();
  }

  function handleSubscriptionSuccess() {
    setTimeout(() => {
      closeModal();
    }, 1500);
  }

  async function copyEmail() {
    await navigator.clipboard.writeText("ivan@pipewriter.io");
    copied = true;
    setTimeout(() => (copied = false), 2000);
  }
</script>

<!-- Container -->
{#if props.showAboutModal}
  <div
    role="button"
    tabindex="0"
    class="fixed inset-0 z-[100] bg-gray-900/80 dark:bg-gray-950/80 h-screen"
    onclick={closeModal}
    onkeydown={(e) => e.key === "Escape" && closeModal()}
  >
    <!-- Modal content -->
    <div
      class="fixed left-2 right-2 bottom-12 max-w-xl mx-auto"
      in:fade={{ duration: 200 }}
      out:fade={{ duration: 200 }}
    >
      <!-- Simple container for the modal -->
      <div
        role="button"
        class="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
        onclick={(e) => e.stopPropagation()}
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
              >
                Pipewriter
              </a>
              makes it a bit more product designey so you can 10x your website copy
              decks and wireframes.
            </p>
            <p class="text-sm text-gray-600 dark:text-gray-300 mt-2">
              Obsessively designed for fellow copywriters, content strategists,
              and UX pros.
            </p>
          </div>
          <button
            class="h-8 w-8 p-0 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            onclick={closeModal}
          >
            <X class="h-4 w-4 mx-auto" />
          </button>
        </div>

        <!-- Add a feedback form here -->
        <div class="mb-4">
          <div class="flex gap-2 mb-4">
            <input
              type="email"
              placeholder={placeholder}
              class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              bind:value={email}
              disabled={isSubmitting}
            />
            <button
              class="px-3 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
              disabled={isSubmitting}
            >
              Subscribe
            </button>
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            Sign up for updates on new features, templates & design tips.
          </p>
        </div>
        
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
            <button
              class="h-8 w-8 p-0 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              onclick={copyEmail}
            >
              {#if copied}
                <Check class="h-4 w-4 text-green-500 mx-auto" />
              {:else}
                <Copy class="h-4 w-4 mx-auto" />
              {/if}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}