import React from "react";
import { useSelector } from "react-redux";
import EventCard from "../components/Events/EventCard";
import Header from "../components/Layout/Header";
import Loader from "../components/Layout/Loader";
import animationData from "../Assests/animations/notEvent.json";
import Lottie from "react-lottie";
import Footer from "../components/Layout/Footer";

const EventsPage = () => {
  const { allEvents, isLoading } = useSelector((state) => state?.events);
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };
  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div>
          <Header activeHeading={4} />
          {allEvents.length ? (
            allEvents?.map((event) => <EventCard active={true} data={event} />)
          ) : (
            <div className="w-full h-[400px] relative top-16">
              <Lottie options={defaultOptions} width="20%" height="30%" />
              <h2 className="text-center ">
                Not Found Events
              </h2>
            </div>
          )}
          <Footer />
        </div>
      )}
    </>
  );
};

export default EventsPage;
