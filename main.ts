import {
	App,
	Editor,
	MarkdownView,
	Plugin,
	PluginSettingTab,
	Setting,
} from "obsidian";

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
				const clipText = (await navigator.clipboard.readText()).trim();
				editor.replaceSelection(`\`\`\`link-preview\n${clipText}\n\`\`\``);
			},
		});

		this.registerMarkdownCodeBlockProcessor(
			"link-preview",
			async (src, el, ctx) => {
				console.log(src);
				this.createDummyBlock(el);
			}
		);

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));
	}

	onunload() {}

	createDummyBlock(el: HTMLElement) {
		const linkInfo = {
			title: "Detect Body and Hand Pose with Vision - WWDC20 - Videos - Apple Developer",
			imgUrl: "https://devimages-cdn.apple.com/wwdc-services/images/49/3442/3442_wide_250x141_2x.jpg",
			description: "Explore how the Vision framework can help your app detect body and hand poses in photos and video. With pose detection, your app can…",
			url: "https://developer.apple.com/videos/play/wwdc2020/10653/",
		};

		// const linkInfo = {
		// 	title: "GitHub - Meikul/obsidian-link-preview",
		// 	imgUrl: "https://opengraph.githubassets.com/61e9f5709e34fae40dd3f49b7d45590d3d3cca438643420133c44363c1efc8ef/Meikul/obsidian-link-preview",
		// 	description: "Contribute to Meikul/obsidian-link-preview development by creating an account on GitHub.",
		// 	url: "https://github.com/Meikul/obsidian-link-preview"
		// }

		const container = el.createEl("a", {
			cls: "preview-container dummy-preview-container",
			href: linkInfo.url
		});

		const imgEl = container.createEl("div", { cls: "preview-img" });
		imgEl.style.backgroundImage = `url("${linkInfo.imgUrl}")`;

		const info = container.createEl("div", { cls: "preview-info" });
		info.createEl("div", {
			cls: "preview-title",
			text: linkInfo.title,
		});
		info.createEl("div", {
			cls: "preview-desc",
			text: linkInfo.description,
		});
		info.createEl("div", {
			cls: "preview-url",
			text: linkInfo.url,
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

  public static isUrl(str: string): boolean{
    const urlRegex = new RegExp('(http|ftp|https):\\/\\/([\\w_-]+(?:(?:\\.[\\w_-]+)+))([\\w.,@?^=%&:\\/~+#-]*[\\w@?^=%&\\/~+#-])', 'g');
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

		new Setting(containerEl)
			.setName("Setting #1")
			.setDesc("It's a secret")
			.addText((text) =>
				text
					.setPlaceholder("Enter your secret")
					.setValue(this.plugin.settings.mySetting)
					.onChange(async (value) => {
						this.plugin.settings.mySetting = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
