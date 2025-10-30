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
	 * Add a GUI folder
	 * @param {string} name - Folder name
	 * @returns {dat.GUI} The created folder
	 */
	addFolder(name) {
		return this.gui.addFolder(name)
	}
}

