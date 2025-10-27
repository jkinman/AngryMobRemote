import { useContext } from 'react';
import { DeviceMetricsContext } from '../contexts/DeviceMetricsContext';

/**
 * Custom hook to access Device Metrics context
 * @returns {Object} Device metrics state and methods
 */
export const useDeviceMetrics = () => {
	const context = useContext(DeviceMetricsContext);
	
	if (!context) {
		throw new Error('useDeviceMetrics must be used within DeviceMetricsProvider');
	}
	
	return context;
};

export default useDeviceMetrics;

