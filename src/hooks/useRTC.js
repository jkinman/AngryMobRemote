import { useContext } from 'react';
import { RTCContext } from '../contexts/RTCContext';

/**
 * Custom hook to access RTC context
 * @returns {Object} RTC state and methods
 */
export const useRTC = () => {
	const context = useContext(RTCContext);
	
	if (!context) {
		throw new Error('useRTC must be used within RTCProvider');
	}
	
	return context;
};

export default useRTC;

