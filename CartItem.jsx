import React, { useMemo, memo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { removeItem, updateQuantity } from "../redux/CartSlice";
import "./CartItem.css";

/* =====================================================
   🧠 UTILITY FUNCTIONS (Reusable / Scalable)
===================================================== */

// Discount Logic
const calculateDiscount = (price, quantity) => {
    if (quantity >= 10) return price * quantity * 0.1;
    if (quantity >= 5) return price * quantity * 0.05;
    return 0;
};

// Tax Logic
const calculateTax = (amount) => amount * 0.08;

// Currency Formatter
const formatCurrency = (value) => `$${value.toFixed(2)}`;

// Clamp Quantity (Edge-case protection)
const clampQuantity = (qty) => Math.min(Math.max(qty, 1), 99);


/* =====================================================
   💾 LOCAL STORAGE (Persistence Layer)
===================================================== */

const saveCartToStorage = (cart) => {
    try {
        localStorage.setItem("cart", JSON.stringify(cart));
    } catch (err) {
        console.error("Storage Error:", err);
    }
};


/* =====================================================
   🧩 CART ITEM COMPONENT (Highly Optimized)
===================================================== */

const CartItem = memo(({ item }) => {
    const dispatch = useDispatch();

    // Memoized Calculations
    const { subtotal, discount, tax, total } = useMemo(() => {
        const safeQty = clampQuantity(item.quantity);
        const subtotal = item.price * safeQty;
        const discount = calculateDiscount(item.price, safeQty);
        const taxable = Math.max(subtotal - discount, 0);
        const tax = calculateTax(taxable);
        const total = taxable + tax;

        return { subtotal, discount, tax, total };
    }, [item.price, item.quantity]);

    return (
        <div className="cart-item-container" role="article">

            {/* 🌿 Image */}
            <div className="cart-item-image">
                <img
                    src={item.image || "https://via.placeholder.com/100"}
                    alt={item.name}
                    loading="lazy"
                />
            </div>

            {/* 📦 Info */}
            <div className="cart-item-details">
                <h3>{item.name}</h3>
                <p>{item.category || "General Plant"}</p>

                <p className="price">
                    Price: {formatCurrency(item.price)}
                </p>

                {/* 🔢 Quantity Controls */}
                <div className="quantity-controls">

                    <button
                        aria-label="Decrease quantity"
                        onClick={() =>
                            dispatch(updateQuantity({ id: item.id, type: "dec" }))
                        }
                        disabled={item.quantity <= 1}
                    >
                        −
                    </button>

                    <span>{item.quantity}</span>

                    <button
                        aria-label="Increase quantity"
                        onClick={() =>
                            dispatch(updateQuantity({ id: item.id, type: "inc" }))
                        }
                        disabled={item.quantity >= 99}
                    >
                        +
                    </button>
                </div>

                {/* 💰 Breakdown */}
                <div className="pricing">
                    <p>Subtotal: {formatCurrency(subtotal)}</p>

                    {discount > 0 && (
                        <p className="discount">
                            Discount: -{formatCurrency(discount)}
                        </p>
                    )}

                    <p>Tax: {formatCurrency(tax)}</p>

                    <h4 className="total">
                        Total: {formatCurrency(total)}
                    </h4>
                </div>

                {/* ❌ Remove */}
                <button
                    className="remove-btn"
                    onClick={() => dispatch(removeItem(item.id))}
                >
                    Remove Item
                </button>
            </div>
        </div>
    );
});


/* =====================================================
   📊 CART SUMMARY COMPONENT
===================================================== */

const CartSummary = ({ cart }) => {

    const summary = useMemo(() => {
        let subtotal = 0;
        let discount = 0;
        let tax = 0;

        cart.forEach((item) => {
            const itemSubtotal = item.price * item.quantity;
            const itemDiscount = calculateDiscount(item.price, item.quantity);
            const taxable = itemSubtotal - itemDiscount;
            const itemTax = calculateTax(taxable);

            subtotal += itemSubtotal;
            discount += itemDiscount;
            tax += itemTax;
        });

        const total = subtotal - discount + tax;

        return { subtotal, discount, tax, total };
    }, [cart]);

    return (
        <div className="cart-summary">

            <h3>🧾 Order Summary</h3>

            <p>Subtotal: {formatCurrency(summary.subtotal)}</p>
            <p>Discount: -{formatCurrency(summary.discount)}</p>
            <p>Tax: {formatCurrency(summary.tax)}</p>

            <h2>Total: {formatCurrency(summary.total)}</h2>

        </div>
    );
};


/* =====================================================
   🛒 MAIN CART COMPONENT
===================================================== */

const Cart = () => {
    const dispatch = useDispatch();
    const cart = useSelector((state) => state.cart.items);

    // Save cart to localStorage (auto persistence)
    useEffect(() => {
        saveCartToStorage(cart);
    }, [cart]);

    return (
        <div className="cart-container">

            <header>
                <h2>🛒 Your Cart</h2>
            </header>

            {/* 🌱 Empty State */}
            {cart.length === 0 && (
                <div className="empty-cart">
                    <p>Your cart is empty 🌿</p>
                </div>
            )}

            {/* 📦 Items */}
            <section>
                {cart.map((item) => (
                    <CartItem key={item.id} item={item} />
                ))}
            </section>

            {/* 📊 Summary */}
            {cart.length > 0 && (
                <CartSummary cart={cart} />
            )}

        </div>
    );
};

export default Cart;