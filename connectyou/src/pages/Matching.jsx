import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaGlobe, FaCommentDots, FaSignOutAlt, FaUserFriends, FaUserCircle } from "react-icons/fa";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, query, where, addDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";
import "./Matching.css";

function Matching() {
    const navigate = useNavigate();
    const [person, setPerson] = useState([]);
    const [filtered, setFiltered] = useState([]);   // the current user   // the list of users
    // const [error, setError] = useState("");
    // const [index, setIndex] = useState(0);
    const [text, setText] = useState("");   // the text in the search bar


    async function handleConnect(p) {
        if (!p || !p.id) {
            console.log("no person", p);
            return;
        }
        try {
            const myId = auth.currentUser.uid;

            //get chats to look thro if chat already exists
            const q = query(collection(db, "chats"), where("users", "array-contains", myId));
            const snap = await getDocs(q);

            let chatId = "";
            snap.forEach((d) => {
            if (d.data().users.includes(p.id)) {
                chatId = d.id;
            }
            });

            // if no chat found then make a new chat
            if (chatId === "") {
            const docRef = await addDoc(collection(db, "chats"), {
                users: [myId, p.id],
                createdAt: serverTimestamp(),
                messages: [],
                messagesSentBy: [],
                messagesTimestamp: [],
            });
            chatId = docRef.id;
            }

            // redirect to the chat directly (Conversation)
            navigate("/chatting/" + chatId, { state: { name: p.firstName + " " + p.lastName } });
        } catch (err) {
            console.log(err);
        }
        }

    function searchOperation(searchText) {
        setText(searchText);
        //filter as per major and not name
        const filtered = person.filter(p => p.major.toLowerCase().includes(searchText.toLowerCase()));
        setFiltered(filtered);
    }
    
    useEffect(() => {
        // if the search bar is empty, show all people
        if (text === "") {
            setFiltered(person);
        }

    // if user logs out, redirect to login page
    //we dont want to carry out functions if user is not logged in, so we listen for any changes in the authentication state of the user
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
        setPerson(list);
        setFiltered(list);   // initially, show all people
        } catch (err) {
        console.log(err);

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



    <main className="relative z-10 w-full px-4 pt-8 pb-28 sm:px-8">

    {/* search bar (mx-auto keeps it in the middle) */}
    <div className="search-wrapper mx-auto">
        <div className="search-container" id="searchContainer">

        <div className="corner top-left"></div>
        <div className="corner top-right"></div>
        <div className="corner bottom-left"></div>
        <div className="corner bottom-right"></div>

        <div className="search-glow"></div>

        <div className="search-bar">
            <div className="search-bar-inner">
            <input type="text" id="searchInput" placeholder="Search Majors.." spellCheck="false" onChange={(e) => searchOperation(e.target.value)} />
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

    {/* grid of square cards (starts from the left) */}
    
    <div className="mt-10 grid auto-rows-fr grid-cols-1 gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        {filtered.map((p, i) => (
        
            <div className="neo-card">
            <div className="neo-inner">

              {/* top row */}
                <div className="flex items-center justify-between mb-4 text-xs text-cyan-300 tracking-widest"> {/*set letter spacing*/}
                    <span>PROFILE</span>
            </div>

                <div className="flex items-center gap-3 mb-4">
                <FaUserCircle size={56} color="#6aeeff" />
                <div>
                  <p className="text-lg font-semibold">{p.firstName} {p.lastName}</p>
                  <p className="text-xs text-gray-300">{p.major} · {p.year}</p>
                </div>
              </div>

              <div className="text-xs text-cyan-300 tracking-widest mb-1">COLLEGE</div>
              <p className="text-sm mb-3">{p.college}</p>
            
                {/* check for not empty */}
                    {p.bio && (
                        <div>
                        <div className="text-xs text-cyan-300 tracking-widest mb-1">BIO</div>
                        <p className="text-sm text-gray-300 mb-3">{p.bio}</p>
                        </div>
                    )}


                    {p.interests && p.interests.length > 0 && (
                        <div>
                        <div className="text-xs text-cyan-300 tracking-widest mb-1">INTERESTS</div>
                        <div className="flex flex-wrap gap-1 mb-3">
                            {p.interests.map((i) => (
                            <span key={i} className="text-xs border border-cyan-400/40 px-2 py-1 rounded-full">{i}</span>
                            ))}
                        </div>
                        </div>
                    )}

                    {p.linkedin && (
                        <a href={p.linkedin} target="_blank" rel="noreferrer" className="text-sm text-purple-300 underline block mb-1">LinkedIn profile</a>
                    )}

                    <div className="mt-auto pt-5">
                    <button onClick={() => handleConnect(p)} className="connect-btn">
                        <span className="connect-btn-label">CONNECT</span>
                        <span className="connect-btn-icon"></span>
                    </button>
                    </div>
                    </div>
                </div>
            
        ))}
        </div>
        

   
    </main>

      {/* bottom bar */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 bg-[#2c2937]/80 backdrop-blur-md border border-white/10 rounded-full p-1.5 shadow-2xl">

        <button onClick={() => navigate("/home")} title="Galaxy" className={barBtn(false)}>
          <FaGlobe /> <span className="hidden sm:inline">Galaxy</span>
        </button>

        <button onClick={() => navigate("/matching")} title="Matching" className={barBtn(true)}>
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
