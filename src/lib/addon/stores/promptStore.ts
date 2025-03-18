// $lib/stores/promptStore.ts
import { writable, derived } from "svelte/store";

export interface Prompt {
  id: string;
  title: string;
  content: string;
}

const DEFAULT_PROMPTS: Prompt[] = [
  {
    id: "1",
    title: "Landing Page",
    content:
      "Generate a landing page with a hero section that highlights the main value proposition, followed by 3 feature cards showing key benefits, and end with a prominent call-to-action button.",
  },
  {
    id: "2",
    title: "Feature Section",
    content:
      "Create a feature comparison section with 3-4 columns. Each should have a clear heading, supporting text that emphasizes benefits, and maintain consistent vertical alignment.",
  },
  {
    id: "3",
    title: "Pricing Cards",
    content:
      "Design a pricing section with 3 tiers. Each card should have a clear plan name, price point, feature list highlighting key benefits, and a call-to-action button.",
  },
];

interface PromptState {
  prompts: Prompt[];
  activePromptId: string | null;
  useMasterPrompt: boolean;
  masterPrompt: string;
}

function createPromptStore() {
  const { subscribe, set, update } = writable<PromptState>({
    prompts: DEFAULT_PROMPTS,
    activePromptId: null,
    useMasterPrompt: true,
    masterPrompt:
      "The HTML you see is pseudocode generated by a script from a wireframe. Infer UX and layout from element types. Never write HTML though, only copy.",
  });

  return {
    subscribe,
    setActivePrompt: (promptId: string | null) =>
      update((state) => ({ ...state, activePromptId: promptId })),
    toggleMasterPrompt: () =>
      update((state) => ({
        ...state,
        useMasterPrompt: !state.useMasterPrompt,
      })),
    updatePrompt: (prompt: Prompt) =>
      update((state) => ({
        ...state,
        prompts: state.prompts.map((p) => (p.id === prompt.id ? prompt : p)),
      })),
    removeActivePrompt: () =>
      update((state) => ({ ...state, activePromptId: null })),
    setMasterPrompt: (content: string) =>
      update((state) => ({ ...state, masterPrompt: content })),
    resetPrompt: (promptId: string) =>
      update((state) => ({
        ...state,
        prompts: state.prompts.map((p) =>
          p.id === promptId
            ? DEFAULT_PROMPTS.find((dp) => dp.id === promptId) || p
            : p,
        ),
      })),
  };
}

export const promptStore = createPromptStore();
export const activePrompt = derived(promptStore, ($store) =>
  $store.prompts.find((p) => p.id === $store.activePromptId),
);
