import React from 'react';
import { operatingHours } from '../constants';

interface OperatingHoursModalProps {
    onClose: () => void;
}

const OperatingHoursModal: React.FC<OperatingHoursModalProps> = ({ onClose }) => {
    const days = [
        { name: 'Segunda', value: 1 },
        { name: 'Terça', value: 2 },
        { name: 'Quarta', value: 3 },
        { name: 'Quinta', value: 4 },
        { name: 'Sexta', value: 5 },
        { name: 'Sábado', value: 6 },
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm transform transition-all duration-300 scale-95 animate-modal-in" onClick={(e) => e.stopPropagation()}>
                <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">Horários de atendimento</h2>
                    
                    <div className="space-y-3">
                        {days.map(day => {
                            const hours = operatingHours[day.value];
                            return (
                                <div key={day.value} className="bg-gray-100 p-3 rounded-lg flex justify-between items-center">
                                    <span className="font-semibold text-gray-700">{day.name}</span>
                                    <span className="font-mono text-gray-900">{hours ? `${hours.open} - ${hours.close}` : 'Fechado'}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="p-4 border-t border-gray-200">
                     <button 
                        onClick={onClose}
                        className="w-full py-3 text-red-600 font-bold rounded-lg hover:bg-red-50"
                    >
                        FECHAR
                    </button>
                </div>
            </div>
            <style>{`
                @keyframes modal-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
                .animate-modal-in { animation: modal-in 0.2s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default OperatingHoursModal;