

import React, { useState, useMemo, useEffect } from 'react';
import { CartItem, CustomerInfo, PaymentMethod, DeliveryType, Order, CustomizationOption } from '../types';
import { DELIVERY_FEE } from '../constants';

interface CartModalProps {
    cartItems: CartItem[];
    onClose: () => void;
    onUpdateQuantity: (itemId: string, newQuantity: number) => void;
    onRemoveItem: (itemId: string) => void;
    onEditItem: (item: CartItem) => void;
    totalPrice: number;
    onCheckout: (details: { payment: { method: PaymentMethod; cashForChange?: number }, customerInfo: CustomerInfo, deliveryType: DeliveryType }) => void;
    orderHistory: Order[];
    isOpen: boolean;
}

type LookupStatus = 'idle' | 'loading' | 'valid' | 'invalid_format' | 'not_found';

const PaymentOption: React.FC<{ method: PaymentMethod, selected: boolean, onClick: () => void, icon: React.ReactNode }> = ({ method, selected, onClick, icon }) => (
    <div
        onClick={onClick}
        className={`p-3 border-2 rounded-lg cursor-pointer flex flex-col items-center justify-center space-y-2 transition-all ${selected ? 'border-red-600 bg-red-50' : 'border-gray-300 bg-white hover:border-red-400'}`}
    >
        {icon}
        <span className={`font-semibold text-sm ${selected ? 'text-red-700' : 'text-gray-700'}`}>{method}</span>
    </div>
);


