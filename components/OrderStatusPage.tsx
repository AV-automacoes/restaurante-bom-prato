

import React, { useState } from 'react';
import { Order, OrderStatus, CustomizationOption, CartItem } from '../types';

interface OrderStatusPageProps {
    order: Order;
    onReturnToMenu: () => void;
    onSaveRating: (orderId: string, rating: number, review: string) => void;
}

const allStatuses: OrderStatus[] = ['Pedido realizado', 'Pedido aceito', 'Saiu para entrega', 'Pedido entregue'];

const StatusTimeline: React.FC<{ order: Order }> = ({ order }) => {
    const statusesToDisplay = order.deliveryType === 'Retirada'
        ? allStatuses.filter(s => s !== 'Saiu para entrega')
        : allStatuses;
    
    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                 <h2 className="text-xl font-bold">Status</h2>
                 {order.estimatedDeliveryTime && order.status !== 'Pedido entregue' && (
                     <div className="text-sm text-gray-600 font-semibold">
                         <span className="font-normal">{order.deliveryType === 'Entrega' ? 'Previsão de entrega' : 'Previsão de retirada'}: </span> 
                         {new Date(order.estimatedDeliveryTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                 )}
            </div>
            <div className="flex flex-col">
                {statusesToDisplay.map((status, index) => {
                    const statusUpdate = order.statusHistory.find(h => h.status === status);
                    const isCompleted = !!statusUpdate;
                    const isLast = index === statusesToDisplay.length - 1;

                    return (
                        <div key={status} className="flex">
                            <div className="flex flex-col items-center mr-4">
                                <div>
                                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${isCompleted ? 'bg-red-500' : 'bg-gray-300'}`}>
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                </div>
                                {!isLast && <div className={`w-0.5 h-12 ${isCompleted ? 'bg-red-500' : 'bg-gray-300'}`}></div>}
                            </div>
                            <div className="pb-12">
                                <p className={`font-semibold ${isCompleted ? 'text-gray-800' : 'text-gray-500'}`}>{status === 'Pedido entregue' && order.deliveryType === 'Retirada' ? 'Pronto para retirada' : status}</p>
                                {isCompleted && statusUpdate && (
                                     <p className="text-sm text-gray-500">
                                        {new Date(statusUpdate.timestamp).toLocaleDateString('pt-BR')}, {new Date(statusUpdate.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const StarRating: React.FC<{ rating: number, setRating: (r: number) => void }> = ({ rating, setRating }) => {
    return (
        <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <svg
                    key={star}
                    onClick={() => setRating(star)}
                    className={`w-8 h-8 cursor-pointer ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            ))}
        </div>
    );
};

const OrderStatusPage: React.FC<OrderStatusPageProps> = ({ order, onReturnToMenu, onSaveRating }) => {
    const [rating, setRating] = useState(order.rating || 0);
    const [review, setReview] = useState(order.review || '');
    const [isRatingSubmitted, setIsRatingSubmitted] = useState(!!order.rating);

    const handleRatingSubmit = () => {
        if (rating === 0) {
            alert("Por favor, selecione uma nota.");
            return;
        }
        onSaveRating(order.id, rating, review);
        setIsRatingSubmitted(true);
    };
    
    const subtotal = order.items.reduce((acc: number, item: CartItem) => acc + (item.totalPrice * item.quantity), 0);
    
    const formattedAddress = () => {
        const { streetAndNumber, neighborhood, apartmentDetails, landmark } = order.customerInfo;
        let fullAddress = `${streetAndNumber}, ${neighborhood}`;
        if (apartmentDetails) fullAddress += ` - ${apartmentDetails}`;
        if (landmark) fullAddress += ` (${landmark})`;
        return fullAddress;
    };

    return (
        <div className="bg-gray-100 min-h-screen font-sans">
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-2xl mx-auto p-4 flex items-center">
                    <button onClick={onReturnToMenu} className="mr-4 p-2 rounded-full hover:bg-gray-200">
                        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <div>
                        <span className="text-sm font-semibold text-gray-500">POP</span>
                        <h1 className="text-2xl font-bold">Pedido {order.displayId}</h1>
                    </div>
                </div>
            </header>

            <main className="max-w-2xl mx-auto p-4 space-y-4">
                <div className="bg-white rounded-lg shadow p-6">
                    <StatusTimeline order={order} />
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold mb-4">Cliente</h2>
                    <div className="flex items-start space-x-3">
                        <div className="p-2 bg-red-100 rounded-full">
                           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-red-600">
                               <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                           </svg>
                        </div>
                        <div>
                            <p className="font-semibold text-gray-800">{order.customerInfo.name}</p>
                            {order.deliveryType === 'Entrega' && <p className="text-gray-600">{formattedAddress()}</p>}
                            <p className="text-gray-600">{order.customerInfo.phone}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold mb-4">Itens do pedido</h2>
                    <div className="space-y-3">
                        {order.items.map(item => (
                            <div key={item.cartItemId} className="border-b pb-3 last:border-b-0">
                                <div className="flex justify-between font-semibold">
                                    <p>{item.quantity}x {item.name}</p>
                                    <p>R$ {(item.basePrice * item.quantity).toFixed(2)}</p>
                                </div>
                                <div className="pl-4 text-sm text-gray-600">
                                    
                                    {Object.values(item.customizations).flat().map((opt: CustomizationOption) => (
                                        <div key={opt.id} className="flex justify-between">
                                            <span>- {opt.name}</span>
                                            {opt.price > 0 && <span>+ R$ {opt.price.toFixed(2)}</span>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold mb-4">Pagamento</h2>
                     <div className="space-y-2">
                        <div className="flex justify-between"><span className="text-gray-600">Tipo</span><span className="font-semibold">{order.deliveryType}</span></div>
                        <div className="flex justify-between"><span className="text-gray-600">Pagamento</span><span className="font-semibold">{order.payment.method}</span></div>
                        {order.deliveryType === 'Entrega' && <div className="flex justify-between"><span className="text-gray-600">Taxa de entrega</span><span>R$ {order.deliveryFee.toFixed(2)}</span></div>}
                        <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span>R$ {subtotal.toFixed(2)}</span></div>
                        <div className="flex justify-between"><span className="text-gray-600">Desconto</span><span>R$ 0,00</span></div>
                        <div className="border-t my-2"></div>
                        <div className="flex justify-between font-bold text-lg"><span >Total</span><span>R$ {order.totalPrice.toFixed(2)}</span></div>
                    </div>
                </div>
                
                {order.status === 'Pedido entregue' && (
                    <div className="bg-white rounded-lg shadow p-6">
                         <h2 className="text-xl font-bold mb-2">Avaliação</h2>
                         {isRatingSubmitted ? (
                            <div className="text-center py-4">
                               <p className="font-semibold text-green-600">Obrigado pela sua avaliação!</p>
                            </div>
                         ) : (
                             <div className="space-y-4">
                                <div>
                                    <p className="font-semibold mb-2">Qual a nota para esse pedido?</p>
                                    <StarRating rating={rating} setRating={setRating} />
                                </div>
                                <div>
                                    <p className="font-semibold mb-2">Como foi sua experiência?</p>
                                    <textarea value={review} onChange={(e) => setReview(e.target.value)} placeholder="Escreva aqui sua avaliação..." className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500" rows={3}></textarea>
                                </div>
                                <button onClick={handleRatingSubmit} className="w-full py-3 bg-red-600 text-white font-bold rounded-lg shadow-md hover:bg-red-700">Enviar Avaliação</button>
                            </div>
                         )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default OrderStatusPage;
