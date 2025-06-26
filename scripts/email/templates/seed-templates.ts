// scripts/email/templates/seed-templates.ts - Following your pattern
import { adminFirestore } from '../../../src/lib/server/firebase-admin.ts';
import { welcomeTemplate } from './welcome.ts';
import { tutorialTemplate } from './tutorial.ts';
import { upgradeTemplate } from './upgrade.ts';

const emailTemplatesData = [
	welcomeTemplate,
	tutorialTemplate,
	upgradeTemplate
];

/**
 * Seed email templates to Firestore (environment agnostic)
 * Uses whatever firebase-admin.ts is configured for
 */
export async function seedEmailTemplates(): Promise<boolean> {
	console.log('📧 Seeding email templates to Firestore...');

	try {
		const batch = adminFirestore.batch();
		let totalSeeded = 0;
		const categoryCount: Record<string, number> = {};
		const tagCount: Record<string, number> = {};

		emailTemplatesData.forEach((template) => {
			// Store in email/templates subcollection
			const templateRef = adminFirestore
				.collection('email')
				.doc('templates')
				.collection('items')
				.doc(template.id);

			const firestoreTemplate = {
				...template,
				// Add computed search-friendly fields
				searchTerms: [
					template.id.toLowerCase(),
					template.name.toLowerCase(),
					template.subject.toLowerCase(),
					template.metadata.category.toLowerCase(),
					...(template.metadata.tags || [])
				].filter(Boolean),

				// Ensure dates are proper Firestore timestamps
				createdAt: new Date(),
				updatedAt: new Date()
			};

			batch.set(templateRef, firestoreTemplate);

			// Count stats
			totalSeeded++;
			const category = template.metadata.category;
			categoryCount[category] = (categoryCount[category] || 0) + 1;

			template.metadata.tags?.forEach(tag => {
				tagCount[tag] = (tagCount[tag] || 0) + 1;
			});
		});

		await batch.commit();

		console.log(`✅ Successfully seeded ${totalSeeded} email templates`);
		console.log(`   📂 Categories:`, categoryCount);
		console.log(`   🏷️  Tags:`, tagCount);
		console.log(`   📝 Templates: ${emailTemplatesData.map(t => t.id).join(', ')}`);

		// Create analytics document
		await createTemplatesAnalytics();

		return true;
	} catch (error) {
		console.error('❌ Error seeding email templates:', error);
		return false;
	}
}

/**
 * Create email templates analytics document
 */
async function createTemplatesAnalytics(): Promise<boolean> {
	try {
		const totalTemplates = emailTemplatesData.length;
		const categoryBreakdown = emailTemplatesData.reduce(
			(acc, template) => {
				const category = template.metadata.category;
				acc[category] = (acc[category] || 0) + 1;
				return acc;
			},
			{} as Record<string, number>
		);

		const tagBreakdown = emailTemplatesData.reduce(
			(acc, template) => {
				template.metadata.tags?.forEach(tag => {
					acc[tag] = (acc[tag] || 0) + 1;
				});
				return acc;
			},
			{} as Record<string, number>
		);

		const analyticsData = {
			totalTemplates,
			categoryBreakdown,
			tagBreakdown,
			templatesWithVariables: emailTemplatesData.filter(t => t.variables && t.variables.length > 0).length,
			templatesWithHtml: emailTemplatesData.filter(t => t.html && t.html.length > 0).length,
			templatesWithText: emailTemplatesData.filter(t => t.text && t.text.length > 0).length,
			lastUpdated: new Date(),
			version: '1.0'
		};

		await adminFirestore
			.collection('email')
			.doc('templates')
			.collection('_meta')
			.doc('analytics')
			.set(analyticsData);

		console.log('✅ Email templates analytics created');

		return true;
	} catch (error) {
		console.error('❌ Error creating templates analytics:', error);
		return false;
	}
}