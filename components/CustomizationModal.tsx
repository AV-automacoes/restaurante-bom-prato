

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
            const currentGroupSelections = prev[group.name] || [];
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
        // Fix: Explicitly type `option` to resolve TypeScript error "Operator '+' cannot be applied to types 'unknown' and 'number'".
        // FIX: Explicitly typed 'option' as CustomizationOption to resolve TS error.
        const optionPrice = Object.values(selectedOptions).flat().reduce((acc, option: CustomizationOption) => acc + option.price, 0);
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

        // Fix: Explicitly type `opt` to resolve TypeScript error "Operator '+' cannot be applied to types 'unknown' and 'number'".
        // FIX: Explicitly typed 'opt' as CustomizationOption to resolve TS error.
        const totalCustomizationPrice = Object.values(selectedOptions).flat().reduce((acc, opt: CustomizationOption) => acc + opt.price, 0);
        const cartItemData = {
            id: item.id, name: item.name,