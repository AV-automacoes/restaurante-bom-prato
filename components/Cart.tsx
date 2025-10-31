
import React from 'react';

interface CartProps {
    totalItems: number;
    totalPrice: number;
    onViewCartClick: () => void;
}

const Cart: React.FC<CartProps> = ({ totalItems, totalPrice, onViewCartClick }) => {
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-top z-30 p-4 transform animate-slide-up">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={onViewCartClick}
                    className="w-full flex justify-between items-center bg-red-600 text-white rounded-lg px-6 py-4 shadow-lg hover:bg-red-700 transition-colors"
                >
                    <div className="flex items-center space-x-3">
                        <div className="relative">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                            <span className="absolute -top-2 -right-2 bg-white text-red-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">{totalItems}</span>
                        </div>
                        <span className="font-semibold text-lg">Ver Carrinho</span>
                    </div>
                    <span className="font-bold text-lg">R$ {totalPrice.toFixed(2)}</span>
                </button>
            </div>
            <style>{`
                @keyframes slide-up {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }
                .animate-slide-up {
                    animation: slide-up 0.3s ease-out forwards;
                }
                .shadow-top {
                    box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.1), 0 -2px 4px -1px rgba(0, 0, 0, 0.06);
                }
            `}</style>
        </div>
    );
};

export default Cart;
