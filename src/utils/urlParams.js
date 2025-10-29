/**
 * Parse URL parameters for the application
 * @returns {Object} Parsed parameters { rtcId, isClient, show3DControls }
 */
export const parseAppParams = () => {
	const params = new URL(document.location).searchParams
	
	const rtcId = params.has("id") ? params.get("id") : null
	const isClient = !params.has("id") // If no ID, this is the client
	const show3DControls = params.has("controls") ? !!params.get("controls") : undefined
	
	return {
		rtcId,
		isClient,
		show3DControls
	}
}

export default parseAppParams

