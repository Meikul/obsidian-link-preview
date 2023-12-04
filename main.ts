import {
	App,
	Editor,
	MarkdownView,
	Plugin,
	PluginSettingTab,
	Notice,
} from "obsidian";

import mql, { MqlResponse } from "@microlink/mql";

// Remember to rename these classes and interfaces!

interface LinkPreviewSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: LinkPreviewSettings = {
	mySetting: "default",
};

export default class LinkPreview extends Plugin {
	settings: LinkPreviewSettings;

	async onload() {
		await this.loadSettings();

		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: "create link preview",
			name: "Create Link Preview",
			editorCallback: async (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				const selection = editor.getSelection();
				let linkText = selection.trim();
				let selectionMode = 0;
				console.log(editor);


				if (!LinkPreview.isUrl(linkText)) {
					linkText = editor.getLine(editor.getCursor().line);
					selectionMode = 1;
					if(!LinkPreview.isUrl(linkText)){
						linkText = (await navigator.clipboard.readText()).trim();
						selectionMode = 2;
					}
				}
				if(LinkPreview.isUrl(linkText)){
					if(selectionMode === 1){
						const curLineNum = editor.getCursor().line;
						const curLineEnd = editor.getLine(curLineNum).length;
						editor.setSelection({line: curLineNum, ch: 0}, {line: curLineNum, ch:curLineEnd});
					}
					editor.replaceSelection(`\`\`\`linkp\n${linkText}\n\`\`\``);
				}
				else{
					new Notice('Not a valid URL', 2000);
				}
			},
		});

		this.registerMarkdownCodeBlockProcessor(
			"linkp",
			async (src, el, ctx) => {
				console.log(src);
				this.createDummyBlock(el);

				let url = src.trim();

				if (LinkPreview.isUrl(url)) {
					// const data = await this.fetchInfo(url);
					// this.removeDummyBlock(el);
					// this.createPreview(data, el);
				}
			}
		);

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));
	}

	onunload() {}

	async fetchInfo(url: string) {
		// const apiUrl = `https://api.microlink.io?url=${url}&palette=true&audio=true&video=true&iframe=true`;

		// const { data } = await mql(url);

		// console.log(data);
		const memo = {
			title: "Cursorless: Voice coding at the speed of thought",
			description: "Voice coding at the speed of thought",
			lang: "en",
			author: null,
			publisher: "Cursorless",
			image: {
				url: "https://cursorless.org/video-share-thumbnail.jpg",
				type: "jpg",
				size: 169731,
				height: 1440,
				width: 2560,
				size_pretty: "170 kB",
			},
			date: "2023-12-01T19:17:54.000Z",
			url: "https://cursorless.org/",
			logo: {
				url: "https://www.cursorless.org/apple-touch-icon.png?v=1",
				type: "png",
				size: 2556,
				height: 180,
				width: 180,
				size_pretty: "2.56 kB",
			},
		};

		return memo;
	}

	removeDummyBlock(el: HTMLElement) {
		const dummy = el.querySelector('.preview-dummy-block');
		if(dummy){
			el.removeChild(dummy);
		}
	}

	createDummyBlock(el: HTMLElement) {
		el.createEl("div", {
			cls: "preview-dummy-block",
		});
	}

	createPreview(data: MqlResponseData, el: HTMLElement) {
		// const appleLinkInfo = {
		// 	title: "Detect Body and Hand Pose with Vision - WWDC20 - Videos - Apple Developer",
		// 	imgUrl: "https://devimages-cdn.apple.com/wwdc-services/images/49/3442/3442_wide_250x141_2x.jpg",
		// 	description: "Explore how the Vision framework can help your app detect body and hand poses in photos and video. With pose detection, your app can…",
		// 	url: "https://developer.apple.com/videos/play/wwdc2020/10653/",
		// };

		// const githubLinkInfo = {
		// 	title: "GitHub - Meikul/obsidian-link-preview",
		// 	imgUrl: "https://opengraph.githubassets.com/61e9f5709e34fae40dd3f49b7d45590d3d3cca438643420133c44363c1efc8ef/Meikul/obsidian-link-preview",
		// 	description: "Contribute to Meikul/obsidian-link-preview development by creating an account on GitHub.",
		// 	url: "https://github.com/Meikul/obsidian-link-preview"
		// }

		// let linkInfo = githubLinkInfo;
		// if(src.contains('apple.com')){
		// 	linkInfo = appleLinkInfo;
		// }

		const container = el.createEl("a", {
			cls: "preview-container",
			href: data.url,
		});

		const imgEl = container.createEl("div", { cls: "preview-img" });
		imgEl.style.backgroundImage = `url("${data.image.url}")`;

		const info = container.createEl("div", { cls: "preview-info" });
		info.createEl("div", {
			cls: "preview-title",
			text: data.title,
		});
		info.createEl("div", {
			cls: "preview-desc",
			text: data.description,
		});
		info.createEl("div", {
			cls: "preview-url",
			text: data.url,
		});
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	public static isUrl(str: string): boolean {
		const urlRegex = new RegExp(
			"(http|ftp|https):\\/\\/([\\w_-]+(?:(?:\\.[\\w_-]+)+))([\\w.,@?^=%&:\\/~+#-]*[\\w@?^=%&\\/~+#-])",
			"g"
		);
		return urlRegex.test(str);
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: LinkPreview;

	constructor(app: App, plugin: LinkPreview) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();
	}
}
