// src/lib/services/google/docs.ts
import { GoogleAppsService } from './client';

export function insertElement(elementId, theme) {
	const client = GoogleAppsService.getInstance();
	return client.sendMessage('getElement', { elementId, theme });
}

export function changeBackground(color) {
	const client = GoogleAppsService.getInstance();
	return client.sendMessage('changeBg', { color });
}