import Stats from "stats.js"
import * as dat from "lil-gui"

/**
 * Debug tools manager for FPS stats and GUI controls
 */
export class DebugTools {
	/**
	 * Create debug tools
	 * @param {boolean} [showControls=true] - Whether to show controls initially
	 */
	constructor(showControls = true) {
		this.showControls = showControls
		this.stats = new Stats()
		
		// Track all folders for accordion behavior
		this.folders = []
		
		// Create GUI with custom container
		const guiContainer = document.getElementById("gui-container")
		this.gui = new dat.GUI({ container: guiContainer })
		this.gui.close()

		this.setupStats()
		this.setVisible(showControls)
	}

	/**
	 * Set up FPS stats display
	 * @private
	 */
	setupStats() {
		this.stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
		const elfps = document.getElementById("fps")
		this.stats.dom.className = "fps"
		this.stats.dom.style = ""
		elfps.appendChild(this.stats.dom)
		
		// Make FPS counter clickable to toggle GUI
		this.stats.dom.style.cursor = "pointer"
		this.stats.dom.addEventListener("click", () => {
			this.setVisible(!this.showControls)
		})
	}

	/**
	 * Show or hide debug controls
	 * @param {boolean} visible - Whether controls should be visible
	 */
	setVisible(visible) {
		this.showControls = visible
		if (visible) {
			this.gui.show()
		} else {
			this.gui.hide()
		}
	}

	/**
	 * Begin stats measurement (call at start of frame)
	 */
	begin() {
		this.stats.begin()
	}

	/**
	 * End stats measurement (call at end of frame)
	 */
	end() {
		this.stats.end()
	}

	/**
	 * Add a GUI folder with accordion behavior
	 * @param {string} name - Folder name
	 * @returns {dat.GUI} The created folder
	 */
	addFolder(name) {
		const folder = this.gui.addFolder(name)
		
		// Track this folder
		this.folders.push(folder)
		
		// Setup accordion behavior: when this folder opens, close all others
		this._setupAccordionBehavior(folder)
		
		return folder
	}

	/**
	 * Setup accordion behavior for a folder
	 * Only one folder can be open at a time
	 * @private
	 */
	_setupAccordionBehavior(targetFolder) {
		// Find the folder's title element (the clickable part)
		const titleElement = targetFolder.domElement.querySelector('.title')
		
		if (titleElement) {
			// Add click listener to the title
			titleElement.addEventListener('click', () => {
				// Small delay to let lil-gui's native open/close happen first
				setTimeout(() => {
					// If this folder is now open, close all others
					if (!targetFolder._closed) {
						this.folders.forEach(folder => {
							if (folder !== targetFolder && !folder._closed) {
								folder.close()
							}
						})
					}
				}, 10)
			})
		}
	}
}

