import React from 'react';

interface HeaderProps {
    onHistoryClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onHistoryClick }) => {
    return (
        <header className="bg-white shadow-sm sticky top-0 z-20 px-4 py-2">
            <div className="max-w-4xl mx-auto flex items-center justify-center relative h-16 sm:h-20">
                <div className="flex items-center">
                     <img 
                        src="https://i.imgur.com/sdrYcvT.png" 
                        alt="Restaurante Bom Prato Logo" 
                        className="h-14 sm:h-16 w-auto"
                    />
                </div>
                <div className="absolute right-0 top-1/2 -translate-y-1/2">
                    <button onClick={onHistoryClick} className="p-2 rounded-full hover:bg-gray-200" aria-label="Histórico de Pedidos">
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-600">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
