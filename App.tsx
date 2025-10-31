import React, { useState, useMemo, useEffect } from 'react';
import { getMenuForDay, DELIVERY_FEE, RESTAURANT_WHATSAPP_NUMBER, checkRestaurantStatus } from './constants';
import { CartItem, MenuItem as MenuItemType, Order, OrderStatus, PaymentMethod, CustomerInfo, DeliveryType, OrderStatusUpdate, CustomizationOption } from './types';
import Header from './components/Header';
import Cart from './components/Cart';
import CustomizationModal from './components/CustomizationModal';
import CartModal from './components/CartModal';
import OrderHistoryModal from './components/OrderHistoryModal';
import OrderStatusPage from './components/OrderStatusPage';
import DayFilter from './components/DayFilter';
import MenuCategoryComponent from './components/MenuCategory';
import RestaurantStatusBanner from './components/RestaurantStatusBanner';

const generateWhatsAppMessage = (order: Order): string => {
    let message = `✅ *SEU PEDIDO FOI CONFIRMADO*, e está aguardando produção!\n`;
    message += `Acompanhe abaixo o seu pedido\n\n`;

    // Customer Info
    message += `👤 *${order.customerInfo.name}*\n`;
    message += `📞 ${order.customerInfo.phone}\n`;
    message += `💵 ${order.payment.method}\n`;
    
    // Address
    if (order.deliveryType === 'Entrega') {
        let address = `🏡 ${order.customerInfo.streetAndNumber} - ${order.customerInfo.neighborhood}`;
        message += `${address}\n`;
        let additionalInfo = [];
        if (order.customerInfo.apartmentDetails) additionalInfo.push(order.customerInfo.apartmentDetails);
        if (order.customerInfo.landmark) additionalInfo.push(order.customerInfo.landmark);
        if (additionalInfo.length > 0) {
            message += `• ${additionalInfo.join(' • ')}\n`;
        }
    } else {
        message += `🏡 Retirada no local\n`;
    }
    message += `\n`;

    // Items
    message += `»————-« *ITENS* »————-«\n`;
    order.items.forEach(item => {
        const itemTotal = item.totalPrice * item.quantity;
        message += `● *${item.quantity}x ${item.name}* (R$ ${itemTotal.toFixed(2)})\n`;

        const groupedCustomizations: { [key: string]: CustomizationOption[] } = {};
        Object.entries(item.customizations).forEach(([groupName, options]) => {
            if (!groupedCustomizations[groupName]) {
                groupedCustomizations[groupName] = [];
            }
            groupedCustomizations[groupName].push(...options);
        });
        
        Object.entries(groupedCustomizations).forEach(([groupName, options]) => {
            if (options.length > 0) {
                 if (groupName.toLowerCase() !== 'tamanho') {
                    message += ` ↳ *${groupName}:*\n`;
                }
                options.forEach(opt => {
                    const prefix = groupName.toLowerCase() === 'tamanho' ? '' : `*1x* `;
                    const priceString = opt.price > 0 ? ` (R$ ${opt.price.toFixed(2)})` : '';
                    message += `  ↳ ${prefix}${opt.name}${priceString}\n`;
                });
            }
        });
        
        if (item.notes) {
            message += `  ↳ *Observações:* ${item.notes}\n`;
        }
    });
    message += `\n`;

    // Total
    message += `»————-« *Total* »————-«\n`;
    if (order.deliveryType === 'Entrega') {
        message += `*Taxa de Entrega:* R$ ${order.deliveryFee.toFixed(2)}\n`;
    }
    message += `*Valor Total:* R$ ${order.totalPrice.toFixed(2)}\n`;

    if (order.payment.method === 'Dinheiro' && order.payment.cashForChange && order.payment.cashForChange > order.totalPrice) {
        const change = order.payment.cashForChange - order.totalPrice;
        message += `*Troco para:* R$ ${order.payment.cashForChange.toFixed(2)}\n`;
        message += `*Troco:* R$ ${change.toFixed(2)}\n`;
    }
    
    if (order.payment.method === 'Pix') {
        message += `\n*Aguardando pagamento via PIX.*\n`;
        message += `*Chave PIX:* ${RESTAURANT_WHATSAPP_NUMBER}\n`;
    }


    return message;
};


