import React from 'react';

interface HeaderProps {
    cartItemCount: number;
    onCartClick: () => void;
    searchQuery: string;
    onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const Header: React.FC<HeaderProps> = ({ cartItemCount, onCartClick, searchQuery, onSearchChange }) => {

    return (
        <header 
            className="relative bg-cover bg-center text-white"
            style={{ backgroundImage: "url('https://i.imgur.com/U6pr3zc.jpeg')" }}
        >
            <div className="absolute inset-0 bg-black bg-opacity-60"></div>
            
            <div className="relative max-w-4xl mx-auto px-4 py-10 flex flex-col items-center justify-center text-center">
                
                <button 
                    onClick={onCartClick} 
                    className="absolute top-4 right-4 bg-red-600 rounded-full w-14 h-14 flex items-center justify-center shadow-lg"
                    aria-label="Ver carrinho"
                >
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 S100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    {cartItemCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-white text-red-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold border-2 border-red-600">{cartItemCount}</span>
                    )}
                </button>

                <div className="rounded-full w-44 h-44 overflow-hidden border-4 border-white shadow-xl mb-4">
                     <img src="https://i.imgur.com/bim6QJs.png" alt="Logo Restaurante Bom Prato" className="w-full h-full object-cover transform scale-150" />
                </div>

                <h1 className="text-4xl font-bold text-white drop-shadow-lg mb-6">Restaurante Bom Prato</h1>

                <div className="relative w-full max-w-lg">
                    <input
                        type="text"
                        placeholder="Procurar..."
                        value={searchQuery}
                        onChange={onSearchChange}
                        className="w-full bg-white/95 text-gray-800 pl-12 pr-4 py-4 rounded-full shadow-lg focus:ring-2 focus:ring-red-500 focus:outline-none placeholder-gray-500"
                    />
                     <svg className="w-6 h-6 text-gray-500 absolute left-4 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>

            </div>
        </header>
    );
};

export default Header;