const CartModal: React.FC<CartModalProps> = ({ cartItems, onClose, onUpdateQuantity, onRemoveItem, onEditItem, totalPrice, onCheckout, orderHistory, isOpen }) => {
    const [deliveryType, setDeliveryType] = useState<DeliveryType>('Entrega');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
    const [cashAmount, setCashAmount] = useState<string>('');
    const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({ name: '', phone: '', streetAndNumber: '', neighborhood: '', apartmentDetails: '', landmark: '' });
    const [error, setError] = useState<string>('');
    
    // State for order lookup
    const [orderLookupId, setOrderLookupId] = useState('');
    const [lookupStatus, setLookupStatus] = useState<LookupStatus>('idle');
    const [foundOrder, setFoundOrder] = useState<Order | null>(null);

    // Debounced effect for real-time validation
    useEffect(() => {
        const handler = setTimeout(() => {
            if (!orderLookupId) {
                setLookupStatus('idle');
                return;
            }
            
            setLookupStatus('loading');
            
            const formatRegex = /^#\d{6}$/;
            if (!formatRegex.test(orderLookupId)) {
                setLookupStatus('invalid_format');
                return;
            }
            
            const order = orderHistory.find(o => o.displayId === orderLookupId);
            if (order) {
                setFoundOrder(order);
                setLookupStatus('valid');
            } else {
                setFoundOrder(null);
                setLookupStatus('not_found');
            }
        }, 500); // 500ms debounce

        return () => {
            clearTimeout(handler);
        };
    }, [orderLookupId, orderHistory]);
    
    const handleLoadOrderData = () => {
        if (foundOrder) {
            setCustomerInfo(foundOrder.customerInfo);
            setOrderLookupId('');
            setLookupStatus('idle');
        }
    };

    const handleCustomerInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setCustomerInfo({ ...customerInfo, [e.target.name]: e.target.value });
    };
    
    const currentDeliveryFee = useMemo(() => deliveryType === 'Entrega' ? DELIVERY_FEE : 0, [deliveryType]);
    const finalTotal = useMemo(() => totalPrice + currentDeliveryFee, [totalPrice, currentDeliveryFee]);

    const validateAndCheckout = () => {
        if (!isOpen) {
            setError('O restaurante está fechado no momento.');
            return;
        }
        setError('');
        
        if (deliveryType === 'Entrega' && (!customerInfo.streetAndNumber || !customerInfo.neighborhood)) {
            setError('Por favor, preencha a rua, número e bairro para entrega.');
            return;
        }

        if (!customerInfo.name || !customerInfo.phone) {
            setError('Por favor, preencha seu nome e telefone.');
            return;
        }

        if (!paymentMethod) {
            setError('Por favor, selecione uma forma de pagamento.');
            return;
        }

        let cashForChange: number | undefined = undefined;
        if (paymentMethod === 'Dinheiro') {
            const amount = parseFloat(cashAmount.replace(',', '.'));
            if (cashAmount && (isNaN(amount) || amount < finalTotal)) {
                setError('Para pagamento em dinheiro, informe um valor igual ou maior que o total do pedido.');
                return;
            }
             if (cashAmount && !isNaN(amount)) {
                cashForChange = amount;
            }
        }
        onCheckout({ payment: { method: paymentMethod, cashForChange }, customerInfo, deliveryType });
    };

    const paymentIcons: { [key in PaymentMethod]: React.ReactNode } = {
        'Dinheiro': <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
        'Cartão de Débito': <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H4a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
        'Cartão de Crédito': <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H4a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
        'Pix': <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
    };

    const LookupStatusIndicator = () => {
        switch (lookupStatus) {
            case 'loading':
                return <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>;
            case 'valid':
                return <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>;
            case 'invalid_format':
            case 'not_found':
                return <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
            default:
                return null;
        }
    };
    
    const getLookupMessage = () => {
        switch (lookupStatus) {
            case 'invalid_format':
                return 'Formato inválido. Use #123456.';
            case 'not_found':
                return 'Pedido não encontrado.';
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-50 rounded-xl shadow-2xl w-full max-w-lg flex flex-col h-[90vh] transform transition-all duration-300 scale-95 animate-modal-in">
                <header className="relative flex items-center justify-between p-4 border-b bg-white rounded-t-xl">
                    <h2 className="text-xl font-bold text-gray-900">{cartItems.length > 0 ? 'Seu Carrinho' : 'Carrinho Vazio'}</h2>
                    <button onClick={onClose} className="absolute right-4 p-2 rounded-full hover:bg-gray-200">
                        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </header>

                 <div className="flex-grow overflow-y-auto p-4 space-y-3">
                    {cartItems.length > 0 ? cartItems.map(item => (
                        <div key={item.cartItemId} className="bg-white p-3 rounded-lg shadow-sm">
                            <div className="flex items-start space-x-3">
                                <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-md" />
                                <div className="flex-grow">
                                    <p className="font-bold text-gray-800">{item.name}</p>
                                    <div className="text-xs text-gray-500 space-y-0.5 mt-1">
                                    {/* FIX: Explicitly type `options` to resolve "Property 'map' does not exist on type 'unknown'" error. */}
                                    {Object.entries(item.customizations).flatMap(([groupName, options]: [string, CustomizationOption[]]) => 
                                        options.map(opt => <p key={opt.id}>{opt.name}</p>)
                                    )}
                                    {item.notes && <p>Obs: {item.notes}</p>}
                                    </div>
                                    <button onClick={() => onEditItem(item)} className="text-xs font-semibold text-red-600 hover:underline mt-1">
                                        Editar
                                    </button>
                                </div>
                                <div className="flex flex-col items-end">
                                     <p className="font-semibold text-gray-800">R$ {(item.totalPrice * item.quantity).toFixed(2)}</p>
                                     <div className="flex items-center space-x-2 mt-2">
                                        <button onClick={() => onUpdateQuantity(item.cartItemId, item.quantity - 1)} className="p-1 rounded-full bg-gray-200 text-gray-600 w-6 h-6 flex items-center justify-center">-</button>
                                        <span className="font-bold text-sm w-4 text-center">{item.quantity}</span>
                                        <button onClick={() => onUpdateQuantity(item.cartItemId, item.quantity + 1)} className="p-1 rounded-full bg-gray-200 text-gray-600 w-6 h-6 flex items-center justify-center">+</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-12">
                            <p className="text-gray-600 font-semibold">Seu carrinho está vazio.</p>
                            <button onClick={onClose} className="mt-4 text-red-600 font-semibold">Voltar ao cardápio</button>
                        </div>
                    )}
                 </div>

                {cartItems.length > 0 && (
                <div className="flex-grow overflow-y-auto p-4 space-y-6 border-t">
                    {/* Delivery/Pickup Toggle */}
                    <div className="bg-gray-200 p-1 rounded-full grid grid-cols-2 gap-1">
                         <button onClick={() => setDeliveryType('Entrega')} className={`w-full py-2 rounded-full text-sm font-semibold ${deliveryType === 'Entrega' ? 'bg-white text-red-600 shadow' : 'text-gray-600'}`}>Entrega</button>
                         <button onClick={() => setDeliveryType('Retirada')} className={`w-full py-2 rounded-full text-sm font-semibold ${deliveryType === 'Retirada' ? 'bg-white text-red-600 shadow' : 'text-gray-600'}`}>Retirada</button>
                    </div>

                    {/* Order Lookup Section */}
                    <div className="space-y-2">
                        <p className="font-semibold text-gray-700 text-sm">Já pediu antes? Carregue seus dados.</p>
                        <div className="relative">
                           <input 
                                type="text" 
                                value={orderLookupId}
                                onChange={(e) => setOrderLookupId(e.target.value)}
                                placeholder="Digite o número do pedido (ex: #123456)" 
                                className="w-full p-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                           />
                           <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                <LookupStatusIndicator />
                           </div>
                        </div>
                        {getLookupMessage() && <p className="text-xs text-red-600">{getLookupMessage()}</p>}
                        {lookupStatus === 'valid' && (
                            <button onClick={handleLoadOrderData} className="w-full text-sm py-2 px-4 bg-green-100 text-green-800 font-semibold rounded-lg hover:bg-green-200">
                                Usar dados deste pedido
                            </button>
                        )}
                    </div>

                    {/* Address Section */}
                    {deliveryType === 'Entrega' && (
                        <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
                            <div className="flex items-start space-x-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500 mt-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                                <div className="w-full space-y-4">
                                    <div>
                                        <label htmlFor="streetAndNumber" className="block text-xs font-medium text-gray-500">Rua e Número</label>
                                        <input type="text" name="streetAndNumber" id="streetAndNumber" value={customerInfo.streetAndNumber} onChange={handleCustomerInfoChange} placeholder="Ex: Rua das Flores, 123" className="mt-1 block w-full bg-transparent border-0 border-b-2 border-gray-200 focus:ring-0 focus:border-red-500 p-0"/>
                                    </div>
                                    <div>
                                        <label htmlFor="neighborhood" className="block text-xs font-medium text-gray-500">Bairro</label>
                                        <input type="text" name="neighborhood" id="neighborhood" value={customerInfo.neighborhood} onChange={handleCustomerInfoChange} placeholder="Ex: Centro" className="mt-1 block w-full bg-transparent border-0 border-b-2 border-gray-200 focus:ring-0 focus:border-red-500 p-0"/>
                                    </div>
                                    <div>
                                        <label htmlFor="apartmentDetails" className="block text-xs font-medium text-gray-500">Apto / Número</label>
                                        <input type="text" name="apartmentDetails" id="apartmentDetails" value={customerInfo.apartmentDetails} onChange={handleCustomerInfoChange} placeholder="Ex: Apto 101, Bloco B" className="mt-1 block w-full bg-transparent border-0 border-b-2 border-gray-200 focus:ring-0 focus:border-red-500 p-0"/>
                                    </div>
                                    <div>
                                        <label htmlFor="landmark" className="block text-xs font-medium text-gray-500">Ponto de Referência</label>
                                        <input type="text" name="landmark" id="landmark" value={customerInfo.landmark} onChange={handleCustomerInfoChange} placeholder="Ex: Próximo ao supermercado" className="mt-1 block w-full bg-transparent border-0 border-b-2 border-gray-200 focus:ring-0 focus:border-red-500 p-0"/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Customer Data Section */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-lg text-gray-800">Seus Dados</h3>
                        <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-xs font-medium text-gray-500">Nome completo</label>
                                <input type="text" name="name" id="name" value={customerInfo.name} onChange={handleCustomerInfoChange} className="mt-1 block w-full bg-transparent border-0 border-b-2 border-gray-200 focus:ring-0 focus:border-red-500 p-0"/>
                            </div>
                             <div>
                                <label htmlFor="phone" className="block text-xs font-medium text-gray-500">Telefone</label>
                                <input type="tel" name="phone" id="phone" value={customerInfo.phone} onChange={handleCustomerInfoChange} className="mt-1 block w-full bg-transparent border-0 border-b-2 border-gray-200 focus:ring-0 focus:border-red-500 p-0"/>
                            </div>
                        </div>
                    </div>

                    {/* Payment Method Section */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-lg text-gray-800">Método de pagamento</h3>
                        <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
                            <p className="font-semibold text-red-600 border-b-2 border-red-600 pb-2 inline-block">Pague na entrega</p>
                            <div className="grid grid-cols-2 gap-3">
                                {(['Dinheiro', 'Cartão de Débito', 'Cartão de Crédito', 'Pix'] as PaymentMethod[]).map(method => (
                                    <PaymentOption 
                                        key={method}
                                        method={method}
                                        selected={paymentMethod === method}
                                        onClick={() => setPaymentMethod(method)}
                                        icon={paymentIcons[method]}
                                    />
                                ))}
                            </div>
                            {paymentMethod === 'Dinheiro' && (
                                <div className="mt-3">
                                    <label htmlFor="cash" className="block text-sm font-medium text-gray-700">Troco para quanto? (Opcional)</label>
                                    <input type="text" id="cash" value={cashAmount} onChange={(e) => setCashAmount(e.target.value)} placeholder="Ex: 50,00" className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"/>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                )}

                {cartItems.length > 0 && (
                    <footer className="p-4 bg-white rounded-b-xl border-t">
                        <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Subtotal</span>
                                <span>R$ {totalPrice.toFixed(2)}</span>
                            </div>
                            {deliveryType === 'Entrega' && (
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Taxa de Entrega</span>
                                    <span>R$ {currentDeliveryFee.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-bold text-lg text-gray-800">
                                <span>Total</span>
                                <span>R$ {finalTotal.toFixed(2)}</span>
                            </div>
                        </div>
                        {error && <p className="text-red-500 text-sm text-center mb-2">{error}</p>}
                        
                        <button onClick={validateAndCheckout} disabled={!isOpen} className="w-full py-3 bg-red-600 text-white font-bold rounded-lg shadow-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
                            {isOpen ? 'Finalizar Pedido' : 'Restaurante Fechado'}
                        </button>
                    </footer>
                )}
            </div>
             <style>{`
                @keyframes modal-in {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-modal-in {
                    animation: modal-in 0.2s ease-out forwards;
                }
                /* Hide scrollbar for Chrome, Safari and Opera */
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                /* Hide scrollbar for IE, Edge and Firefox */
                .no-scrollbar {
                    -ms-overflow-style: none;  /* IE and Edge */
                    scrollbar-width: none;  /* Firefox */
                }
                input:focus, textarea:focus {
                    outline: none;
                }
            `}</style>
        </div>
    );
};

export default CartModal;