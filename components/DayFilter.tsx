
import React from 'react';

interface DayFilterProps {
    selectedDay: number;
    onSelectDay: (day: number) => void;
}

const DayFilter: React.FC<DayFilterProps> = ({ selectedDay, onSelectDay }) => {
    const days = [
        { name: 'Segunda', value: 1 },
        { name: 'Terça', value: 2 },
        { name: 'Quarta', value: 3 },
        { name: 'Quinta', value: 4 },
        { name: 'Sexta', value: 5 },
        { name: 'Sábado', value: 6 },
    ];

    return (
        <div className="bg-white p-2 rounded-full shadow-md flex justify-center space-x-1 md:space-x-2 flex-wrap">
            {days.map(day => {
                 // Adjust for Sunday (0) defaulting to Monday's menu (1)
                const isSelected = selectedDay === day.value || (selectedDay === 0 && day.value === 1);
                return (
                    <button
                        key={day.value}
                        onClick={() => onSelectDay(day.value)}
                        className={`px-3 md:px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200 ${
                            isSelected ? 'bg-red-600 text-white shadow' : 'bg-transparent text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        {day.name}
                    </button>
                )
            })}
        </div>
    );
};

export default DayFilter;
