import { useState, useEffect } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { FaArrowLeft, FaCommentDots, FaPaperPlane } from "react-icons/fa";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase";


function getDayText(ms) {
  const date = new Date(ms);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);   // today minus 1 day

  // toDateString() gives "Thu Nov 26 2026"
  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

  return date.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

function Conversation() {
    const location = useLocation();
    const otherName = location.state?.name || "Conversation";
    const [text, setText] = useState("");
    const [messages, setMessages] = useState([]);
    const [sentBy, setSentBy] = useState([]);
    const [times, setTimes] = useState([]);
    const { otherUid: chatId } = useParams();

    async function getMessagesAndInfo() {
        /*here we are fetching the messages, timestamp and sentBy is used to know who sent the message so as to show a 
        normal messenging type different colour type messages depending on whether the CurrentUser sent the message or the opp person */
        try{
            const chatRef = doc(db, "chats", chatId);
            const snap = await getDoc(chatRef);
            const data = snap.data();
            
            if (data) {
                setMessages(data.messages || []);
                setSentBy(data.messagesSentBy || []);
                setTimes(data.messagesTimestamp || []);
            } else {
                console.log("No such chat document!");
            }
        } catch(error){
            console.log("Error fetching messages:", error);
        }
    }

    useEffect(() => {
        //we need to fetch the messages initially as well as when the user sends a new message then it should pop up in the screen
        getMessagesAndInfo();
    }, []);   // the [] means: run only once, when the page opens

    async function sendMessage() {
        
        try {
            //fetch the chat document and update the doc with the sent messages
            const chatRef = doc(db, "chats", chatId);
            const snap = await getDoc(chatRef);
            const data = snap.data();

            // copy each list and add the new item at the end
            const newMessages = [...data.messages, text];
            const newSentBy = [...data.messagesSentBy, auth.currentUser.uid];
            const newTimes = [...data.messagesTimestamp, Date.now()];

            //the document structure is: { messages: [], messagesSentBy: [], messagesTimestamp: [] }
            // update the document with the new lists
            await updateDoc(chatRef, {
                messages: newMessages,
                messagesSentBy: newSentBy,
                messagesTimestamp: newTimes,
            });

            //updating changes
            setText(""); 
            setMessages(newMessages);
            setSentBy(newSentBy);
            setTimes(newTimes);
        } catch (error) {
            console.error("Failed to update chat:", error);
        }
    }

    return (
    <main className="min-h-screen bg-[#14111d] px-3 py-4 text-white sm:px-6 sm:py-8">
      <section className="mx-auto flex h-[calc(100dvh-2rem)] max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#221f2c] sm:h-[calc(100dvh-4rem)]">
        <header className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
          <Link to="/chatting" aria-label="Back to chats" className="grid size-11 shrink-0 place-items-center rounded-xl text-violet-200 hover:bg-white/10">
            <FaArrowLeft aria-hidden="true" />
          </Link>

          <h1 className="truncate text-lg font-semibold">{otherName}</h1>
        </header>

        {/* font-['Exo_2',sans-serif] = readable font that looks like orbitron (loaded in index.html) */}
        <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-4 font-['Exo_2',sans-serif] sm:p-6">

        {messages.length === 0 && (
            <div className="m-auto text-center text-gray-300">
            <FaCommentDots className="mx-auto mb-3 text-3xl text-violet-300" />
            <p>No messages yet</p>
            </div>
        )}

        {/*loop through messages to show messages and also show day label*/}
        {messages.map((m, i) => {
        //calculate/show day label
        const showDay = i === 0 || new Date(times[i]).toDateString() !== new Date(times[i - 1]).toDateString();

        return (
            <div key={i}>
            {showDay && (
                <div className="my-2 text-center">
                <span className="rounded-full bg-[#352f45] px-3 py-1 text-xs text-gray-300">
                    {getDayText(times[i])}
                </span>
                </div>
            )}

            {/* the message bubble you already have */}
            <div className={"flex " + (sentBy[i] === auth.currentUser?.uid ? "justify-end" : "justify-start")}>
                <div className={"max-w-[75%] rounded-2xl px-4 py-2 " + (sentBy[i] === auth.currentUser?.uid ? "bg-violet-600" : "bg-[#352f45]")}>
                <p>{m}</p>
                <p className="text-xs text-gray-300">
                    {new Date(times[i]).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
                </div>
            </div>
            </div>
        );
        })}

        </div>

        <div className="flex items-center gap-2 border-t border-white/10 p-3 sm:p-4">
          <input aria-label="Message" placeholder="Write a message..."   value={text} onChange={e => setText(e.target.value)} className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#352f45] px-4 py-3 font-['Exo_2',sans-serif] text-base focus:border-violet-400 focus:outline-none" />

          <button onClick={sendMessage} type="button" aria-label="Send message" className="grid size-11 shrink-0 place-items-center rounded-xl bg-violet-600 disabled:opacity-50 hover:cursor-pointer">
            <FaPaperPlane aria-hidden="true" />
          </button>
        </div>
      </section>
    </main>
  );
}

export default Conversation;
