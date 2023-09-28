import React, { useEffect, useState } from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {
  LoginPage,
  SignupPage,
  ActivationPage,
  HomePage,
  ProductsPage,
  BestSellingPage,
  EventsPage,
  FAQPage,
  CheckoutPage,
  PaymentPage,
  OrderSuccessPage,
  ProductDetailsPage,
  ProfilePage,
  ShopCreatePage,
  SellerActivationPage,
  ShopLoginPage,
  OrderDetailsPage,
  TrackOrderPage,
  UserInbox,
} from "./routes/Routes.js";
import {
  ShopDashboardPage,
  ShopCreateProduct,
  ShopAllProducts,
  ShopCreateEvents,
  ShopAllEvents,
  ShopAllCoupouns,
  ShopPreviewPage,
  ShopAllOrders,
  ShopOrderDetails,
  ShopAllRefunds,
  ShopSettingsPage,
  ShopWithDrawMoneyPage,
  ShopInboxPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  CartPage
} from "./routes/ShopRoutes";
import {
  AdminDashboardPage,
  AdminDashboardUsers,
  AdminDashboardSellers,
  AdminDashboardOrders,
  AdminDashboardProducts,
  AdminDashboardEvents,
  AdminDashboardWithdraw
} from "./routes/AdminRoutes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Store from "./redux/store";
import { loadSeller, loadUser } from "./redux/actions/user";
import ProtectedRoute from "./routes/ProtectedRoute";
import ProtectedAdminRoute from "./routes/ProtectedAdminRoute";
import { ShopHomePage } from "./ShopRoutes.js";
import SellerProtectedRoute from "./routes/SellerProtectedRoute";
import { getAllProducts } from "./redux/actions/product";
import { getAllEvents } from "./redux/actions/event";
import axios from "axios";
import { server } from "./server";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import NotFound from "./components/Layout/NotFound";
import socketIO from "socket.io-client";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { addNewNotifMessage } from "./redux/actions/socket";


const ENDPOINT = "http://localhost:5500";
const socketId = socketIO(ENDPOINT, { transports: ["websocket"] });


