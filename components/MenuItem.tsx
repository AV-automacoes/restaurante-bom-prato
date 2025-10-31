import React from 'react';
import { MenuItem as MenuItemType } from '../types';

interface MenuItemProps {
    item: MenuItemType;
    onAddItemClick: (item: MenuItemType) => void;
    isOpen: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({ item, onAddItemClick, isOpen }) => {
    const placeholderImage = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=880&q=80';
    const imageUrl = item.image || placeholderImage;

    return (
        <div 
            className={`bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 flex flex-col ${isOpen ? 'cursor-pointer hover:shadow-xl hover:scale-[1.02]' : 'opacity-70'}`}
            onClick={() => isOpen && onAddItemClick(item)}
        >
            <div className="aspect-[4/3] w-full overflow-hidden">
                 <img src={imageUrl} alt={item.name} className="w-full h-full object-cover" />
            </div>
            
            <div className="p-4 flex flex-col flex-grow">
                <div className="flex-grow">
                    <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
                    <p className="text-gray-600 mt-1 text-sm">{item.description}</p>
                </div>
                <div className="flex justify-between items-center mt-4">
                     <p className="text-lg font-semibold text-gray-800">
                        R$ {item.price.toFixed(2)}
                    </p>
                    <button 
                        className="bg-red-500 text-white font-bold py-2 px-4 rounded-full text-sm hover:bg-red-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                        onClick={(e) => { e.stopPropagation(); onAddItemClick(item); }}
                        disabled={!isOpen}
                    >
                        Adicionar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MenuItem;