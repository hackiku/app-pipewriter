// src/data/templates.ts

export interface DocLink {
	title: string;
	desc: string;
	url: string;
	// type: string = 'drive'; // 
}

export const DRIVE_FOLDER_URL = "https://drive.google.com/drive/folders/0APK23drQdIekUk9PVA";

export const docLinks: DocLink[] = [
	{
		title: "Blank (old)",
		desc: "Start with a blank document",
		url: "https://docs.google.com/document/d/1w8qegZlVeY9Lk7MKTu2WhYBrmEjAYvx1yHxPsEIWEDo/"
	},
	{
		title: "Elements",
		desc: "All design elements",
		url: "https://docs.google.com/document/d/1hjIdUjCRPGLFJhK6NNmV24zxZxGivWOQX959aUPfXR0"
	},
	{
		title: "Dark Mode",
		desc: "Dark theme template",
		url: "https://docs.google.com/document/d/1MBSDZ7EDJ4JBenwoUnna5dbbXr7oCAOv1__m8LVJfSA"
	},
	// {
	// 	title: "Master docs drive",
	// 	desc: "Dark theme template",
	// 	url: "https://drive.google.com/drive/folders/11-7g4bqX7uj_BKNlllo425kg1pAALSoL"
	// }
];