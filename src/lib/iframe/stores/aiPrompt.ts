// // $lib/iframe/stores/promptStore.ts

// import { writable, derived } from "svelte/store";

// export interface Prompt {
//   id: string;
//   title: string;
//   content: string;
// }

// const defaultPrompts = [
//   {
//     id: "landing",
//     title: "Landing Page",
//     content:
//       "Generate a landing page with a hero section that highlights the main value proposition, followed by 3 feature cards displaying key benefits, and end with a prominent call-to-action button. Use clear headings and concise copy.",
//   },
//   {
//     id: "features",
//     title: "Product Features",
//     content:
//       "Create a product features section with benefit-focused headings and descriptions. Include 4-6 key features, each with a clear heading and supporting text that emphasizes user value. Format as HTML.",
//   },
//   {
//     id: "blog",
//     title: "Blog Post",
//     content:
//       "Write a blog post structure with clear headings, subheadings, and body text. Include an engaging introduction, 3-4 main sections with descriptive headings, and a conclusion. Format using semantic HTML.",
//   },
// ];

// function createPromptStore() {
//   const { subscribe, set, update } = writable({
//     prompts: defaultPrompts,
//     selectedId: null as string | null,
//     editingId: null as string | null,
//   });

//   return {
//     subscribe,
//     select: (id: string | null) =>
//       update((state) => ({ ...state, selectedId: id })),
//     setEditing: (id: string | null) =>
//       update((state) => ({ ...state, editingId: id })),
//     updateContent: (id: string, content: string) =>
//       update((state) => ({
//         ...state,
//         prompts: state.prompts.map((p) =>
//           p.id === id ? { ...p, content } : p,
//         ),
//       })),
//   };
// }

// export const promptStore = createPromptStore();

// export const selectedPrompt = derived(promptStore, ($store) =>
//   $store.prompts.find((p) => p.id === $store.selectedId),
// );

// export const editingPrompt = derived(promptStore, ($store) =>
//   $store.prompts.find((p) => p.id === $store.editingId),
// );
