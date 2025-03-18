// src/data/templates.ts

export interface DocLink {
	title: string;
	desc: string;
	url: string;
	// type: string = 'drive'; // 
}

export const DRIVE_FOLDER_URL = "https://drive.google.com/drive/folders/1k3ZaPn-J_xHSUV0YrpyvAvNuD-uFsuu_";

export const docLinks: DocLink[] = [
	{
		title: "Blank",
		desc: "Start with a blank document",
		url: "https://docs.google.com/document/d/1w8qegZlVeY9Lk7MKTu2WhYBrmEjAYvx1yHxPsEIWEDo/"
	},
	{
		title: "Elements",
		desc: "All design elements",
		url: "https://docs.google.com/document/d/1J47oXlR-oRwmiRy7wUBlZGzt6mr5rXo_FBuXvtk5854/"
	},
	{
		title: "Dark Mode",
		desc: "Dark theme template",
		url: "https://docs.google.com/document/d/1auVORPLHk1I5JPn4FAh3nYvBSoDHvWT0eCB8TsYm524/"
	},
	// {
	// 	title: "Master docs drive",
	// 	desc: "Dark theme template",
	// 	url: "https://drive.google.com/drive/folders/11-7g4bqX7uj_BKNlllo425kg1pAALSoL"
	// }
];