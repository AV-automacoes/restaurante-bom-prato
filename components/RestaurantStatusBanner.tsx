import React from 'react';

interface RestaurantStatusBannerProps {
    message: string;
    onDismiss: () => void;
}

const RestaurantStatusBanner: React.FC<RestaurantStatusBannerProps> = ({ message, onDismiss }) => {
    return (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
            <div className="flex">
                <div className="py-1">
                    <svg className="fill-current h-6 w-6 text-yellow-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-5.9V6h2v6.1h-2zM10 14a1 1 0 110-2 1 1 0 010 2z"/></svg>
                </div>
                <div className="flex-grow">
                    <p className="font-bold">Aviso</p>
                    <p>{message}</p>
                </div>
                <button onClick={onDismiss} className="p-1 self-start">
                     <svg className="fill-current h-6 w-6 text-yellow-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Fechar</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
                </button>
            </div>
        </div>
    );
};

export default RestaurantStatusBanner;
