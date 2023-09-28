import React from "react";
import Lottie from "react-lottie";
import animationData from "../../Assests/animations/loader.json";

const Loader = () => {
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };
  return (
    <div className="w-full h-screen flex items-center justify-center">
      <Lottie options={defaultOptions} width="30%" height="50%" />
    </div>
  );
};

export default Loader;
