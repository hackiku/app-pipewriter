<!-- src/lib/iframe/tabs/TextTab.svelte -->
<script lang="ts">
  import { onMount, createEventDispatcher } from "svelte";
  import { fade } from "svelte/transition";
  import { Loader2, ThumbsUp, AlertCircle } from "lucide-svelte";
  import { GASCommunicator } from "../gasUtils";
  import TextStyleDropdown from "../components/TextStyleDropdown.svelte";
  import TextButtons from "../components/TextButtons.svelte";
  import { elementsTheme } from "../stores";
  import { textStyles, selectedStyle as selectedStyleStore, type TextStyle } from "../stores/textStyles";

  const dispatch = createEventDispatcher();
  const gas = GASCommunicator.getInstance(5000);

  let isProcessing = false;
  let showDeleteConfirm = false;
  let status: StatusUpdate | null = null;
  let selectedStyle = null;
  
  interface StatusUpdate {
    type: "success" | "error" | "processing";
    message: string;
    executionTime?: number;
  }

  async function handleStyleGuideInsert() {
    if (isProcessing) return;
    isProcessing = true;
    dispatch("processingStart");

    try {
      const response = await gas.sendMessage(
        "getElement",
        { elementId: "styleguide" },
        updateStatus
      );

      if (!response.success) {
        throw new Error(response.error || "Failed to insert style guide");
      }
    } catch (error) {
      updateStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to insert style guide"
      });
    } finally {
      isProcessing = false;
      dispatch("processingEnd");
    }
  }

  async function handleStyleSelect(event: CustomEvent<TextStyle>) {
    selectedStyleStore.set(event.detail);
    showDeleteConfirm = false;
  }

	async function handleSaveStyle() {
  console.log('Starting style save...'); 
  if (isProcessing) return;
  
  isProcessing = true;
  dispatch("processingStart");

  try {
    const response = await gas.sendMessage(
      "detectHeadingStyle",
      {}, // empty payload
      updateStatus
    );

    console.log('Raw GAS response:', response);

    if (!response.success) {
      throw new Error(response.error || "Failed to detect style");
    }

    // The style info comes directly in response.data
    const styleInfo = response.data;
    console.log('Detected style info:', styleInfo);

    if (!styleInfo) {
      throw new Error("No style info in response");
    }

    // Create a new TextStyle object
    const newStyle: TextStyle = {
      id: Date.now().toString(),
      headingType: styleInfo.headingType,
      tag: getTagFromHeadingType(styleInfo.headingType),
      label: styleInfo.text || 'Unnamed style',
      fontSize: styleInfo.textAttributes?.fontSize,
      fontFamily: styleInfo.textAttributes?.fontFamily,
      textAttributes: {
        bold: styleInfo.textAttributes?.bold || false,
        italic: styleInfo.textAttributes?.italic || false,
        underline: styleInfo.textAttributes?.underline || false,
        strikethrough: styleInfo.textAttributes?.strikethrough || false,
        foregroundColor: styleInfo.textAttributes?.foregroundColor,
        backgroundColor: styleInfo.textAttributes?.backgroundColor
      },
      paragraphAttributes: {
        lineSpacing: styleInfo.paragraphAttributes?.lineSpacing,
        alignment: styleInfo.paragraphAttributes?.alignment,
        marginLeft: styleInfo.paragraphAttributes?.marginLeft,
        marginRight: styleInfo.paragraphAttributes?.marginRight,
        firstLineIndent: styleInfo.paragraphAttributes?.firstLineIndent,
        spacingBefore: styleInfo.paragraphAttributes?.spacingBefore,
        spacingAfter: styleInfo.paragraphAttributes?.spacingAfter
      },
      saved: true
    };

    console.log('Created new style object:', newStyle);

    // Save to store and select it
    textStyles.saveStyle(newStyle);
    selectedStyleStore.set(newStyle);

    updateStatus({
      type: "success",
      message: `Saved style "${styleInfo.text}"`,
      executionTime: response.executionTime
    });

  } catch (error) {
    console.error('Save style error:', error);
    updateStatus({
      type: "error",
      message: error instanceof Error ? error.message : "Failed to save style"
    });
  } finally {
    isProcessing = false;
    dispatch("processingEnd");
  }
}
	
  async function handleApplyStyle() {
    if (isProcessing) return;
    const currentStyle = $selectedStyleStore;
    if (!currentStyle) return;
    
    isProcessing = true;
    dispatch("processingStart");

    try {
      const response = await gas.sendMessage(
        "updateMatchingStyles",
        { style: currentStyle },
        updateStatus
      );

      if (!response.success) {
        throw new Error(response.error || "Failed to apply style");
      }

      // If successful, show how many paragraphs were updated
      if (response.data?.updatedCount !== undefined) {
        updateStatus({
          type: "success",
          message: `Updated ${response.data.updatedCount} paragraphs`,
          executionTime: response.executionTime
        });
      }
    } catch (error) {
      updateStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to apply style"
      });
    } finally {
      isProcessing = false;
      dispatch("processingEnd");
    }
  }

  function handleDeleteAll() {
    textStyles.deleteAll();
    selectedStyleStore.set(null);
    showDeleteConfirm = false;
  }

  function updateStatus(newStatus: StatusUpdate) {
    status = newStatus;
    if (newStatus.type !== "processing") {
      setTimeout(() => (status = null), 3000);
    }
  }

	// Helper function for tag names
	function getTagFromHeadingType(headingType: string): string {
		const map: Record<string, string> = {
			'NORMAL': 'p',
			'HEADING1': 'h1',
			'HEADING2': 'h2',
			'HEADING3': 'h3',
			'HEADING4': 'h4',
			'HEADING5': 'h5',
			'HEADING6': 'h6'
		};
		return map[headingType] || 'p';
	}

  $: statusClass = status && {
    success: "bg-green-500/5 border-green-500/10 text-green-700",
    error: "bg-red-500/5 border-red-500/10 text-red-700",
    processing: "bg-blue-500/5 border-blue-500/10 text-blue-700"
  }[status.type];
</script>

<div class="relative flex flex-col items-stretch w-full gap-2">
  <!-- Status Message -->
  {#if status}
    <div
      class="absolute bottom-0 left-0 right-0 h-8 flex items-center justify-center gap-2 border-t {statusClass}"
      transition:fade={{ duration: 200 }}
    >
      <div class="flex items-center gap-2">
        {#if status.type === "processing"}
          <Loader2 class="h-3 w-3 animate-spin" />
        {:else if status.type === "success"}
          <ThumbsUp class="h-3 w-3" />
        {:else if status.type === "error"}
          <AlertCircle class="h-3 w-3" />
        {/if}
        <span class="text-xs font-medium">{status.message}</span>
        {#if status.executionTime}
          <span class="text-xs opacity-50">({status.executionTime}ms)</span>
        {/if}
      </div>
    </div>
  {/if}

  <!-- Style Dropdown -->
  <TextStyleDropdown
    selectedStyle={$selectedStyleStore}
    disabled={isProcessing}
    on:select={handleStyleSelect}
  />

  <!-- Buttons Section -->
  <TextButtons
    {isProcessing}
    {showDeleteConfirm}
    selectedStyle={$selectedStyleStore}
    savedCount={$textStyles.filter(s => s.saved).length}
    theme={$elementsTheme}
    on:insertStyleGuide={handleStyleGuideInsert}
    on:save={handleSaveStyle}
    on:apply={handleApplyStyle}
    on:deleteAll={handleDeleteAll}
    on:toggleDeleteConfirm={() => showDeleteConfirm = !showDeleteConfirm}
  />
</div>