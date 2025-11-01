import { MenuCategory, CustomizationOption, RestaurantStatus } from './types';

export const DELIVERY_FEE = 2.00;
export const RESTAURANT_WHATSAPP_NUMBER = '5537998260587';

export const operatingHours: { [key: number]: { open: string; close: string } | null } = {
    1: { open: '06:00', close: '13:30' }, // Monday
    2: { open: '06:00', close: '13:30' }, // Tuesday
    3: { open: '06:00', close: '13:30' }, // Wednesday
    4: { open: '06:00', close: '13:30' }, // Thursday
    5: { open: '06:00', close: '13:30' }, // Friday
    6: { open: '06:00', close: '13:30' }, // Saturday
    0: null, // Sunday
};


export const checkRestaurantStatus = (): RestaurantStatus => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();
    
    const parseTime = (time: string) => {
        const [hour, minute] = time.split(':').map(Number);
        return hour * 60 + minute;
    };

    const todayHours = operatingHours[dayOfWeek];

    // Check if open now
    if (todayHours) {
        const openTotalMinutes = parseTime(todayHours.open);
        const closeTotalMinutes = parseTime(todayHours.close);
        
        if (currentTotalMinutes >= openTotalMinutes && currentTotalMinutes < closeTotalMinutes) {
            return {
                isOpen: true,
                statusText: 'Aberto agora',
                detailsText: `Fecha hoje às ${todayHours.close}`,
            };
        }

        // It's a working day, but before opening hours
        if (currentTotalMinutes < openTotalMinutes) {
             return {
                isOpen: false,
                statusText: 'Fechado agora',
                detailsText: `Abre hoje às ${todayHours.open}`,
            };
        }
    }

    // It's closed. Find the next opening time.
    let nextOpenDayIndex = dayOfWeek;
    for (let i = 0; i < 7; i++) {
        nextOpenDayIndex = (dayOfWeek + 1 + i) % 7;
        if (operatingHours[nextOpenDayIndex]) {
            break;
        }
    }

    const nextDayHours = operatingHours[nextOpenDayIndex];
    if (!nextDayHours) { // Should not happen if at least one day is open
         return { isOpen: false, statusText: 'Fechado', detailsText: 'Fechado indefinidamente' };
    }
    
    const dayNames = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    
    let dayLabel = `na ${dayNames[nextOpenDayIndex]}`;
    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);
    if (nextOpenDayIndex === tomorrow.getDay()) {
        dayLabel = "amanhã";
    }

    return {
        isOpen: false,
        statusText: 'Fechado agora',
        detailsText: `Abre ${dayLabel} às ${nextDayHours.open}`,
    };
};


interface DailyMenu {
    menu: CustomizationOption[];
    salads: CustomizationOption[];
    meats: CustomizationOption[];
}

