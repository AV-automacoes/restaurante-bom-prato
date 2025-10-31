import React from 'react';

interface HeaderProps {
    onHistoryClick: () => void;
    onAiClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onHistoryClick, onAiClick }) => {
    return (
        <header className="bg-white shadow-sm sticky top-0 z-20 px-4 py-2">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
                <div className="flex items-center">
                     <img 
                        src="https://i.imgur.com/sdrYcvT.png" 
                        alt="Restaurante Bom Prato Logo" 
                        className="h-12 sm:h-16 w-auto transition-all"
                    />
                </div>
                <div className="flex items-center space-x-2">
                    <button onClick={onHistoryClick} className="p-2 rounded-full hover:bg-gray-200" aria-label="Histórico de Pedidos">
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-600">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                    </button>
                    <button onClick={onAiClick} className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-2" aria-label="Assistente do Chef">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
                        </svg>
                        <span>Chef's Assistant</span>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;