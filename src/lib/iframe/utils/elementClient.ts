// $lib/iframe/utils/elementClient.ts

interface ElementResponse {
	success: boolean;
	error?: string;
	executionTime?: number;
	message?: string;
}

export class ElementClient {
	private static instance: ElementClient;
	private initialized = false;
	private messageHandler: (event: MessageEvent) => void;

	private constructor() {
		this.messageHandler = this.handleMessage.bind(this);
		this.initialize();
	}
```
	static getInstance(): ElementClient {
		if (!ElementClient.instance) {
			ElementClient.instance = new ElementClient();
		}
		return ElementClient.instance;
	}

	private initialize() {
		if (this.initialized) return;
		try {
			window.addEventListener('message', this.messageHandler);
			this.initialized = true;
		} catch (error) {
			console.error('Failed to initialize ElementClient:', error);
		}
	}

	private handleMessage(event: MessageEvent) {
		// Handle any specific element/dropper related responses if needed
	}

	async insertElement(elementId: string, theme?: string): Promise<ElementResponse> {
		try {
			const payload = {
				elementId,
				theme: theme || 'light' // Ensure theme is always passed
			};

			window.parent.postMessage(
				JSON.stringify({
					action: 'getElement',
					payload
				}),
				'*'
			);
			return {
				success: true,
				executionTime: 0 // Actual timing could be implemented if needed
			};
		} catch (error) {
			console.error('Failed to insert element:', error);
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Failed to insert element'
			};
		}
	}

	destroy() {
		if (this.initialized) {
			window.removeEventListener('message', this.messageHandler);
			this.initialized = false;
		}
	}
}