import React from 'react';
import { MenuCategory, MenuItem as MenuItemType } from '../types';
import MenuItem from './MenuItem';

interface MenuCategoryProps {
    category: MenuCategory;
    onAddItemClick: (item: MenuItemType) => void;
    isOpen: boolean;
}

const MenuCategoryComponent: React.FC<MenuCategoryProps> = ({ category, onAddItemClick, isOpen }) => {
    return (
        <section id={category.id} className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-2 border-b-4 border-red-500 inline-block">{category.name}</h2>
            {category.coverImage && (
                 <div className="w-full aspect-video rounded-lg my-4 overflow-hidden shadow-lg">
                    <img src={category.coverImage} alt={category.name} className="w-full h-full object-cover"/>
                 </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                {category.items.map(item => (
                    <MenuItem key={item.id} item={item} onAddItemClick={onAddItemClick} isOpen={isOpen} />
                ))}
            </div>
        </section>
    );
};

export default MenuCategoryComponent;