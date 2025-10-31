


import React, { useState, useMemo, useEffect } from 'react';
import { MenuItem, CartItem, CustomizationGroup, CustomizationOption } from '../types';

interface CustomizationModalProps {
    item: MenuItem;
    cartItemToEdit?: CartItem | null;
    onClose: () => void;
    onAddToCart: (item: CartItem) => void;
    onUpdateCart?: (item: CartItem) => void;
    onRemoveItem?: (cartItemId: string) => void;
    isOpen: boolean;
}

const CustomizationModal: React.FC<CustomizationModalProps> = ({ item, cartItemToEdit, onClose, onAddToCart, onUpdateCart, onRemoveItem, isOpen }) => {
    const isEditing = !!cartItemToEdit;
    const [quantity, setQuantity] = useState(1);
    const [notes, setNotes] = useState('');
    const [selectedOptions, setSelectedOptions] = useState<{ [key: string]: CustomizationOption[] }>({});

    useEffect(() => {
        if (isEditing && cartItemToEdit) {
            setQuantity(cartItemToEdit.quantity);
            setNotes(cartItemToEdit.notes || '');
            setSelectedOptions(cartItemToEdit.customizations);
        }
    }, [cartItemToEdit, isEditing]);
    
    const selectedSize = useMemo(() => {
        return selectedOptions['Tamanho']?.[0]?.name || 'Marmitex Grande';
    }, [selectedOptions]);

    useEffect(() => {
        if (!isEditing) {
            const maxMeats = selectedSize === 'Marmitex Grande' ? 2 : 1;
            const currentMeats = selectedOptions['Carnes'] || [];
            if (currentMeats.length > maxMeats) {
                setSelectedOptions(prev => ({ ...prev, 'Carnes': [] }));
            }
        }
    }, [selectedSize, selectedOptions, isEditing]);


    const handleOptionToggle = (group: CustomizationGroup, option: CustomizationOption) => {
        setSelectedOptions(prev => {
            // FIX: Explicitly type 'currentGroupSelections' to resolve type inference issue with index signature.
            const currentGroupSelections: CustomizationOption[] = prev[group.name] || [];
            const isSelected = currentGroupSelections.some(o => o.id === option.id);
            let newGroupSelections: CustomizationOption[] = [];
            
            const isRadio = group.max === 1;

            if (isSelected) {
                newGroupSelections = currentGroupSelections.filter(o => o.id !== option.id);
            } else {
                 if (isRadio) {
                    newGroupSelections = [option];
                } else {
                    const maxForGroup = group.name === 'Carnes' ? (selectedSize === 'Marmitex Grande' ? 2 : 1) : group.max;
                    
                    const semCarneOption = group.options.find(o => o.name === 'Sem carne');
                    if (semCarneOption && option.id === semCarneOption.id) {
                         newGroupSelections = [option];
                    } else {
                         const selectionsWithoutSemCarne = currentGroupSelections.filter(o => o.id !== semCarneOption?.id);
                        if (selectionsWithoutSemCarne.length < maxForGroup) {
                            newGroupSelections = [...selectionsWithoutSemCarne, option];
                        } else {
                           return prev;
                        }
                    }
                }
            }
            return { ...prev, [group.name]: newGroupSelections };
        });
    };

    const { subtotal, areAllRulesMet } = useMemo(() => {
        const allOptions: CustomizationOption[] = Object.values(selectedOptions).flat();
        const optionPrice = allOptions.reduce((acc: number, option: CustomizationOption) => acc + option.price, 0);
        const singleItemPrice = item.price + optionPrice;
        
        const allRulesMet = item.customizationGroups?.every(group => {
            const selectionCount = selectedOptions[group.name]?.length || 0;
            const max = group.name === 'Carnes' ? (selectedSize === 'Marmitex Grande' ? 2 : 1) : group.max;
            return selectionCount >= group.min && selectionCount <= max;
        }) ?? true;

        return { subtotal: singleItemPrice * quantity, areAllRulesMet: allRulesMet };
    }, [item, quantity, selectedOptions, selectedSize]);

    const handleSubmit = () => {
        if (!areAllRulesMet || !isOpen) return;

        const allOptions: CustomizationOption[] = Object.values(selectedOptions).flat();
        const totalCustomizationPrice = allOptions.reduce((acc: number, opt: CustomizationOption) => acc + opt.price, 0);
        
        const cartItemData = {
            id: item.id, name: item.name, image: item.image, quantity, notes,
            basePrice: item.price,
            totalPrice: item.price + totalCustomizationPrice,
            customizations: selectedOptions,
        };

        if (isEditing) {
            if (!onUpdateCart || !cartItemToEdit) return;
            onUpdateCart({ ...cartItemToEdit, ...cartItemData });
        } else {
            onAddToCart({ cartItemId: `${item.id}-${Date.now()}`, ...cartItemData });
        }
    };

    const handleRemoveClick = () => {
        if (isEditing && onRemoveItem && cartItemToEdit) {
            onRemoveItem(cartItemToEdit.cartItemId);
        }
    };
    
    const shouldDisplayGroup = (group: CustomizationGroup) => {
        if (item.id === 1 && group.name !== 'Tamanho' && !selectedOptions['Tamanho']?.length) {
            return false;
        }
        return true;
    };


    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col h-[90vh] transform transition-all duration-300 scale-95 animate-modal-in">
                <header className="relative">
                    <img src={item.image || 'https://i.imgur.com/J1a98yC.jpeg'} alt={item.name} className="w-full h-48 object-cover rounded-t-xl" />
                    <button onClick={onClose} className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-md hover:bg-gray-200">
                        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                    <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/60 to-transparent rounded-b-t-xl">
                        <h2 className="text-2xl font-bold text-white shadow-lg">{item.name}</h2>
                    </div>
                </header>

                <div className="flex-grow overflow-y-auto p-6 space-y-6">
                    {item.customizationGroups?.filter(shouldDisplayGroup).map(group => {
                        const maxForGroup = group.name === 'Carnes' ? (selectedSize === 'Marmitex Grande' ? 2 : 1) : group.max;
                        const isRadioForGroup = group.name === 'Carnes' ? selectedSize !== 'Marmitex Grande' : group.max === 1;

                        const selectionCount = selectedOptions[group.name]?.length || 0;
                        const ruleMet = selectionCount >= group.min && selectionCount <= maxForGroup;

                        return (
                            <div key={group.id}>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-800">{group.name}</h3>
                                        <p className="text-sm text-gray-500">{group.min === maxForGroup ? `Escolha ${group.min} opção.` : `De ${group.min} até ${maxForGroup} opções.`}</p>
                                    </div>
                                     {ruleMet ? (
                                        <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                    ) : (
                                        <span className="text-sm font-semibold bg-gray-200 text-gray-700 rounded-full px-2 py-0.5">{selectionCount}/{maxForGroup}</span>
                                    )}
                                </div>
                                <div className="space-y-2 mt-3">
                                    {group.options.map(option => {
                                        const isSelected = selectedOptions[group.name]?.some(o => o.id === option.id) || false;
                                        return (
                                            <div key={option.id} onClick={() => handleOptionToggle(group, option)} className={`flex justify-between items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${isSelected ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white hover:border-red-300'}`}>
                                                <div>
                                                    <p className={`font-semibold ${isSelected ? 'text-red-600' : 'text-gray-800'}`}>{option.name}</p>
                                                    {option.price > 0 && <p className="text-sm text-green-600 font-medium">+ R$ {option.price.toFixed(2)}</p>}
                                                    {option.price < 0 && <p className="text-sm text-red-600 font-medium">- R$ {Math.abs(option.price).toFixed(2)}</p>}
                                                </div>
                                                <div className={`w-6 h-6 flex items-center justify-center border-2 ${isSelected ? 'bg-red-500 border-red-500' : 'border-gray-300'} ${isRadioForGroup ? 'rounded-full' : 'rounded-md'}`}>
                                                    {isSelected && <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )
                    })}
                     <div className="mt-6">
                        <label htmlFor="notes" className="text-lg font-semibold text-gray-800">Observações</label>
                        <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ex: sem cebola, etc." className="w-full mt-2 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500" rows={2}></textarea>
                    </div>
                </div>

                <footer className="p-4 bg-gray-50 rounded-b-xl border-t">
                    <div className="flex items-center justify-between space-x-3">
                        <div className="flex items-center space-x-3">
                            <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 font-bold w-8 h-8 flex items-center justify-center">-</button>
                            <span className="text-xl font-bold w-8 text-center">{quantity}</span>
                            <button onClick={() => setQuantity(q => q + 1)} className="p-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 font-bold w-8 h-8 flex items-center justify-center">+</button>
                        </div>
                        
                        {isEditing ? (
                            <div className="flex items-center space-x-3 flex-grow">
                                <button onClick={handleRemoveClick} className="px-4 py-3 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300 transition-colors">
                                    Remover
                                </button>
                                <button onClick={handleSubmit} disabled={!areAllRulesMet || !isOpen} className="flex-grow px-6 py-3 bg-red-600 text-white font-bold rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed">
                                    {isOpen ? `Atualizar R$ ${subtotal.toFixed(2)}` : 'Restaurante Fechado'}
                                </button>
                            </div>
                        ) : (
                            <button onClick={handleSubmit} disabled={!areAllRulesMet || !isOpen} className="px-6 py-3 bg-red-600 text-white font-bold rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 flex-grow disabled:bg-gray-400 disabled:cursor-not-allowed">
                                {isOpen ? `Adicionar R$ ${subtotal.toFixed(2)}` : 'Restaurante Fechado'}
                            </button>
                        )}
                    </div>
                </footer>
            </div>
            <style>{`
                @keyframes modal-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
                .animate-modal-in { animation: modal-in 0.2s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default CustomizationModal;
