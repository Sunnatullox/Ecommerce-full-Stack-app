import React, { useEffect, useState } from "react";
import { RxCross1 } from "react-icons/rx";
import { AiOutlineClose, AiOutlineRight } from "react-icons/ai";
import { HiOutlineMinus, HiPlus, HiTrash } from "react-icons/hi";
import styles from "../../styles/styles";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Lottie from "react-lottie";
import {
  addCheckoutList,
  addTocart,
  removeFromCart,
} from "../../redux/actions/cart";
import { toast } from "react-toastify";
import NotProduct from "../../Assests/animations/no-product.json";

const defaultOptions = {
  loop: true,
  autoplay: true,
  animationData: NotProduct,
  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice",
  },
};
const Cart = () => {
  const navigate = useNavigate();
  const [shopCart, setShopCart] = useState([]);
  const { cart, checkOutCart } = useSelector((state) => state.cart);
  const dispatch = useDispatch();

  useEffect(() => {
    const updatedShopCart = cart?.reduce((acc, item) => {
      const shopName = item.shop?.name;
      const existingShop = acc?.find((shop) => shop?.name === shopName);
      if (existingShop) {
        existingShop.products.push(item);
      } else {
        acc.push({
          name: shopName,
          products: [item],
        });
      }
      return acc;
    }, []);

    setShopCart(updatedShopCart);
  }, [cart]);

  const removeFromCartHandler = (data) => {
    const isItemInCheckout = checkOutCart.find((item) => item._id === data._id);
    if (isItemInCheckout) {
      const updatedCheckout = checkOutCart.filter(
        (item) => item._id !== data._id
      );
      dispatch(addCheckoutList(updatedCheckout));
    }
    dispatch(removeFromCart(data));
  };

  const quantityChangeHandler = (data) => {
    dispatch(addTocart(data));
    dispatch(addCheckoutList([]));

    const updatedCheckOutCart = checkOutCart.map((item) => {
      if (item._id === data._id) {
        return { ...item, qty: data.qty };
      }
      return item;
    });

    dispatch(addCheckoutList(updatedCheckOutCart));
  };

  const addToCheckoutHandler = (data) => {
    dispatch(addCheckoutList(data));
    setTimeout(() => {
      navigate("/checkout");
    }, 300);
  };

  const subTotalPrice = checkOutCart?.reduce(
    (acc, item) => acc + item.qty * item.discountPrice,
    0
  );
  const shipping = subTotalPrice < 500 ? subTotalPrice * 0.05 : 0;

  const totalPrice = (subTotalPrice + shipping).toFixed(2);

  return (
    <div className="bg-gray-100 rounded-md">
      <div className="800px:container mx-auto mt-10">
        {cart.length > 0 ? (
          <div className="800px:flex shadow-md my-10">
            <div className="w-full 800px:w-[70%] bg-white px-2 sm:px-10 py-10">
              <div className="flex justify-between pb-3">
                <h1 className="font-semibold text-2xl">Shopping Cart</h1>
                <h2 className="font-semibold text-2xl">{cart.length} Items</h2>
              </div>
              <div className="overflow-y-auto overflow-x-hidden h-[22rem]">
                {/* Single Shop Cart  */}
                {shopCart?.map((item, i) => {
                  const checkOutShopIds = checkOutCart.map(
                    (item) => item.shopId
                  );
                  const isShopIdsEqual = item.products.every((item) =>
                    checkOutShopIds.includes(item.shopId)
                  );
                  return (
                    <div key={i}>
                      <hr className="h-px my-3 bg-gray-200 border-0 dark:bg-gray-700" />
                      <Link
                        to=""
                        className="pb-3 inline-block text-[20px] font-semibold"
                      >
                        {item.name}
                      </Link>
                      {item.products?.map((prod, index) => (
                        <>
                          {checkOutCart.length === 0 ? (
                            <SingleShopCart
                              key={index}
                              data={prod}
                              quantityChangeHandler={quantityChangeHandler}
                              removeFromCartHandler={removeFromCartHandler}
                            />
                          ) : (
                            <>
                              {checkOutCart[0]?.shopId === prod.shopId ? (
                                <SingleShopCart
                                  key={index}
                                  data={prod}
                                  check={false}
                                  quantityChangeHandler={quantityChangeHandler}
                                  removeFromCartHandler={removeFromCartHandler}
                                />
                              ) : (
                                <SingleShopCart
                                  check={true}
                                  key={index}
                                  data={prod}
                                  quantityChangeHandler={quantityChangeHandler}
                                  removeFromCartHandler={removeFromCartHandler}
                                />
                              )}
                            </>
                          )}
                        </>
                      ))}
                      <div className="flex mb-4 justify-end">
                        <button
                          type="button"
                          disabled={checkOutShopIds.length > 0 && isShopIdsEqual === false ? true : false}
                          onClick={() => addToCheckoutHandler(item.products)}
                          className="focus:outline-none disabled:opacity-25 disabled:cursor-default font-semibold rounded-[20px] text-[16px] h-[40px] tracking-[-.3px] leading-5 px-3 border-none cursor-pointer bg-[#e4e4e4]"
                        >
                          Order everything in the store
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <Link
                to="/"
                className="flex font-semibold text-indigo-600 text-sm mt-10"
              >
                <svg
                  className="fill-current mr-2 text-indigo-600 w-4"
                  viewBox="0 0 448 512"
                >
                  <path d="M134.059 296H436c6.627 0 12-5.373 12-12v-56c0-6.627-5.373-12-12-12H134.059v-46.059c0-21.382-25.851-32.09-40.971-16.971L7.029 239.029c-9.373 9.373-9.373 24.569 0 33.941l86.059 86.059c15.119 15.119 40.971 4.411 40.971-16.971V296z" />
                </svg>
                Continue Shopping
              </Link>
            </div>

            <div id="summary" className="w-full 800px:w-[30%] px-2">
              <h3 className="font-semibold text-xl">
                {checkOutCart.length > 0 ? (
                  <>Place an order</>
                ) : (
                  <>Select products to continue </>
                )}
              </h3>
              {checkOutCart?.length > 0 && (
                <>
                  <div className="border p-3 rounded">
                    <div className="grid grid-cols-4 gap-1">
                      {checkOutCart?.map((item, i) => (
                        <span
                          key={i}
                          className="border rounded border-[#594dff] m-1"
                        >
                          <img
                            width={70}
                            height={70}
                            src={item.images[0].url}
                            alt=""
                          />
                        </span>
                      ))}
                    </div>
                    <div className="border-t mt-2">
                      <div className="flex font-semibold justify-between py-1 text-sm">
                        <span className="font-semibold text-sm ">
                          Items {checkOutCart?.length}
                        </span>
                        <span className="font-semibold text-sm">
                          ${subTotalPrice.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex font-semibold justify-between py-1 text-sm">
                        <span>Delivery</span>
                        {subTotalPrice < 500 ? (
                          <span>${shipping.toFixed(2)}</span>
                        ) : (
                          <span className="text-[#42c63b]">Free</span>
                        )}
                      </div>

                      <button
                        onClick={() => navigate("/checkout")}
                        className="flex bg-indigo-500 font-semibold hover:bg-indigo-600 py-3 text-sm text-white  w-full"
                      >
                        <span className=" pl-6 text-start">Checkout</span>
                        <span className="ml-auto pr-1 gap-2">
                          ${totalPrice}
                        </span>
                        <AiOutlineRight className="mr-5 self-center" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="w-full h-[70vh] flex items-center justify-center relative">
              <Lottie options={defaultOptions} width="500px" height="100%" />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const SingleShopCart = ({
  data,
  quantityChangeHandler,
  removeFromCartHandler,
  check,
}) => {
  const { cart, checkOutCart } = useSelector((state) => state.cart);
  const [value, setValue] = useState(data?.qty);
  const totalPrice = data?.discountPrice * value;
  const dispatch = useDispatch();

  const increment = (data) => {
    if (data.stock < value) {
      toast.error("Product stock limited!");
    } else {
      setValue(value + 1);
      const updateCartData = { ...data, qty: value + 1 };
      quantityChangeHandler(updateCartData);
    }
  };

  const decrement = (data) => {
    setValue(value === 1 ? 1 : value - 1);
    const updateCartData = { ...data, qty: value === 1 ? 1 : value - 1 };
    quantityChangeHandler(updateCartData);
  };

  const addCheckoutSingle = (checked, id) => {
    const product = cart.find((item) => item._id === id);
    const removeCheckoutListProduct = checkOutCart.filter(
      (item) => item._id !== id
    );
    if (checked) {
      dispatch(addCheckoutList([...checkOutCart, product]));
    } else {
      dispatch(addCheckoutList(removeCheckoutListProduct));
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => removeFromCartHandler(data)}
        className="absolute top-1 backdrop:ring-gray-600 text-[#f04646] p-[1px] border rounded border-[1px solid #f04646] "
      >
        <HiTrash />
      </button>
      <div className="flex items-center -mx-8 px-6 py-5">
        <Link to={`/product/${data._id}`} className="sm:flex w-2/5">
          <div className="mx-[15px] min-w-max">
            <img className="h-24" src={`${data?.images[0]?.url}`} alt="" />
          </div>
          <div className="flex flex-col justify-between ml-4 flex-grow">
            <span className="font-bold text-sm">
              {data?.name.length > 45 ? (
                <>{data?.name.slice(0, 45)}...</>
              ) : (
                <>{data?.name}</>
              )}
            </span>
            <span className=" hidden sm:block text-[#438eff] text-xs">
              {data?.description.length > 80 ? (
                <>{data?.description.slice(0, 80)}...</>
              ) : (
                <>{data?.description}</>
              )}
            </span>
          </div>
        </Link>
        <div className="flex justify-center w-1/5">
          {value > 1 ? (
            <div
              className="bg-[#a7abb14f] rounded-full w-[25px] h-[25px] flex items-center justify-center cursor-pointer"
              onClick={() => decrement(data)}
            >
              <HiOutlineMinus size={16} color="#7d879c" />
            </div>
          ) : (
            <div
              className="bg-[#a7abb14f] rounded-full w-[25px] h-[25px] flex items-center justify-center cursor-pointer"
              onClick={() => removeFromCartHandler(data)}
            >
              <HiTrash size={22} color="#7d879c" />
            </div>
          )}
          <span className="px-[10px]">{data.qty}</span>
          <div
            className={`border bg-[#a7abb14f] rounded-full w-[25px] h-[25px] ${styles.noramlFlex} justify-center cursor-pointer`}
            onClick={() => increment(data)}
          >
            <HiPlus size={18} color="#7d879c" />
          </div>
        </div>
        <div className="w-1/5 font-semibold text-lg grid">
          <span className="flex text-center text-[#ff3b3b]">
            <i className="line-through">${data.originalPrice}</i>
            <sub>
              -
              {Number(
                ((data.originalPrice - data.discountPrice) /
                  data.originalPrice) *
                  100
              ).toFixed(1)}
              %
            </sub>
          </span>
          <span className="">US${totalPrice}</span>
        </div>
        <div className="inline-block text-center w-1/5 font-semibold text-sm">
          <input
            id="default-checkbox"
            type="checkbox"
            disabled={check}
            value={data._id}
            defaultChecked={checkOutCart.find((item) => item._id === data._id)}
            onChange={(e) => addCheckoutSingle(e.target.checked, data._id)}
            className=" w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          ></input>
        </div>
      </div>
    </div>
  );
};

export default Cart;
