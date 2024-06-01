import React, { useRef, useEffect } from 'react';

const PayPalButton = ({ amount, onSuccess }) => {
    const paypalRef = useRef();

    useEffect(() => {
        window.paypal.Buttons({
            createOrder: (data, actions) => {
                return actions.order.create({
                    purchase_units: [
                        {
                            amount: {
                                value: amount, // El monto a pagar
                            },
                        },
                    ],
                });
            },
            onApprove: (data, actions) => {
                return actions.order.capture().then(details => {
                    onSuccess(details);
                });
            },
            onError: (err) => {
                console.error("PayPal Checkout onError", err);
            },
        }).render(paypalRef.current);
    }, []);

    return <div ref={paypalRef}></div>;
};

export default PayPalButton;
