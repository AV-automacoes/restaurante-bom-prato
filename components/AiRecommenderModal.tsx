
import React, { useState } from 'react';
import { MenuCategory, AiRecommendation } from '../types';
import { getAiRecommendation } from '../services/geminiService';

interface AiRecommenderModalProps {
    menuData: MenuCategory[];
    onClose: () => void;
    onSelectRecommendation: (itemName: string) => void;
}

const AiRecommenderModal: React.FC<AiRecommenderModalProps> = ({ menuData, onClose, onSelectRecommendation }) => {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [recommendations, setRecommendations] = useState<AiRecommendation[]>([]);
    const [error, setError] = useState<string | null>(null);

    const handleGetRecommendation = async () => {
        if (!prompt.trim()) return;
        setIsLoading(true);
        setError(null);
        setRecommendations([]);
        try {
            const result = await getAiRecommendation(prompt, menuData);
            setRecommendations(result);
        } catch (err) {
            setError('Desculpe, não consegui pensar em uma recomendação. Tente novamente.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg transform transition-all duration-300 scale-95 animate-modal-in">
                <header className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center space-x-2">
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-purple-600">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
                        </svg>
                        <h2 className="text-xl font-bold text-gray-900">Chef's Assistant IA</h2>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200">
                        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </header>

                <div className="p-6">
                    <p className="text-gray-600 mb-4">Diga ao nosso assistente o que você está com vontade de comer e ele te dará uma sugestão!</p>
                    
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleGetRecommendation()}
                            placeholder="Ex: 'Algo vegetariano e picante'"
                            className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                            disabled={isLoading}
                        />
                        <button onClick={handleGetRecommendation} disabled={isLoading} className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold rounded-lg shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
                            {isLoading ? 'Pensando...' : 'Perguntar'}
                        </button>
                    </div>

                    <div className="mt-6 min-h-[150px]">
                        {isLoading && (
                            <div className="flex justify-center items-center h-full">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                            </div>
                        )}
                        {error && <p className="text-red-500 text-center">{error}</p>}
                        {recommendations.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="font-semibold">Aqui estão algumas sugestões para você:</h3>
                                {recommendations.map((rec, index) => (
                                    <div key={index} className="bg-gray-100 p-3 rounded-lg border border-gray-200">
                                        <button onClick={() => onSelectRecommendation(rec.name)} className="w-full text-left">
                                            <p className="font-bold text-purple-700 hover:underline">{rec.name}</p>
                                            <p className="text-sm text-gray-600 mt-1">{rec.reason}</p>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
             <style>{`
                @keyframes modal-in {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-modal-in {
                    animation: modal-in 0.2s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default AiRecommenderModal;
