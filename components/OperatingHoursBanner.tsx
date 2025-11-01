import React from 'react';
import { RestaurantStatus } from '../types';

interface OperatingHoursBannerProps {
    status: RestaurantStatus;
    onViewHoursClick: () => void;
}

const OperatingHoursBanner: React.FC<OperatingHoursBannerProps> = ({ status, onViewHoursClick }) => {
    return (
        <div className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between my-6 max-w-md mx-auto">
            <div className="flex items-center">
                <svg className="w-8 h-8 text-gray-700 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <div>
                    <p className={`font-bold ${status.isOpen ? 'text-green-600' : 'text-red-600'}`}>
                        {status.statusText}
                    </p>
                    <p className="text-sm text-gray-500">{status.detailsText}</p>
                </div>
            </div>
            <button onClick={onViewHoursClick} className="text-red-600 font-bold text-sm hover:underline">
                VER HORÁRIOS
            </button>
        </div>
    );
};

export default OperatingHoursBanner;