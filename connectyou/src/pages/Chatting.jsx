import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaGlobe, FaCommentDots, FaSignOutAlt, FaChevronRight } from "react-icons/fa";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "../firebase";
import "./Home.css";

async function getCurrentUserChats(currentUid) {
  const chatsQuery = query(
    collection(db, "chats"),
    where("users", "array-contains", currentUid)
  );

  const snapshot = await getDocs(chatsQuery);
  const chats = [];
  const namesByUid = new Map();

  for (const chatDoc of snapshot.docs) {
    const { users } = chatDoc.data();
    const otherUid = users.find((uid) => uid !== currentUid);

    if (!otherUid) continue;

    if (!namesByUid.has(otherUid)) {
      const profile = await getDoc(doc(db, "users", otherUid));
      const user = profile.data();
      const name = user
        ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
        : "";

      namesByUid.set(otherUid, name || "Unknown user");
    }

    chats.push({
      chatId: chatDoc.id,
      name: namesByUid.get(otherUid),
    });
  }

  return chats;
}

function Chatting() {
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [chatError, setChatError] = useState("");
  const navItem = "flex items-center gap-2 rounded-full px-4 py-2.5 text-sm transition";

  async function handleLogout() {
    await signOut(auth);
    navigate("/", { replace: true });
  }

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      setChats([]);
      setChatError("");

      if (!user) return;

      try {
        const userChats = await getCurrentUserChats(user.uid);

        if (auth.currentUser?.uid === user.uid) {
          setChats(userChats);
        }
      } catch (error) {
        if (auth.currentUser?.uid === user.uid) {
          setChatError(`Couldn't load chats (${error.code || "unknown error"}).`);
        }
      }
    });
  }, []);

  return (
    <div className="orb-scene text-white">
      <div aria-hidden="true" className="orb-grid pointer-events-none" />
      <div aria-hidden="true" className="orb-glow orb-glow-1 pointer-events-none" />
      <div aria-hidden="true" className="orb-glow orb-glow-2 pointer-events-none" />

      <header className="relative z-10 px-4 pt-6">
        <Link to="/home" className="text-2xl font-bold">
          ConnectYou
        </Link>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-2xl px-4 pt-8 pb-28 sm:px-6 sm:pt-12">
        <h1 className="mb-5 text-2xl font-bold tracking-tight sm:text-3xl">
          Your chats
        </h1>

        {chatError && (
          <p role="alert" className="rounded-xl bg-red-950/60 p-4 text-sm text-red-200">
            {chatError}
          </p>
        )}

        <ul className="space-y-3">
          {chats.map((chat) => (
            <li key={chat.chatId}>
              <Link to={`/chatting/${chat.chatId}`} state={{ name: chat.name }} className="group flex min-h-16 items-center gap-3 rounded-2xl border border-white/10 bg-[#2c2937]/90 px-3 py-3 transition hover:border-violet-400/50 hover:bg-[#3b344f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400 sm:gap-4 sm:px-5">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-violet-500/20 text-violet-200 sm:size-12">
                  <FaCommentDots aria-hidden="true" />
                </span>

                <span className="min-w-0 flex-1 wrap-break-word font-medium text-white">
                  {chat.name}
                </span>

                <FaChevronRight aria-hidden="true" className="shrink-0 text-xs text-violet-300 transition group-hover:translate-x-0.5" />
              </Link>
            </li>
          ))}
        </ul>
      </main>

      <nav aria-label="Main navigation" className="fixed bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/10 bg-[#2c2937]/80 p-1.5 shadow-2xl backdrop-blur-md">
        <Link to="/home" aria-label="Galaxy" className={`${navItem} text-gray-300 hover:text-white`}>
          <FaGlobe aria-hidden="true" />
          <span className="hidden sm:inline">Galaxy</span>
        </Link>

        <Link to="/chatting" aria-label="Chats" aria-current="page" className={`${navItem} bg-[#6d5bb8] text-white`}>
          <FaCommentDots aria-hidden="true" />
          <span className="hidden sm:inline">Chats</span>
        </Link>

        <button type="button" onClick={handleLogout} aria-label="Log out" className={`${navItem} cursor-pointer text-gray-300 hover:text-white`}>
          <FaSignOutAlt aria-hidden="true" />
          <span className="hidden sm:inline">Log out</span>
        </button>
      </nav>
    </div>
  );
}

export default Chatting;