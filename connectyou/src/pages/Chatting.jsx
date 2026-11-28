import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaSignOutAlt, FaUserCircle, FaChevronRight, FaGlobe, FaUserFriends, FaCommentDots } from "react-icons/fa";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "../firebase";
import "./Home.css";   // the navbar css is in here

const particles = Array.from({ length: 24 }, () => ({
  left: Math.random() * 100,
  size: Math.random() * 6 + 2,
  duration: Math.random() * 4 + 5,
  delay: Math.random() * 8,
}));


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
  const [menuOpen, setMenuOpen] = useState(false);   // for the hamburger on mobile

  // refs for the navbar stuff (instead of document.querySelector)
  const navRef = useRef(null);
  const menuRef = useRef(null);
  const indicatorRef = useRef(null);
  const glowRef = useRef(null);

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

  // put the indicator under "Chats" (3rd link) when the page loads
  useEffect(() => {
    resetIndicator();
  }, []);

  // move the indicator under the link that the mouse is on
  function moveIndicator(e) {
    indicatorRef.current.style.width = e.currentTarget.offsetWidth + "px";
    indicatorRef.current.style.left = e.currentTarget.offsetLeft + "px";
  }

  // when the mouse leaves the menu, go back to Chats (we are on this page)
  function resetIndicator() {
    const links = menuRef.current.querySelectorAll("a");
    const chatsLink = links[2];
    if (chatsLink) {
      indicatorRef.current.style.width = chatsLink.offsetWidth + "px";
      indicatorRef.current.style.left = chatsLink.offsetLeft + "px";
    }
  }

  function goTo(e, path) {
    e.preventDefault();
    setMenuOpen(false);
    navigate(path);
  }

  // (there was a second handleLogout here, one is enough)
  async function handleLogout() {
    await signOut(auth);
    navigate("/", { replace: true });
  }

  return (
    <div className="orb-scene text-white">
      <div aria-hidden="true" className="orb-grid pointer-events-none" />
      <div aria-hidden="true" className="orb-glow orb-glow-1 pointer-events-none" />
      <div aria-hidden="true" className="orb-glow orb-glow-2 pointer-events-none" />

      {particles.map((p, i) => (
        <span key={i} className="orb-particle" style={{ left: p.left + "%", width: p.size, height: p.size, animationDuration: p.duration + "s", animationDelay: "-" + p.delay + "s" }}></span>
      ))}
      
      {/* navbar */}
      <nav id="navbar" ref={navRef}>

        <div className="mouse-glow" ref={glowRef}></div>

        <div className="nav-shell">

          <div className="logo" onClick={e => goTo(e, "/home")}>◈ ConnectYou</div>

          <ul className="menu" ref={menuRef} onMouseLeave={resetIndicator}>

            <li className="indicator" ref={indicatorRef}></li>

            <li><a href="#" onMouseEnter={moveIndicator} onClick={e => goTo(e, "/home")}><FaGlobe/>Galaxy</a></li>
            <li><a href="#" onMouseEnter={moveIndicator} onClick={e => goTo(e, "/matching")}> <FaUserFriends/>Matching</a></li>
            <li><a href="#" onMouseEnter={moveIndicator} onClick={e => goTo(e, "/chatting")}><FaCommentDots/>Chats</a></li>
            <li><a href="#" onMouseEnter={moveIndicator} onClick={e => goTo(e, "/profile")}><FaUserCircle/>Profile</a></li>

          </ul>

          <button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt /> Log out
          </button>

          <div className={"hamburger " + (menuOpen ? "active" : "")} onClick={() => setMenuOpen(!menuOpen)}>
            <span></span>
            <span></span>
            <span></span>
          </div>

        </div>

      </nav>

      <div className={"mobile-menu " + (menuOpen ? "active" : "")}>

        <a href="#" onClick={e => goTo(e, "/home")}>Galaxy</a>
        <a href="#" onClick={e => goTo(e, "/matching")}>Matching</a>
        <a href="#" onClick={e => goTo(e, "/chatting")}>Chats</a>
        <a href="#" onClick={e => goTo(e, "/profile")}>Profile</a>
        <a href="#" onClick={handleLogout}>Log out</a>

      </div>


      {/* pt-32 so the fixed navbar doesnt cover the title */}
      <main className="relative z-10 mx-auto w-full max-w-2xl px-4 pt-32 pb-10 sm:px-6">
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

    </div>
  );
}

export default Chatting;
