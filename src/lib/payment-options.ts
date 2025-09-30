// TODO: Fill with real plan details
export const AFFILIATE_PLANS = [
    {
        id: 'tarjeta-saludable',
        name: "Tarjeta Saludable",
        subtitle: "Individual + 2 Beneficiarios",
        price: 150, // Annual
        affiliationFee: 0,
        installmentOptions: [
            { type: 'cuotas', count: 3, amount: 50 },
            { type: 'mensual', count: 12, amount: 10 }
        ]
    },
    {
        id: 'fondo-espiritu-santo',
        name: "Fondo Espíritu Santo",
        subtitle: "Grupos de 200–500 afiliados",
        price: 250, // Annual
        coverageBenefit: "Garantiza una cobertura del 15% del monto total.",
        installmentOptions: [
            { type: 'cuotas', count: 4, amount: 62.50 }
        ]
    },
];

// TODO: Fill with real account info and add logos to /public/payments/
export const PAYMENT_METHODS = [
    {
        id: 'banvenez',
        label: 'Banco de Venezuela',
        description: 'Pago Móvil o Transferencia',
        accountInfo: 'CI: 12.345.678, Tel: 0414-1234567, RIF: J-12345678-9',
        logoSrc: '/payments/banvenez.svg',
    },
    {
        id: 'mercantil',
        label: 'Mercantil',
        description: 'Transferencia Bancaria',
        accountInfo: 'Cta: 0105-0123-4567-8901-2345',
        logoSrc: '/payments/mercantil.svg',
    },
    {
        id: 'bnc',
        label: 'BNC',
        description: 'Transferencia Bancaria',
        accountInfo: 'Cta: 0191-0123-4567-8901-2345',
        logoSrc: '/payments/bnc.svg',
    },
    {
        id: 'banesco',
        label: 'Banesco',
        description: 'Transferencia Bancaria',
        accountInfo: 'Cta: 0134-0123-4567-8901-2345',
        logoSrc: '/payments/banesco.svg',
    },
    {
        id: 'usdt',
        label: 'USDT (Binance)',
        description: 'Pago con Criptomonedas',
        accountInfo: 'Alias: urovital.pay',
        logoSrc: '/payments/usdt.svg',
    },
    {
        id: 'wallytech',
        label: 'Wally Tech',
        description: 'Pasarela de Pago',
        accountInfo: 'Alias: urovital',
        logoSrc: '/payments/wallytech.svg',
    },
    {
        id: 'zinlli',
        label: 'Zinli',
        description: 'Billetera Digital',
        accountInfo: 'Email: pagos@urovital.com',
        logoSrc: '/payments/zinli.svg',
    },
    {
        id: 'paypal',
        label: 'PayPal',
        description: 'Pagos Internacionales',
        accountInfo: 'Email: paypal@urovital.com',
        logoSrc: '/payments/paypal.svg',
    }
];
