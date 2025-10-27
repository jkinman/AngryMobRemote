import { useContext } from 'react';
import { AppContext } from '../contexts/AppContext';

/**
 * Custom hook to access App context
 * @returns {Object} App state and methods
 */
export const useApp = () => {
	const context = useContext(AppContext);
	
	if (!context) {
		throw new Error('useApp must be used within AppProvider');
	}
	
	return context;
};

export default useApp;