const sendNotification = (title: string, options: NotificationOptions) => {
    if (!('Notification' in window)) return;
    if (Notification.permission === "granted") new Notification(title, options);
    else if (Notification.permission !== "denied") Notification.requestPermission().then(p => { if (p === "granted") new Notification(title, options); });
}

interface PixConfirmationModalProps {
    pixKey: string;
    onClose: () => void;
}

const PixConfirmationModal: React.FC<PixConfirmationModalProps> = ({ pixKey, onClose }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(pixKey).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm text-center p-6 transform transition-all duration-300 scale-95 animate-modal-in">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Pagamento com Pix</h2>
                <p className="text-gray-600 mb-4">
                    😀 Por gentileza, efetue o pagamento para a chave PIX abaixo e nos envie o comprovante pelo WhatsApp. 🤝🏻
                </p>
                
                <div className="bg-gray-100 p-3 rounded-lg flex items-center justify-between space-x-2">
                    <span className="font-mono text-gray-700 break-all">{pixKey}</span>
                    <button 
                        onClick={handleCopy}
                        className="px-3 py-1 bg-gray-200 text-gray-800 text-sm font-semibold rounded-md hover:bg-gray-300"
                    >
                        {copied ? 'Copiado!' : 'Copiar'}
                    </button>
                </div>

                <button 
                    onClick={onClose}
                    className="w-full mt-6 py-3 bg-red-600 text-white font-bold rounded-lg shadow-md hover:bg-red-700"
                >
                    Entendido
                </button>
            </div>
            <style>{`
                @keyframes modal-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
                .animate-modal-in { animation: modal-in 0.2s ease-out forwards; }
            `}</style>
        </div>
    );
};