// Daily options for the Marmitex
const dailyMenus: { [key: number]: DailyMenu } = {
    1: { // Monday
        menu: [{ id: 101, name: 'Arroz', price: 0 }, { id: 102, name: 'Feijão de caldo', price: 0 }, { id: 103, name: 'Macarrão', price: 0 }, { id: 104, name: 'Abobrinha', price: 0 }],
        salads: [{ id: 201, name: 'Alface', price: 0 }, { id: 202, name: 'Beterraba', price: 0 }, { id: 203, name: 'Repolho', price: 0 }, { id: 204, name: 'Tomate', price: 0 }, { id: 205, name: 'Pepino', price: 0 }],
        meats: [{ id: 301, name: 'Sem carne', price: 0 }, { id: 302, name: 'Frango ao molho', price: 0 }, { id: 303, name: 'Frango frito', price: 0 }, { id: 304, name: 'Bife', price: 0 }]
    },
    2: { // Tuesday
        menu: [{ id: 101, name: 'Arroz', price: 0 }, { id: 102, name: 'Feijão de caldo', price: 0 }, { id: 105, name: 'Tropeiro', price: 0 }, { id: 103, name: 'Macarrão', price: 0 }, { id: 106, name: 'Chuchu', price: 0 }],
        salads: [{ id: 201, name: 'Alface', price: 0 }, { id: 202, name: 'Beterraba', price: 0 }, { id: 203, name: 'Repolho', price: 0 }, { id: 204, name: 'Tomate', price: 0 }, { id: 205, name: 'Pepino', price: 0 }],
        meats: [{ id: 301, name: 'Sem carne', price: 0 }, { id: 305, name: 'Castelão', price: 0 }, { id: 303, name: 'Frango frito', price: 0 }, { id: 306, name: 'Bife de pernil', price: 0 }, { id: 307, name: 'Frango Assado', price: 0 }]
    },
    3: { // Wednesday
        menu: [{ id: 101, name: 'Arroz', price: 0 }, { id: 102, name: 'Feijão de caldo', price: 0 }, { id: 107, name: 'Feijoada', price: 0 }, { id: 103, name: 'Macarrão', price: 0 }, { id: 108, name: 'Batata frita', price: 0 }, { id: 109, name: 'Moranga', price: 0 }],
        salads: [{ id: 201, name: 'Alface', price: 0 }, { id: 206, name: 'Couve', price: 0 }, { id: 207, name: 'Chuchu c/ cenoura', price: 0 }, { id: 204, name: 'Tomate', price: 0 }, { id: 208, name: 'Tabule', price: 0 }],
        meats: [{ id: 301, name: 'Sem carne', price: 0 }, { id: 303, name: 'Frango frito', price: 0 }, { id: 307, name: 'Frango Assado', price: 0 }]
    },
    4: { // Thursday
        menu: [{ id: 101, name: 'Arroz', price: 0 }, { id: 102, name: 'Feijão de caldo', price: 0 }, { id: 110, name: 'Tutu de feijão', price: 0 }, { id: 103, name: 'Macarrão', price: 0 }, { id: 111, name: 'Angu', price: 0 }, { id: 112, name: 'Jiló', price: 0 }],
        salads: [{ id: 201, name: 'Alface', price: 0 }, { id: 205, name: 'Pepino', price: 0 }, { id: 209, name: 'Couve flor c/ brócolis', price: 0 }, { id: 204, name: 'Tomate', price: 0 }, { id: 210, name: 'Cenoura c/ chuchu', price: 0 }, { id: 211, name: 'Abacaxi', price: 0 }],
        meats: [{ id: 301, name: 'Sem carne', price: 0 }, { id: 303, name: 'Frango frito', price: 0 }, { id: 307, name: 'Frango Assado', price: 0 }, { id: 304, name: 'Bife', price: 0 }]
    },
    5: { // Friday
        menu: [{ id: 101, name: 'Arroz', price: 0 }, { id: 102, name: 'Feijão de caldo', price: 0 }, { id: 107, name: 'Feijoada', price: 0 }, { id: 103, name: 'Macarrão', price: 0 }, { id: 108, name: 'Batata frita', price: 0 }, { id: 113, name: 'Salpicão', price: 0 }],
        salads: [{ id: 201, name: 'Alface', price: 0 }, { id: 206, name: 'Couve', price: 0 }, { id: 212, name: 'Beterraba ralada', price: 0 }, { id: 204, name: 'Tomate', price: 0 }],
        meats: [{ id: 301, name: 'Sem carne', price: 0 }, { id: 303, name: 'Frango frito', price: 0 }, { id: 302, name: 'Frango em molho', price: 0 }, { id: 304, name: 'Bife', price: 0 }, { id: 308, name: 'Linguiça', price: 0 }]
    },
    6: { // Saturday
        menu: [{ id: 101, name: 'Arroz', price: 0 }, { id: 102, name: 'Feijão de caldo', price: 0 }, { id: 107, name: 'Feijoada', price: 0 }, { id: 103, name: 'Macarrão', price: 0 }, { id: 114, name: 'Farofa', price: 0 }, { id: 113, name: 'Salpicão', price: 0 }],
        salads: [{ id: 201, name: 'Alface', price: 0 }, { id: 206, name: 'Couve', price: 0 }, { id: 204, name: 'Tomate', price: 0 }, { id: 213, name: 'Vinagrete', price: 0 }],
        meats: [{ id: 301, name: 'Sem carne', price: 0 }, { id: 303, name: 'Frango frito', price: 0 }, { id: 307, name: 'Frango Assado', price: 0 }, { id: 308, name: 'Linguiça', price: 0 }, { id: 309, name: 'Carne de porco', price: 0 }]
    }
};

const staticWaters: MenuCategory = {
    id: 'aguas',
    name: 'Águas',
    coverImage: 'https://i.imgur.com/8AIHAR8.jpeg',
    items: [
        { id: 11, name: 'Água sem Gás 500ml', description: '', image: 'https://i.imgur.com/HWrakNT.jpeg', price: 3.00 },
        { id: 12, name: 'Água com Gás 500ml', description: '', image: 'https://i.imgur.com/TIVLzUP.png', price: 4.00 },
    ]
};

const staticJuices: MenuCategory = {
    id: 'sucos',
    name: 'Sucos',
    coverImage: 'https://i.imgur.com/uKxcqeO.jpeg',
    items: [
         { id: 13, name: 'Suco Natural Laranja 500ml', description: 'Feito com laranjas frescas.', image: 'https://i.imgur.com/LAnD0wl.png', price: 7.00 },
         { id: 14, name: 'Suco Natural Limão 500ml', description: 'Refrescante e feito na hora.', image: 'https://i.imgur.com/uUYqr0Q.jpeg', price: 6.00 },
    ]
};

