import axios from "axios";
import React, { useRef, useState } from "react";
import { useEffect } from "react";
import { server } from "../../server";
import { useSelector } from "react-redux";
import MessageList from "../../pages/MessageList";
import SellerInbox from "../../pages/SellerInbox";

const DashboardMessages = ({ socketId }) => {
  const { seller, isLoading } = useSelector((state) => state.seller);
  const { messages: notifMessages } = useSelector(
    (state) => state?.notification
  );
  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState();
  const [messages, setMessages] = useState([]);
  const [userData, setUserData] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [activeStatus, setActiveStatus] = useState(false);
  const [images, setImages] = useState();
  const [open, setOpen] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    const newMessages = [];

    for (let element of notifMessages) {
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
  }, [notifMessages, currentChat, messages]);

  

  useEffect(() => {
    // Effect for getting user conversations
    const getConversation = async () => {
      try {
        const response = await axios.get(
          `${server}/conversation/get-all-conversation-seller/${seller?._id}`,
          {
            withCredentials: true,
          }
        );
        setConversations(response.data.conversations);
      } catch (error) {
        console.log(error);
      }
    };
    if (seller) getConversation();
  }, [seller, messages]);

  useEffect(() => {
    socketId.on("getUsers", (data) => {
      setOnlineUsers(data);
    });
  }, [socketId]);

  const onlineCheck = (chat) => {
    const chatMembers = chat.members.find((member) => member !== seller?._id);
    const online = onlineUsers.find((user) => user.userId === chatMembers);
    return online ? true : false;
  };

  useEffect(() => {
    // Effect for getting messages of the current chat
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
      sender: seller._id,
      text: newMessage,
      conversationId: currentChat._id,
    };

    const receiverId = currentChat.members.find(
      (member) => member !== seller._id
    );

    socketId.emit("sendMessage", {
      sender: seller._id,
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
      lastMessageId: seller._id,
    });

    await axios
      .put(`${server}/conversation/update-last-message/${currentChat._id}`, {
        lastMessage: newMessage,
        lastMessageId: seller._id,
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
      (member) => member !== seller._id
    );

    const data = new FormData();
    data.append("image", e.target.files[0]);
    data.append("sender", seller._id);
    data.append("text", newMessage);
    data.append("conversationId", currentChat._id);

    socketId.emit("sendMessage", {
      sender: seller._id,
      receiverId,
      image: e.target.files[0]?.name,
    });

    try {
      await axios
        .post(`${server}/message/create-new-message`, data, {
          headers: {
            "Content-Type":
              "multipart/form-data; boundary=<calculated when request is sent>",
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
        lastMessageId: seller._id,
      }
    );
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ beahaviour: "smooth" });
  }, [messages]);

  return (
    <div className="w-[90%] bg-white m-5 h-[85vh] rounded">
      {!open ? (
        <>
          <h1 className="text-center text-[30px] py-3 font-Poppins">
            All Messages
          </h1>
          {/* All messages list */}
          {conversations &&
            conversations.map((item, index) => (
              <MessageList
                data={item}
                key={index}
                index={index}
                setOpen={setOpen}
                setCurrentChat={setCurrentChat}
                me={seller._id}
                setUserData={setUserData}
                userData={userData}
                online={onlineCheck(item)}
                setActiveStatus={setActiveStatus}
                isLoading={isLoading}
              />
            ))}
        </>
      ) : (
        <SellerInbox
          setOpen={setOpen}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          sendMessageHandler={sendMessageHandler}
          messages={messages}
          sellerId={seller._id}
          userData={userData}
          activeStatus={activeStatus}
          scrollRef={scrollRef}
          setMessages={setMessages}
          handleImageUpload={handleImageUpload}
          currentChat={currentChat}
        />
      )}
    </div>
  );
};

export default DashboardMessages;
