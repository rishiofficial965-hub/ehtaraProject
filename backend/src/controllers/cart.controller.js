import cartModel from "../model/cart.model.js";
import productModel from "../model/product.model.js";
import { createOrder, verifySignature } from "../services/payment.service.js";
import paymentModel from "../model/payment.model.js";
import userModel from "../model/user.model.js";
import { sendEmail } from "../utils/sendEmail.js";
import { orderConfirmationTemplate } from "../utils/orderConfirmationTemplate.js";

function buildCartResponse(populatedCart) {
  // Filter out any items that refer to deleted products (where product is null/undefined)
  const validItems = populatedCart.items.filter((item) => item.product != null);

  // Map items to include their LIVE price from the product variants
  const itemsWithLivePrice = validItems.map((item) => {
    const cartItem = item.toObject ? item.toObject() : item;

    // 1. Try to find the specific variant price
    const currentVariant = item.product.variants?.find(
      (v) => v._id.toString() === item.variant?.toString(),
    );

    // 2. Determine the live price: Variant Price > Base Product Price > Stored Snapshot
    const livePrice =
      currentVariant?.price || item.product.price || cartItem.price;

    return {
      ...cartItem,
      price: livePrice,
    };
  });

  const totalAmount = itemsWithLivePrice.reduce(
    (total, item) => total + item.price.amount * item.quantity,
    0,
  );
  const totalItems = itemsWithLivePrice.reduce(
    (total, item) => total + item.quantity,
    0,
  );
  return {
    ...populatedCart.toObject(),
    items: itemsWithLivePrice,
    totalAmount,
    totalItems,
  };
}

// ─── Add to Cart ──────────────────────────────────────────────────────────────
export const addToCart = async (req, res) => {
  try {
    const { productId, varientId } = req.params;
    const quantity = Number(req.body.quantity) || 1;

    // Fetch product + confirm the variant belongs to it
    const product = await productModel.findOne({
      _id: productId,
      "variants._id": varientId,
    });

    if (!product) {
      return res
        .status(404)
        .json({ error: "Product or variant not found", success: false });
    }

    const selectedVariant = product.variants.find(
      (v) => v._id.toString() === varientId,
    );

    // Should never be falsy after the query above, but guard anyway
    if (!selectedVariant) {
      return res
        .status(404)
        .json({ error: "Variant not found", success: false });
    }

    if (selectedVariant.stock < quantity) {
      return res
        .status(400)
        .json({ error: "Insufficient stock", success: false });
    }

    // Upsert cart
    let cart = await cartModel.findOne({ user: req.user._id });
    if (!cart) {
      cart = await cartModel.create({ user: req.user._id, items: [] });
    }

    const existingItem = cart.items.find(
      (item) =>
        item.product.toString() === productId &&
        item.variant.toString() === varientId,
    );

    if (existingItem) {
      if (selectedVariant.stock < existingItem.quantity + quantity) {
        return res.status(400).json({
          error: "Total quantity exceeds available stock",
          success: false,
        });
      }
      existingItem.quantity += quantity;
    } else {
      // BUG FIX: fallback to "" to satisfy the `required: true` image field in cart model
      const image =
        selectedVariant.images?.[0]?.url || product.images?.[0]?.url || "";

      cart.items.push({
        product: productId,
        variant: varientId,
        quantity,
        price: selectedVariant.price,
        image,
      });
    }

    await cart.save();

    const populatedCart = await cartModel
      .findById(cart._id)
      .populate("items.product");

    return res.status(201).json({
      success: true,
      cart: buildCartResponse(populatedCart),
    });
  } catch (error) {
    console.error("AddToCart error:", error);
    return res.status(500).json({ error: error.message, success: false });
  }
};

// ─── Get Cart ─────────────────────────────────────────────────────────────────
export const getCart = async (req, res) => {
  try {
    const cart = await cartModel
      .findOne({ user: req.user._id })
      .populate("items.product");

    if (!cart) {
      return res.status(200).json({
        success: true,
        cart: { items: [], totalAmount: 0, totalItems: 0 },
      });
    }

    // Clean up items where product has been deleted from database
    const originalLength = cart.items.length;
    cart.items = cart.items.filter((item) => item.product != null);
    if (cart.items.length !== originalLength) {
      await cart.save();
    }

    return res.status(200).json({
      success: true,
      cart: buildCartResponse(cart),
    });
  } catch (error) {
    console.error("GetCart error:", error);
    return res.status(500).json({ error: error.message, success: false });
  }
};

// ─── Update Quantity ──────────────────────────────────────────────────────────
export const updateQuantity = async (req, res) => {
  try {
    const { productId, varientId } = req.params;
    const quantity = Number(req.body.quantity);

    if (isNaN(quantity)) {
      return res
        .status(400)
        .json({ error: "quantity must be a number", success: false });
    }

    const cart = await cartModel.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ error: "Cart not found", success: false });
    }

    // quantity ≤ 0 → treat as remove
    if (quantity <= 0) {
      cart.items = cart.items.filter(
        (item) =>
          !(
            item.product.toString() === productId &&
            item.variant.toString() === varientId
          ),
      );
    } else {
      const item = cart.items.find(
        (item) =>
          item.product.toString() === productId &&
          item.variant.toString() === varientId,
      );

      if (!item) {
        return res
          .status(404)
          .json({ error: "Item not found in cart", success: false });
      }

      // BUG FIX: productModel.findById can return null — guard before accessing .variants
      const product = await productModel.findById(productId);
      if (!product) {
        return res
          .status(404)
          .json({ error: "Product not found", success: false });
      }

      const variant = product.variants.id(varientId);
      if (!variant) {
        return res
          .status(404)
          .json({ error: "Product variant not found", success: false });
      }

      if (variant.stock < quantity) {
        return res.status(400).json({
          error: `Insufficient stock. Only ${variant.stock} units available.`,
          success: false,
        });
      }

      item.quantity = quantity;
    }

    await cart.save();

    const populatedCart = await cartModel
      .findById(cart._id)
      .populate("items.product");

    return res.status(200).json({
      success: true,
      cart: buildCartResponse(populatedCart),
    });
  } catch (error) {
    console.error("UpdateQuantity error:", error);
    return res.status(500).json({ error: error.message, success: false });
  }
};

