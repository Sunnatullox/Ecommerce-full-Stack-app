import React, { useEffect } from 'react'
import { useSelector } from 'react-redux';
import Store from '../redux/store';
import { updateNotifMessage } from '../redux/actions/socket';
import { AiOutlineArrowRight, AiOutlineSend } from 'react-icons/ai';
import { format } from 'timeago.js';
import { TfiGallery } from 'react-icons/tfi';
import styles from '../styles/styles';


const UserInboxMessageList = ({
    setOpen,
    newMessage,
    setNewMessage,
    sendMessageHandler,
    messages,
    userId,
    userData,
    activeStatus,
    scrollRef,
    handleImageUpload,
    currentChat
  }) => {
    const { messages: fullMessages } = useSelector((state) => state.notification);
    const { user } = useSelector((state) => state.user);
    const dispatch = Store.dispatch;
    console.log(user._id, fullMessages)
    useEffect(() => {
      const receiverId = currentChat.members.find(
        (member) => member !== user._id
      );

      if (messages.length > 0 && fullMessages.length > 0) {
        const removeTheMessages = fullMessages?.filter(
          (message) => message.sender !== receiverId
        );
        
        const updatedMessages =
          removeTheMessages.length > 0 ? removeTheMessages : [];
        dispatch(updateNotifMessage(updatedMessages));
      }
    });
    
    return (
      <div className="w-full min-h-full flex flex-col justify-between p-5">
        {/* message header */}
        <div className=" flex p-3 items-center justify-between bg-slate-200">
          <div className="flex">
            <img
              src={`${userData?.avatar?.url}`}
              alt=""
              className="w-[60px] h-[60px] rounded-full"
            />
            <div className="pl-3">
              <h1 className="text-[18px] font-[600]">{userData?.name}</h1>
              <h1>{activeStatus ? "Active Now" : ""}</h1>
            </div>
          </div>
          <AiOutlineArrowRight
            size={20}
            className="cursor-pointer"
            onClick={() => setOpen(false)}
          />
        </div>
  
        {/* messages */}
        <div className="px-3 h-[75vh] py-3 overflow-y-auto overflow-x-hidden">
          {messages &&
            messages.map((item, index) => (
              <div
                key={index}
                className={`flex w-full my-2 ${
                  item.sender === userId ? "justify-end mr-3" : "justify-start"
                }`}
                ref={scrollRef}
              >
                {item.sender !== userId && (
                  <img
                    src={`${userData?.avatar?.url}`}
                    className="w-[40px] h-[40px] rounded-full mr-3"
                    alt=""
                  />
                )}
  
                <div className="max-w-[45%]">
                  <div
                    className={`p-4 rounded-xl ${
                      item.sender !== userId ? "bg-[#eaeaea98]" : "bg-[#d1dde8fa]"
                    } text-[#000] h-min`}
                  >
                    {item.text !== "" && <p>{item.text}</p>}
                    {item.images && (
                      <img
                        src={`${item.images?.url}`}
                        className="max-w-[400px] max-h-[400px] w-full h-full object-cover rounded-[10px] ml-2 mb-2"
                        alt={`${item.images?.public_id}`}
                      />
                    )}
                    <p
                      className={`flex text-[12px] text-[#000000d3] pt-1 ${
                        item.sender === userId ? "justify-end" : "justify-start"
                      }`}
                    >
                      {format(item.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
        </div>
  
        {/* send message input */}
        <form
          aria-required={true}
          className="left-0 bottom-0 absolute p-3 relative w-full flex justify-between items-center"
          onSubmit={sendMessageHandler}
        >
          <div className="w-[30px]">
            <input
              type="file"
              name=""
              id="image"
              className="hidden"
              onChange={handleImageUpload}
            />
            <label htmlFor="image">
              <TfiGallery className="cursor-pointer" size={20} />
            </label>
          </div>
          <div className="border w-[100%]">
            <input
              type="text"
              required
              placeholder="Enter your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className={`${styles.input} w-[100%] `}
            />
            <input type="submit" value="Send" className="hidden" id="send" />
            <label htmlFor="send">
              <AiOutlineSend
                size={20}
                className="absolute right-4 top-5 cursor-pointer"
              />
            </label>
          </div>
        </form>
      </div>
    );
  };

export default UserInboxMessageList
