<!-- src/lib/iframe/features/table/TableAlignment.svelte -->
<script lang="ts">
	import {
		AlignLeft,
		AlignCenter,
		AlignRight,
		AlignStartVertical,
		AlignCenterVertical,
		AlignEndVertical,
	} from "lucide-svelte";
	import { Button } from "$lib/components/ui/button";
	import { cn } from "$lib/utils";
	import TablePreview from "./TablePreview.svelte";

	// Props using Svelte 5 runes
	const props = $props<{
		values: {
			tableAlignment: string;
			cellVerticalAlignment: string;
		};
		onUpdate: (values: any) => void;
	}>();

	// Local state - using $state for local component state
	let localValues = $state({
		tableAlignment: props.values.tableAlignment,
		cellVerticalAlignment: props.values.cellVerticalAlignment,
	});

	// Update local state when props change
	$effect(() => {
		localValues = {
			tableAlignment: props.values.tableAlignment,
			cellVerticalAlignment: props.values.cellVerticalAlignment,
		};
	});

	// Set table alignment and notify parent
	function setTableAlignment(value: string) {
		localValues.tableAlignment = value;
		notifyParent();
	}

	// Set cell vertical alignment and notify parent
	function setCellVerticalAlignment(value: string) {
		localValues.cellVerticalAlignment = value;
		notifyParent();
	}

	// Notify parent of changes - one-way data flow to prevent infinite loops
	function notifyParent() {
		props.onUpdate({
			tableAlignment: localValues.tableAlignment,
			cellVerticalAlignment: localValues.cellVerticalAlignment,
		});
	}

	// Generate button class based on selection status
	function getButtonClass(currentValue: string, selectedValue: string) {
		return cn(
			"flex items-center justify-center aspect-square p-0",
			"border rounded-md transition-colors",
			currentValue === selectedValue
				? "bg-primary/10 border-primary text-primary"
				: "bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700",
		);
	}

	// Derived values for preview styling
	let tableAlignmentClass = $derived(() => {
		switch (localValues.tableAlignment) {
			case "left":
				return "justify-start";
			case "center":
				return "justify-center";
			case "right":
				return "justify-end";
			default:
				return "justify-center";
		}
	});

	let cellAlignmentClass = $derived(() => {
		switch (localValues.cellVerticalAlignment) {
			case "top":
				return "items-start";
			case "middle":
				return "items-center";
			case "bottom":
				return "items-end";
			default:
				return "items-center";
		}
	});
</script>

<!-- Table Alignments Grid -->
<div class="grid grid-cols-3 gap-2">
	<!-- Horizontal Alignments (Row 1) -->
	<Button
		variant="outline"
		class={getButtonClass(localValues.tableAlignment, "left")}
		onclick={() => setTableAlignment("left")}
	>
		<AlignLeft class="h-5 w-5" />
	</Button>

	<Button
		variant="outline"
		class={getButtonClass(localValues.tableAlignment, "center")}
		onclick={() => setTableAlignment("center")}
	>
		<AlignCenter class="h-5 w-5" />
	</Button>

	<Button
		variant="outline"
		class={getButtonClass(localValues.tableAlignment, "right")}
		onclick={() => setTableAlignment("right")}
	>
		<AlignRight class="h-5 w-5" />
	</Button>

	<!-- Vertical Alignments (Row 2) -->
	<Button
		variant="outline"
		class={getButtonClass(localValues.cellVerticalAlignment, "top")}
		onclick={() => setCellVerticalAlignment("top")}
	>
		<AlignStartVertical class="h-5 w-5" />
	</Button>

	<Button
		variant="outline"
		class={getButtonClass(localValues.cellVerticalAlignment, "middle")}
		onclick={() => setCellVerticalAlignment("middle")}
	>
		<AlignCenterVertical class="h-5 w-5" />
	</Button>

	<Button
		variant="outline"
		class={getButtonClass(localValues.cellVerticalAlignment, "bottom")}
		onclick={() => setCellVerticalAlignment("bottom")}
	>
		<AlignEndVertical class="h-5 w-5" />
	</Button>
</div>
