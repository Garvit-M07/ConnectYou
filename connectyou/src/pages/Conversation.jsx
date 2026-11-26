import { useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { FaArrowLeft, FaCommentDots, FaPaperPlane } from "react-icons/fa";
import { doc, runTransaction } from "firebase/firestore";
import { auth, db } from "../firebase";

async function sendMessage() {
    const { chatId } = useParams();
    try {
      const chatRef = doc(db, "chats", chatId);

 
      await updateDoc(chatRef, {
        messages: "Hello!",
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Failed to update chat:", error);
    }
  }


function Conversation() {
    const location = useLocation();
    const otherName = location.state?.name || "Conversation";

    return (
    <main className="min-h-screen bg-[#14111d] px-3 py-4 text-white sm:px-6 sm:py-8">
      <section className="mx-auto flex h-[calc(100dvh-2rem)] max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#221f2c] sm:h-[calc(100dvh-4rem)]">
        <header className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
          <Link to="/chatting" aria-label="Back to chats" className="grid size-11 shrink-0 place-items-center rounded-xl text-violet-200 hover:bg-white/10">
            <FaArrowLeft aria-hidden="true" />
          </Link>

          <h1 className="truncate text-lg font-semibold">{otherName}</h1>
        </header>

        <div className="flex min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="m-auto text-center text-gray-300">
            <FaCommentDots aria-hidden="true" className="mx-auto mb-3 text-3xl text-violet-300" />
            <p>No messages yet</p>
          </div>
        </div>

        <div className="flex items-center gap-2 border-t border-white/10 p-3 sm:p-4">
          <input aria-label="Message" placeholder="Write a message..." className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#352f45] px-4 py-3 text-base focus:border-violet-400 focus:outline-none" />

          <button onClick={sendMessage} type="button" aria-label="Send message" disabled className="grid size-11 shrink-0 place-items-center rounded-xl bg-violet-600 disabled:opacity-50">
            <FaPaperPlane aria-hidden="true" />
          </button>
        </div>
      </section>
    </main>
  );
}

export default Conversation;