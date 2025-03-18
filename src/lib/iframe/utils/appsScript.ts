// src/lib/utils/appsScript.ts

export class AppsScriptClient {
	private static instance: AppsScriptClient | null = null;
	private timeoutDuration: number;
	private activeRequests = new Map();

	private constructor(timeoutDuration = 5000) {
		this.timeoutDuration = timeoutDuration;
		this.setupMessageListener();
	}

	static getInstance(timeoutDuration?: number): AppsScriptClient {
		if (!AppsScriptClient.instance) {
			AppsScriptClient.instance = new AppsScriptClient(timeoutDuration);
		}
		return AppsScriptClient.instance;
	}

	private setupMessageListener() {
		window.addEventListener('message', (event) => {
			try {
				const response = typeof event.data === 'string' ?
					JSON.parse(event.data) : event.data;

				if (response?.action) {
					const request = this.activeRequests.get(response.action);
					if (request) {
						const executionTime = Date.now() - request.startTime;

						if (response.error) {
							request.resolve({
								success: false,
								error: response.error,
								executionTime
							});
						} else {
							request.resolve({
								success: true,
								...response,
								executionTime
							});
						}

						clearTimeout(request.timer);
						this.activeRequests.delete(response.action);
					}
				}
			} catch (e) {
				// Ignore non-JSON messages
			}
		});
	}

	async sendMessage(action: string, payload = {}) {
		// Clean up any existing request with same action
		const existingRequest = this.activeRequests.get(action);
		if (existingRequest) {
			clearTimeout(existingRequest.timer);
			this.activeRequests.delete(action);
		}

		return new Promise((resolve) => {
			const startTime = Date.now();

			// Set timeout for request
			const timer = setTimeout(() => {
				resolve({
					success: false,
					error: `Request timed out after ${this.timeoutDuration}ms`,
					action
				});
				this.activeRequests.delete(action);
			}, this.timeoutDuration);

			// Store request info
			this.activeRequests.set(action, {
				resolve,
				timer,
				startTime
			});

			// Send message to Apps Script
			window.parent.postMessage(JSON.stringify({ action, payload }), '*');
		});
	}

	destroy() {
		this.activeRequests.forEach(request => {
			clearTimeout(request.timer);
		});
		this.activeRequests.clear();
	}
}