const staticSoftDrinks: MenuCategory = {
    id: 'refrigerantes',
    name: 'Refrigerantes',
    coverImage: 'https://i.imgur.com/QQNyAJw.jpg',
    items: [
        { id: 201, name: 'COCA-COLA 2L', description: '', image: 'https://i.imgur.com/qxQBA17.jpeg', price: 14.00 },
        { id: 202, name: 'COCA-COLA ZERO 2 LITROS', description: '', image: 'https://i.imgur.com/2Laipu8.png', price: 14.00 },
        { 
            id: 203, 
            name: 'REFRIGERantes 2L', 
            description: 'Escolha o seu sabor preferido.', 
            image: 'https://i.imgur.com/yukfYB5.jpeg', 
            price: 12.00,
            customizationGroups: [{
                id: 'sabor_2l',
                name: 'Sabor',
                min: 1,
                max: 1,
                options: [
                    { id: 601, name: 'Guarana', price: 0 },
                    { id: 602, name: 'Fanta Uva', price: 0 },
                    { id: 603, name: 'Fanta Laranja', price: 0 },
                    { id: 604, name: 'Sprite', price: 0 },
                    { id: 605, name: 'Pepsi', price: 0 }
                ]
            }]
        },
        { id: 206, name: 'H2O SABORES / SPRITE FRESH 500ML', description: 'H2O SABORES / SPRITE FRESH 500ML', image: 'https://i.imgur.com/7RxF1iF.png', price: 8.00 },
        { 
            id: 207, 
            name: 'REFRIGERANTES LATA 350ML', 
            description: 'Escolha o seu sabor preferido.', 
            image: 'https://i.imgur.com/qzJFVdu.png', 
            price: 6.00,
            customizationGroups: [{
                id: 'sabor_lata',
                name: 'Sabor',
                min: 1,
                max: 1,
                options: [
                    { id: 701, name: 'Coca', price: 0 },
                    { id: 702, name: 'Coca Zero', price: 0 },
                    { id: 703, name: 'Guarana', price: 0 },
                    { id: 704, name: 'Fanta Laranja', price: 0 },
                    { id: 705, name: 'Sprite', price: 0 },
                    { id: 706, name: 'Pepsi', price: 0 }
                ]
            }]
        },
        { 
            id: 212, 
            name: 'REFRI 600ML', 
            description: 'Escolha o seu sabor preferido.', 
            image: 'https://i.imgur.com/LTFpXtD.png', 
            price: 8.00,
            customizationGroups: [{
                id: 'sabor_600ml',
                name: 'Sabor',
                min: 1,
                max: 1,
                options: [
                    { id: 801, name: 'Coca', price: 0 },
                    { id: 802, name: 'Coca Zero', price: 0 },
                    { id: 803, name: 'Sprite', price: 0 },
                    { id: 804, name: 'Fanta Laranja', price: 0 }
                ]
            }]
        },
    ]
};

export const getMenuForDay = (day: number): MenuCategory[] => {
    const dayKey = [0, 7].includes(day) ? 1 : day; // Sunday (0) uses Monday's (1) menu
    const todayMenu = dailyMenus[dayKey] || dailyMenus[1];

    const marmitexCategory: MenuCategory = {
        id: 'monte-sua-marmitex',
        name: 'Monte sua Marmitex',
        coverImage: 'https://i.imgur.com/ctkdy1S.jpeg',
        items: [
            {
                id: 1,
                name: 'Marmitex a sua escolha',
                description: 'Escolha o tamanho, os acompanhamentos, salada e carne para montar a marmita perfeita para a sua fome.',
                image: 'https://i.imgur.com/D9sSqoo.jpeg',
                price: 21.00, // Base price is for the large one
                customizationGroups: [
                    {
                        id: 'tamanho',
                        name: 'Tamanho',
                        min: 1,
                        max: 1,
                        options: [
                            { id: 1001, name: 'Marmitex Grande', price: 0 },
                            { id: 1002, name: 'Marmitex Pequena', price: -3.00 }, // R$ 18.00
                        ]
                    },
                    { id: 'menu', name: 'Menu', min: 1, max: 5, options: todayMenu.menu },
                    { id: 'saladas', name: 'Saladas', min: 1, max: 5, options: todayMenu.salads },
                    { id: 'carnes', name: 'Carnes', min: 1, max: 2, options: todayMenu.meats } // This will be dynamically updated in the modal
                ]
            },
        ],
    };

    return [marmitexCategory, staticWaters, staticJuices, staticSoftDrinks];
};
