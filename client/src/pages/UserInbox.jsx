import React, { useEffect, useRef, useState } from "react";
import Header from "../components/Layout/Header";
import { useSelector } from "react-redux";
import { server } from "../server";
import axios from "axios";
import UserMessageList from "./UserMessageList";
import UserInboxMessageList from "./UserInboxMessageList";

const UserInbox = ({ socketId }) => {
  const { user, loading } = useSelector((state) => state.user);
  const { messages: arrivalMessage } = useSelector(
    (state) => state.notification
  );
  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [userData, setUserData] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [images, setImages] = useState();
  const [activeStatus, setActiveStatus] = useState(false);
  const [open, setOpen] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    const newMessages = [];

    for (let element of arrivalMessage) {
      if (element && currentChat?.members.includes(element.sender)) {
        let isDuplicate = false;

        for (let oldMessage of messages) {
          if (
            oldMessage.sender === element.sender &&
            oldMessage.conversationId === element.conversationId &&
            oldMessage.text === element.text
          ) {
            isDuplicate = true;
            break;
          }
        }

        if (!isDuplicate) {
          newMessages.push(element);
        }
      }
    }

    if (newMessages.length > 0) {
      setMessages((prev) => [...prev, ...newMessages]);
    }
  }, [arrivalMessage, currentChat, messages]);

  useEffect(() => {
    const getConversation = async () => {
      try {
        const resonse = await axios.get(
          `${server}/conversation/get-all-conversation-user/${user?._id}`,
          {
            withCredentials: true,
          }
        );

        setConversations(resonse.data.conversations);
      } catch (error) {
        console.log(error);
      }
    };
    if(user) getConversation();
  }, [user, messages]);

  useEffect(() => {
    socketId.on("getUsers", (data) => {
      setOnlineUsers(data);
    });
  }, [socketId]);

  const onlineCheck = (chat) => {
    const chatMembers = chat.members.find((member) => member !== user?._id);
    const online = onlineUsers.find((user) => user.userId === chatMembers);

    return online ? true : false;
  };

  // get messages
  useEffect(() => {
    const getMessage = async () => {
      try {
        const response = await axios.get(
          `${server}/message/get-all-messages/${currentChat?._id}`
        );
        setMessages(response.data.messages);
      } catch (error) {
        console.log(error);
      }
    };
    if (currentChat) {
      getMessage();
    }
  }, [currentChat]);

  // create new message
  const sendMessageHandler = async (e) => {
    e.preventDefault();

    const message = {
      sender: user._id,
      text: newMessage,
      conversationId: currentChat._id,
    };
    const receiverId = currentChat.members.find(
      (member) => member !== user?._id
    );

    socketId.emit("sendMessage", {
      sender: user?._id,
      receiverId,
      text: newMessage,
    });

    try {
      if (newMessage !== "") {
        await axios
          .post(`${server}/message/create-new-message`, message)
          .then((res) => {
            setMessages([...messages, res.data.message]);
            updateLastMessage();
            setNewMessage("");
          })
          .catch((error) => {
            console.log(error);
          });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const updateLastMessage = async () => {
    socketId.emit("updateLastMessage", {
      lastMessage: newMessage,
      lastMessageId: user._id,
    });

    await axios
      .put(`${server}/conversation/update-last-message/${currentChat._id}`, {
        lastMessage: newMessage,
        lastMessageId: user._id,
      })
      .then((res) => {
        setNewMessage("");
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleImageUpload = async (e) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (reader.readyState === 2) {
        setImages(reader.result);
        imageSendingHandler(e, reader.result);
      }
    };

    reader?.readAsDataURL(e?.target?.files[0]);
  };

  const imageSendingHandler = async (e, file) => {
    const receiverId = currentChat.members.find(
      (member) => member !== user._id
    );
    const data = new FormData();
    data.append("image", e.target.files[0]);
    data.append("text", newMessage);
    data.append("sender", user._id);
    data.append("conversationId", currentChat._id);

    socketId.emit("sendMessage", {
      sender: user._id,
      receiverId,
      image: e.target.files[0]?.name,
    });

    try {
      await axios
        .post(`${server}/message/create-new-message`, data, {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => {
          setImages();
          setMessages([...messages, res.data.message]);
          updateLastMessageForImage();
          setNewMessage("");
        });
    } catch (error) {
      console.log(error);
    }
  };

  const updateLastMessageForImage = async () => {
    await axios.put(
      `${server}/conversation/update-last-message/${currentChat._id}`,
      {
        lastMessage: "Photo",
        lastMessageId: user._id,
      }
    );
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ beahaviour: "smooth" });
  }, [messages]);
  // console.log(messages);
  return (
    <div className="w-full">
      {!open ? (
        <>
          <Header />
          <h1 className="text-center text-[30px] py-3 font-Poppins">
            All Messages
          </h1>
          {/* All messages list */}
          {conversations &&
            conversations.map((item, index) => (
              <UserMessageList
                data={item}
                key={index}
                index={index}
                setOpen={setOpen}
                setCurrentChat={setCurrentChat}
                me={user?._id}
                setUserData={setUserData}
                userData={userData}
                online={onlineCheck(item)}
                setActiveStatus={setActiveStatus}
                loading={loading}
              />
            ))}
        </>
      ) : (
        <UserInboxMessageList
          setOpen={setOpen}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          sendMessageHandler={sendMessageHandler}
          messages={messages}
          userId={user._id}
          userData={userData}
          activeStatus={activeStatus}
          scrollRef={scrollRef}
          handleImageUpload={handleImageUpload}
          currentChat={currentChat}
        />
      )}
    </div>
  );
};

export default UserInbox;