// ─── Remove From Cart ─────────────────────────────────────────────────────────
export const removeFromCart = async (req, res) => {
  try {
    const { productId, varientId } = req.params;

    const cart = await cartModel.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ error: "Cart not found", success: false });
    }

    const prevLength = cart.items.length;
    cart.items = cart.items.filter(
      (item) =>
        !(
          item.product.toString() === productId &&
          item.variant.toString() === varientId
        ),
    );

    // BUG FIX: if nothing was removed, the item was not in the cart
    if (cart.items.length === prevLength) {
      return res
        .status(404)
        .json({ error: "Item not found in cart", success: false });
    }

    await cart.save();

    const populatedCart = await cartModel
      .findById(cart._id)
      .populate("items.product");

    return res.status(200).json({
      success: true,
      cart: buildCartResponse(populatedCart),
    });
  } catch (error) {
    console.error("RemoveFromCart error:", error);
    return res.status(500).json({ error: error.message, success: false });
  }
};

export const createPaymentOrder = async (req, res) => {
  try {
    const { amount, currency } = req.body;
    const user = req.user;

    // 1. Get user's cart to save as items
    const cart = await cartModel.findOne({ user: user._id });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    // 2. Create Razorpay Order
    const order = await createOrder({ amount, currency });

    // 3. Create/Update pending payment record (Idempotency)
    // We use findOneAndUpdate to ensure we don't create multiple pending payments for the same order if user retries
    await paymentModel.findOneAndUpdate(
      { "razorpay.order_id": order.id },
      {
        user: user._id,
        orderItems: cart.items.map((item) => item._id), // or item.product if you prefer ref
        price: { amount, currency },
        status: "pending",
        email: user.email,
        phone: user.contact,
        razorpay: { order_id: order.id },
      },
      { upsert: true, new: true },
    );

    return res.status(201).json({ success: true, order });
  } catch (error) {
    console.error("CreatePaymentOrder error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
      req.body;

    // 1. Verify Signature
    const isAuthentic = verifySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    );

    if (!isAuthentic) {
      await paymentModel.findOneAndUpdate(
        { "razorpay.order_id": razorpay_order_id },
        { status: "failed" },
      );
      return res
        .status(400)
        .json({ success: false, message: "Invalid signature" });
    }

    // 2. Fetch cart BEFORE clearing (we need items for stock decrement + email)
    const cart = await cartModel.findOne({ user: req.user._id }).populate("items.product");

    // 3. Decrement stock for each variant purchased
    if (cart && cart.items.length > 0) {
      const stockOps = cart.items.map((item) => {
        if (!item.product) return null;
        return productModel.updateOne(
          { _id: item.product._id, "variants._id": item.variant },
          { $inc: { "variants.$.stock": -item.quantity } }
        );
      }).filter(Boolean);
      await Promise.all(stockOps);
    }

    // 4. Update Payment Record
    const payment = await paymentModel.findOneAndUpdate(
      { "razorpay.order_id": razorpay_order_id },
      {
        status: "paid",
        "razorpay.payment_id": razorpay_payment_id,
        "razorpay.signature": razorpay_signature,
        payment_id: razorpay_payment_id,
        // Snapshot cart items for order history
        orderSnapshot: cart ? cart.items.map((item) => ({
          title: item.product?.title || "Product",
          image: item.image,
          quantity: item.quantity,
          price: item.price,
        })) : [],
      },
      { new: true },
    );

    if (!payment) {
      return res
        .status(404)
        .json({ success: false, message: "Payment record not found" });
    }

    // 5. Clear the User's Cart
    await cartModel.findOneAndUpdate({ user: req.user._id }, { items: [] });

    // 6. Send order confirmation email (non-blocking)
    try {
      const user = await userModel.findById(req.user._id);
      if (user?.email) {
        const html = orderConfirmationTemplate({
          name: user.fullname || "Customer",
          orderId: razorpay_order_id,
          amount: payment.price?.amount || 0,
          currency: payment.price?.currency || "INR",
          items: payment.orderSnapshot || [],
        });
        await sendEmail(
          user.email,
          "Your Snitch Order is Confirmed 🎉",
          `Order ${razorpay_order_id} confirmed. Total: ${payment.price?.currency} ${payment.price?.amount}`,
          html,
        );
      }
    } catch (emailErr) {
      console.error("Order confirmation email failed:", emailErr.message);
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified and cart cleared",
      payment,
    });
  } catch (error) {
    console.error("VerifyPayment error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get My Orders ────────────────────────────────────────────────────────────
export const getMyOrders = async (req, res) => {
  try {
    const orders = await paymentModel
      .find({ user: req.user._id, status: "paid" })
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("GetMyOrders error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
