import React from 'react';
import { Order, OrderStatus } from '../types';

interface OrderHistoryModalProps {
    orders: Order[];
    onClose: () => void;
    onReorder: (order: Order) => void;
    onViewOrder: (order: Order) => void;
}

const statusStyles: { [key in OrderStatus]: string } = {
    'Pedido realizado': 'bg-yellow-100 text-yellow-800',
    'Pedido aceito': 'bg-blue-100 text-blue-800',
    'Saiu para entrega': 'bg-indigo-100 text-indigo-800',
    'Pedido entregue': 'bg-green-100 text-green-800',
};

const OrderStatusBadge: React.FC<{ status: OrderStatus }> = ({ status }) => (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusStyles[status]}`}>
        {status}
    </span>
);

const OrderHistoryModal: React.FC<OrderHistoryModalProps> = ({ orders, onClose, onReorder, onViewOrder }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-100 rounded-xl shadow-2xl w-full max-w-lg flex flex-col h-[90vh] transform transition-all duration-300 scale-95 animate-modal-in">
                <header className="flex items-center justify-between p-4 border-b bg-white rounded-t-xl">
                    <h2 className="text-xl font-bold text-gray-900">Histórico de Pedidos</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200">
                        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </header>

                <div className="flex-grow overflow-y-auto p-4 space-y-4">
                    {orders.length === 0 ? (
                        <div className="text-center py-12 flex flex-col items-center h-full justify-center">
                            <p className="mt-4 text-gray-600 font-semibold">Você ainda não fez nenhum pedido.</p>
                            <p className="text-sm text-gray-500 mt-1">Seus pedidos recentes aparecerão aqui.</p>
                        </div>
                    ) : (
                        orders.map(order => (
                            <div key={order.id} className="bg-white p-4 rounded-lg shadow-sm">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-gray-800">Pedido {order.displayId}</p>
                                        <p className="text-sm text-gray-500">{order.date}</p>
                                        <div className="mt-2">
                                            <OrderStatusBadge status={order.status} />
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-lg text-gray-900">R$ {order.totalPrice.toFixed(2)}</p>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end items-center space-x-2">
                                    <button 
                                        onClick={() => onViewOrder(order)}
                                        className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-full hover:bg-gray-300 text-sm"
                                    >
                                        Ver Detalhes
                                    </button>
                                    <button 
                                        onClick={() => onReorder(order)}
                                        className="px-4 py-2 bg-red-600 text-white font-semibold rounded-full shadow-md hover:bg-red-700 text-sm"
                                    >
                                        Repedir
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
            <style>{`
                @keyframes modal-in {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-modal-in { animation: modal-in 0.2s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default OrderHistoryModal;