import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { server } from "../server";

const UserMessageList = ({
  data,
  index,
  setOpen,
  setCurrentChat,
  me,
  setUserData,
  userData,
  online,
  setActiveStatus,
  loading,
}) => {
  const { messages } = useSelector((state) => state.notification);
  const [userNotifMessages, setUserNotifMessages] = useState([]);
  const [user, setUser] = useState([]);
  const [active, setActive] = useState(0);

  const navigate = useNavigate();

  const handleClick = (id) => {
    navigate(`/inbox?${id}`);
    setOpen(true);
  };

  useEffect(() => {
    setActiveStatus(online);
    const userId = data.members.find((user) => user !== me);
    const userMessageNotif = messages?.filter(
      (message) => message.sender === userId
    );
    setUserNotifMessages(userMessageNotif?.length);

    const getUser = async () => {
      try {
        const res = await axios.get(`${server}/seller/get-shop-info/${userId}`);
        setUser(res.data.shop);
      } catch (error) {
        console.log(error);
      }
    };
    getUser();
  }, [me, data]);

  return (
    <div
      className={`w-full flex p-3 px-3 ${
        active === index ? "bg-[#00000010]" : "bg-transparent"
      }  cursor-pointer`}
      onClick={(e) =>
        setActive(index) ||
        handleClick(data._id) ||
        setCurrentChat(data) ||
        setUserData(user) ||
        setActiveStatus(online)
      }
    >
      <div className="relative">
        {userNotifMessages > 0 ? (
          <span className="absolute top-[-10px] left-10 inline-flex px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
            {userNotifMessages}
          </span>
        ) : null}
        <img
          src={`${user?.avatar?.url}`}
          alt=""
          className="w-[50px] h-[50px] rounded-full"
        />
        {online ? (
          <div className="w-[12px] h-[12px] bg-green-400 rounded-full absolute top-[35px] right-[2px]" />
        ) : (
          <div className="w-[12px] h-[12px] bg-[#c7b9b9] rounded-full absolute top-[35px] right-[2px]" />
        )}
      </div>
      <div className="pl-3">
        <h1 className="text-[18px]">{user?.name}</h1>
        <p className="text-[16px] text-[#000c]">
          {(data?.lastMessageId || userData) && (
            <>{!loading && data?.lastMessageId !== userData?._id && "You: "}</>
          )}
          {data?.lastMessage?.length > 30 ? (
            <span>{data?.lastMessage.split(0, 30)}...</span>
          ) : (
            <span>{data?.lastMessage}</span>
          )}
        </p>
      </div>
    </div>
  );
};

export default UserMessageList;