const App = () => {
  const [stripeApikey, setStripeApiKey] = useState("")
  const { user, loading } = useSelector((state) => state.user);
  const { seller, isLoading } = useSelector((state) => state.seller);
  const [arrivalMessage, setArrivalMessage] = useState(null);

  const currentUrl = window.location.pathname;
  const searchWord = "dashboard";
  const regex = new RegExp(searchWord, "g");

  useEffect(() => {
    if (currentUrl.length > 0) {
      const matches = currentUrl.match(regex);
      if (matches && seller) {
        const id = seller._id;
        socketId.emit("addUser", id);
      } else if (!matches && user) {
        const id = user?._id;
        socketId.emit("addUser", id);
      }
    }
  }, [currentUrl, seller, user]);

  useEffect(() => {
    window.scroll(0,0)
  }, []);



  useEffect(() => {
    socketId.on("newMessage", (data) => {
      console.log(data)
      Store.dispatch(addNewNotifMessage({
        sender: data.sender,
        text: data.text ? data.text : null,
        images: data.images ? data.images : null,
        conversationId: data.conversationId,
        createdAt: Date.now(),
      }));
    });
  });


  async function getStripeApikey() {
    const { data } = await axios.get(`${server}/payment/stripeapikey`);
    setStripeApiKey(data.stripeApikey);
  }

  useEffect(() => {
    Store.dispatch(loadUser());
    Store.dispatch(loadSeller());
    Store.dispatch(getAllProducts());
    Store.dispatch(getAllEvents());
    getStripeApikey();
  }, []);

  return (
    <Router>
      {stripeApikey && (
        <Elements stripe={loadStripe(stripeApikey)}>
          <Routes>
            <Route
              path="/payment"
              element={
                <ProtectedRoute>
                  <PaymentPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Elements>
      )}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/sign-up" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:reset_token" element={<ResetPasswordPage />} />
        <Route
          path="/activation/:activation_token"
          element={<ActivationPage />}
        />
        <Route
          path="/seller/activation/:activation_token"
          element={<SellerActivationPage />}
        />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/product/:id" element={<ProductDetailsPage />} />
        <Route path="/best-selling" element={<BestSellingPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/shopcart" element={<CartPage />} />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route path="/order/success" element={<OrderSuccessPage />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inbox"
          element={
            <ProtectedRoute>
              <UserInbox socketId={socketId}/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/order/:id"
          element={
            <ProtectedRoute>
              <OrderDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/track/order/:id"
          element={
            <ProtectedRoute>
              <TrackOrderPage />
            </ProtectedRoute>
          }
        />
        <Route path="/shop/preview/:id" element={<ShopPreviewPage />} />
        {/* shop Routes */}
        <Route path="/shop-create" element={<ShopCreatePage />} />
        <Route path="/shop-login" element={<ShopLoginPage />} />
        <Route
          path="/shop/:id"
          element={
            <SellerProtectedRoute>
              <ShopHomePage />
            </SellerProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <SellerProtectedRoute>
              <ShopSettingsPage />
            </SellerProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <SellerProtectedRoute>
              <ShopDashboardPage />
            </SellerProtectedRoute>
          }
        />
        <Route
          path="/dashboard-create-product"
          element={
            <SellerProtectedRoute>
              <ShopCreateProduct />
            </SellerProtectedRoute>
          }
        />
        <Route
          path="/dashboard-orders"
          element={
            <SellerProtectedRoute>
              <ShopAllOrders />
            </SellerProtectedRoute>
          }
        />
        <Route
          path="/dashboard-refunds"
          element={
            <SellerProtectedRoute>
              <ShopAllRefunds />
            </SellerProtectedRoute>
          }
        />

        <Route
          path="/order/:id"
          element={
            <SellerProtectedRoute>
              <ShopOrderDetails />
            </SellerProtectedRoute>
          }
        />
        <Route
          path="/dashboard-products"
          element={
            <SellerProtectedRoute>
              <ShopAllProducts />
            </SellerProtectedRoute>
          }
        />
        <Route
          path="/dashboard-create-event"
          element={
            <SellerProtectedRoute>
              <ShopCreateEvents />
            </SellerProtectedRoute>
          }
        />
        <Route
          path="/dashboard-events"
          element={
            <SellerProtectedRoute>
              <ShopAllEvents />
            </SellerProtectedRoute>
          }
        />
        <Route
          path="/dashboard-coupouns"
          element={
            <SellerProtectedRoute>
              <ShopAllCoupouns />
            </SellerProtectedRoute>
          }
        />
        <Route
          path="/dashboard-withdraw-money"
          element={
            <SellerProtectedRoute>
              <ShopWithDrawMoneyPage />
            </SellerProtectedRoute>
          }
        />
        <Route
          path="/dashboard-messages"
          element={
            <SellerProtectedRoute>
              <ShopInboxPage socketId={socketId} />
            </SellerProtectedRoute>
          }
        />
        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedAdminRoute>
              <AdminDashboardPage />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin-users"
          element={
            <ProtectedAdminRoute>
              <AdminDashboardUsers />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin-sellers"
          element={
            <ProtectedAdminRoute>
              <AdminDashboardSellers />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin-orders"
          element={
            <ProtectedAdminRoute>
              <AdminDashboardOrders />
            </ProtectedAdminRoute>
          }
        />
         <Route
          path="/admin-products"
          element={
            <ProtectedAdminRoute>
              <AdminDashboardProducts />
            </ProtectedAdminRoute>
          }
        />
         <Route
          path="/admin-events"
          element={
            <ProtectedAdminRoute>
              <AdminDashboardEvents />
            </ProtectedAdminRoute>
          }
        />
         <Route
          path="/admin-withdraw-request"
          element={
            <ProtectedAdminRoute>
              <AdminDashboardWithdraw />
            </ProtectedAdminRoute>
          }
        />
         <Route
          path="*"
          element={<NotFound/> }
        />
      </Routes>
      <ToastContainer
        position="bottom-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </Router>
  );
};

export default App;