const App: React.FC = () => {
    const [selectedDay, setSelectedDay] = useState(new Date().getDay());
    const menuData = useMemo(() => getMenuForDay(selectedDay), [selectedDay]);
    
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [selectedItem, setSelectedItem] = useState<MenuItemType | null>(null);
    const [editingCartItem, setEditingCartItem] = useState<CartItem | null>(null);
    const [isCustomizationModalOpen, setIsCustomizationModalOpen] = useState(false);
    const [isCartModalOpen, setIsCartModalOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    
    const [orderHistory, setOrderHistory] = useState<Order[]>([]);
    const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
    const [pixOrder, setPixOrder] = useState<Order | null>(null); // State for Pix modal
    const [searchQuery, setSearchQuery] = useState('');

    const [restaurantStatus, setRestaurantStatus] = useState(checkRestaurantStatus());
    const [isBannerVisible, setIsBannerVisible] = useState(true);

    useEffect(() => {
        const statusCheckInterval = setInterval(() => {
            const newStatus = checkRestaurantStatus();
            if (newStatus.isOpen !== restaurantStatus.isOpen) {
                setRestaurantStatus(newStatus);
                setIsBannerVisible(true); // Show banner again if status changes
            }
        }, 60000); // Check every minute

        return () => clearInterval(statusCheckInterval);
    }, [restaurantStatus.isOpen]);


    useEffect(() => {
        try {
            const storedHistory = localStorage.getItem('orderHistory');
            if (storedHistory) setOrderHistory(JSON.parse(storedHistory));
        } catch (error) {
            console.error("Failed to parse order history:", error);
        }
    }, []);
    
    const updateOrderInStateAndStorage = (updatedOrder: Order) => {
        const updatedHistory = orderHistory.map(o => o.id === updatedOrder.id ? updatedOrder : o);
        setOrderHistory(updatedHistory);
        localStorage.setItem('orderHistory', JSON.stringify(updatedHistory));
        if (viewingOrder?.id === updatedOrder.id) {
            setViewingOrder(updatedOrder);
        }
    };
    
    const updateOrderStatus = (orderId: string, status: OrderStatus) => {
        const orderToUpdate = orderHistory.find(o => o.id === orderId) || (viewingOrder?.id === orderId ? viewingOrder : null);
        if (orderToUpdate) {
            const newStatusUpdate: OrderStatusUpdate = { status, timestamp: Date.now() };
            const lastStatus = orderToUpdate.statusHistory.slice(-1)[0]?.status;
            if (lastStatus === status) return;

            const updatedOrder: Order = {
                ...orderToUpdate,
                status: status,
                statusHistory: [...orderToUpdate.statusHistory, newStatusUpdate],
            };
            updateOrderInStateAndStorage(updatedOrder);

            let body = '';
            switch(status) {
                case 'Pedido aceito': body = 'Seu pedido foi aceito e já está em produção!'; break;
                case 'Saiu para entrega': body = 'Seu pedido saiu para entrega!'; break;
                case 'Pedido entregue': body = 'Seu pedido foi entregue! Bom apetite!'; break;
                default: return;
            }
            sendNotification(`Pedido ${orderToUpdate.displayId}`, { body });
        }
    };
    
    const handleSaveRating = (orderId: string, rating: number, review: string) => {
        const orderToUpdate = orderHistory.find(o => o.id === orderId);
        if (orderToUpdate) {
            const updatedOrder: Order = { ...orderToUpdate, rating, review };
            updateOrderInStateAndStorage(updatedOrder);
        }
    };

    const handleAddItemClick = (item: MenuItemType) => {
        if (!restaurantStatus.isOpen) return;
        setSelectedItem(item);
        setIsCustomizationModalOpen(true);
    };

    const handleCloseCustomizationModal = () => {
        setIsCustomizationModalOpen(false);
        setSelectedItem(null);
        setEditingCartItem(null);
    };

    const handleAddToCart = (item: CartItem) => {
        setCartItems(prev => [...prev, item]);
        handleCloseCustomizationModal();
    };
    
    const handleUpdateCartItem = (updatedItem: CartItem) => {
        setCartItems(prev => prev.map(item => item.cartItemId === updatedItem.cartItemId ? updatedItem : item));
        handleCloseCustomizationModal();
    };

    const handleUpdateCartItemQuantity = (cartItemId: string, newQuantity: number) => {
        setCartItems(prev => newQuantity <= 0 
            ? prev.filter(i => i.cartItemId !== cartItemId)
            : prev.map(i => i.cartItemId === cartItemId ? { ...i, quantity: newQuantity } : i));
    };

    const handleRemoveCartItem = (cartItemId: string) => {
        setCartItems(prev => prev.filter(i => i.cartItemId !== cartItemId));
        if (editingCartItem?.cartItemId === cartItemId) {
            handleCloseCustomizationModal();
        }
    };
    
    const handleEditItem = (cartItem: CartItem) => {
        const allItems = menuData.flatMap(c => c.items);
        const originalMenuItem = allItems.find(i => i.id === cartItem.id);
        if (originalMenuItem) {
            setSelectedItem(originalMenuItem);
            setEditingCartItem(cartItem);
            setIsCartModalOpen(false);
            setIsCustomizationModalOpen(true);
        }
    };

    const calculateCartTotals = (acc: { totalItems: number; subtotal: number }, item: CartItem) => {
        acc.totalItems += item.quantity;
        acc.subtotal += item.totalPrice * item.quantity;
        return acc;
    };

    const { totalItems, subtotal } = useMemo(() => cartItems.reduce(calculateCartTotals, { totalItems: 0, subtotal: 0 }), [cartItems]);

    const handleCheckout = async (details: { payment: { method: PaymentMethod; cashForChange?: number }, customerInfo: CustomerInfo, deliveryType: DeliveryType }) => {
        if (cartItems.length === 0 || !restaurantStatus.isOpen) return;

        if ('Notification' in window && Notification.permission === 'default') await Notification.requestPermission();

        const now = Date.now();
        const deliveryFee = details.deliveryType === 'Entrega' ? DELIVERY_FEE : 0;
        const newOrder: Order = {
            id: now.toString(),
            displayId: `#${Math.floor(100000 + Math.random() * 900000)}`,
            date: new Date(now).toLocaleString('pt-BR'),
            items: cartItems,
            totalPrice: subtotal + deliveryFee,
            deliveryFee,
            status: 'Pedido realizado',
            statusHistory: [{ status: 'Pedido realizado', timestamp: now }],
            estimatedDeliveryTime: now + 35 * 60 * 1000,
            ...details
        };

        const updatedHistory = [newOrder, ...orderHistory].slice(0, 10);
        setOrderHistory(updatedHistory);
        localStorage.setItem('orderHistory', JSON.stringify(updatedHistory));
        
        // Simulate order progression
        setTimeout(() => updateOrderStatus(newOrder.id, 'Pedido aceito'), 15000);
        if (newOrder.deliveryType === 'Entrega') setTimeout(() => updateOrderStatus(newOrder.id, 'Saiu para entrega'), 45000);
        setTimeout(() => updateOrderStatus(newOrder.id, 'Pedido entregue'), 90000);

        const message = generateWhatsAppMessage(newOrder);
        window.open(`https://wa.me/${RESTAURANT_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');

        setCartItems([]);
        setIsCartModalOpen(false);
        
        if (newOrder.payment.method === 'Pix') {
            setPixOrder(newOrder);
        } else {
            setViewingOrder(newOrder);
        }
    };
    
    const handleReorder = (order: Order) => {
        setCartItems(prev => [...prev, ...order.items.map(i => ({...i, cartItemId: `${i.id}-${Date.now()}`}))]);
        setViewingOrder(null);
        setIsHistoryModalOpen(false);
        setIsCartModalOpen(true);
    };

    const filteredMenuData = useMemo(() => {
        if (!searchQuery) return menuData;
        const lowerQuery = searchQuery.toLowerCase();
        return menuData.map(category => ({
            ...category,
            items: category.items.filter(item => 
                item.name.toLowerCase().includes(lowerQuery) || 
                item.description.toLowerCase().includes(lowerQuery)
            )
        })).filter(category => category.items.length > 0);
    }, [menuData, searchQuery]);
    
    const dayNames = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
    const currentDayName = dayNames[selectedDay];

    if (viewingOrder) {
        return <OrderStatusPage order={viewingOrder} onReturnToMenu={() => setViewingOrder(null)} onSaveRating={handleSaveRating} />;
    }

    return (
        <div className="font-sans antialiased text-gray-800 pb-28">
            <Header
                onHistoryClick={() => setIsHistoryModalOpen(true)}
            />
            
            {isBannerVisible && !restaurantStatus.isOpen && (
                <RestaurantStatusBanner message={restaurantStatus.message} onDismiss={() => setIsBannerVisible(false)} />
            )}
            
            <main className="max-w-4xl mx-auto p-4">
                 <div className="flex justify-center mb-6">
                    <DayFilter selectedDay={selectedDay} onSelectDay={setSelectedDay} />
                </div>

                <h2 className="text-2xl font-bold mb-2 text-center text-gray-800">Cardápio de {currentDayName}</h2>

                <div className="relative mb-6 max-w-lg mx-auto">
                    <input
                        type="text"
                        placeholder="Buscar no cardápio..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white pl-10 pr-4 py-3 border border-gray-300 rounded-full shadow-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                    />
                    <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
                
                {filteredMenuData.length > 0 ? (
                    filteredMenuData.map(category => (
                        <MenuCategoryComponent key={category.id} category={category} onAddItemClick={handleAddItemClick} isOpen={restaurantStatus.isOpen} />
                    ))
                ) : (
                    <div className="text-center py-12">
                        <p className="text-gray-600 font-semibold">Nenhum item encontrado.</p>
                        <p className="text-sm text-gray-500 mt-1">Tente uma busca diferente.</p>
                    </div>
                )}
            </main>

            {cartItems.length > 0 && <Cart totalItems={totalItems} totalPrice={subtotal} onViewCartClick={() => setIsCartModalOpen(true)} />}
            {isCustomizationModalOpen && selectedItem && (
                <CustomizationModal 
                    item={selectedItem}
                    cartItemToEdit={editingCartItem}
                    onClose={handleCloseCustomizationModal}
                    onAddToCart={handleAddToCart}
                    onUpdateCart={handleUpdateCartItem}
                    onRemoveItem={handleRemoveCartItem}
                    isOpen={restaurantStatus.isOpen}
                />
            )}
            {isCartModalOpen && <CartModal cartItems={cartItems} onClose={() => setIsCartModalOpen(false)} onUpdateQuantity={handleUpdateCartItemQuantity} onRemoveItem={handleRemoveCartItem} onEditItem={handleEditItem} totalPrice={subtotal} onCheckout={handleCheckout} orderHistory={orderHistory} isOpen={restaurantStatus.isOpen} />}
            {isHistoryModalOpen && <OrderHistoryModal orders={orderHistory} onClose={() => setIsHistoryModalOpen(false)} onReorder={handleReorder} onViewOrder={(order) => { setIsHistoryModalOpen(false); setViewingOrder(order); }} />}
            {pixOrder && (
                <PixConfirmationModal 
                    pixKey={RESTAURANT_WHATSAPP_NUMBER}
                    onClose={() => {
                        setViewingOrder(pixOrder);
                        setPixOrder(null);
                    }} 
                />
            )}
        </div>
    );
};

export default App;
