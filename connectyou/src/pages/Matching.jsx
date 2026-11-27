import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaGlobe, FaCommentDots, FaSignOutAlt, FaUserFriends, FaUserCircle } from "react-icons/fa";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import { auth, db } from "../firebase";
import "./Matching.css";

function Matching() {
    const navigate = useNavigate();
    const [people, setPeople] = useState([]);   // the list of users
    const [error, setError] = useState("");

    useEffect(() => {
    // if user logs out, redirect to login page
    const unsub = onAuthStateChanged(auth, async (user) => {
        if (!user) {
        navigate("/");
        return;
    }

        try {
        const snap = await getDocs(collection(db, "users"));
        const list = [];
        snap.forEach((d) => {
            if (d.id !== user.uid) list.push({ id: d.id, ...d.data() });   // skip myself
        });

        console.log(list);   // checking if it works
        setPeople(list);
        } catch (err) {
        console.log(err);
        setError("Couldn't load people (" + err.code + ")");
        }
    });

    return () => unsub();   // stop listening when the page closes
    }, []);

  async function handleLogout() {
    await signOut(auth);
    navigate("/", { replace: true });
  }

  function barBtn(active) {
    return "flex items-center gap-2 px-4 py-2.5 rounded-full text-sm transition cursor-pointer " + (active ? "bg-[#6d5bb8] text-white" : "text-gray-300 hover:text-white");
  }

  return (
    <div className="orb-scene text-white">



      <header className="relative z-10 px-4 pt-6">
        <Link to="/home" className="text-2xl font-bold">
          ConnectYou
        </Link>
      </header>



      <main className="relative z-10 mx-auto w-full max-w-2xl px-4 pt-8 pb-28">
        {/* content */}

        {/*search bar */}
        <div className="search-wrapper">
            <div className="search-container" id="searchContainer">


                <div className="corner top-left"></div>
                <div className="corner top-right"></div>
                <div className="corner bottom-left"></div>
                <div className="corner bottom-right"></div>

                
                <div className="search-glow"></div>

            
                <div className="search-bar">
                    <div className="search-bar-inner">
                        <input type="text" id="searchInput" placeholder="Search.." spellCheck="false" />
                        <button id="searchButton" className="search-btn" aria-label="Search">
                            <svg className="search-icon" viewBox="0 0 24 24" fill="none">
                                <circle cx="10" cy="10" r="6" stroke="currentColor" strokeWidth="1.5" />
                                <path d="M14.5 14.5L19 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                <circle cx="10" cy="10" r="2" stroke="currentColor" strokeWidth="1" opacity="0.5" />
                            </svg>
                            <div className="btn-glow"></div>
                        </button>
                    </div>
                </div>

            </div>
        </div>

      </main>

      {/* bottom bar */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 bg-[#2c2937]/80 backdrop-blur-md border border-white/10 rounded-full p-1.5 shadow-2xl">

        <button onClick={() => navigate("/home")} title="Galaxy" className={barBtn(false)}>
          <FaGlobe /> <span className="hidden sm:inline">Galaxy</span>
        </button>

        <button onClick={() => navigate("/matching")} title="Matching" className={barBtn(false)}>
          <FaUserFriends /> <span className="hidden sm:inline">Matching</span>
        </button>

        <button onClick={() => navigate("/chatting")} title="Chats" className={barBtn(false)}>
          <FaCommentDots /> <span className="hidden sm:inline">Chats</span>
        </button>

        <button onClick={() => navigate("/profile")} title="Profile" className={barBtn(false)}>
          <FaUserCircle /> <span className="hidden sm:inline">Profile</span>
        </button>

        <button onClick={handleLogout} title="Log out" className={barBtn(false)}>
          <FaSignOutAlt /> <span className="hidden sm:inline">Log out</span>
        </button>
      </div>
    </div>
  );
}

export default Matching;
