import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaSignOutAlt, FaUserCircle, FaChevronRight, FaChevronLeft, FaGlobe, FaUserFriends, FaCommentDots } from "react-icons/fa";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, query, where, addDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";
import "./Home.css";       // the navbar css is in here
import "./Matching.css";

const particles = Array.from({ length: 24 }, () => ({
  left: Math.random() * 100,
  size: Math.random() * 6 + 2,
  duration: Math.random() * 4 + 5,
  delay: Math.random() * 8,
}));


function Matching() {
    const navigate = useNavigate();
    const [person, setPerson] = useState([]);
    const [filtered, setFiltered] = useState([]);   // the people that match the search
    // const [error, setError] = useState("");
    // const [index, setIndex] = useState(0);
    const [text, setText] = useState("");   // the text in the search bar
    const [menuOpen, setMenuOpen] = useState(false);   // for the hamburger on mobile

  // refs for the navbar stuff (instead of document.querySelector)
  const navRef = useRef(null);
  const menuRef = useRef(null);
  const indicatorRef = useRef(null);
  const glowRef = useRef(null);


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
        //filter as per major and not name  (|| "" so it doesnt crash if someone has no major)
        const filtered = person.filter(p => (p.major || "").toLowerCase().includes(searchText.toLowerCase()));
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

    resetIndicator();

    return () => unsub();   // stop listening when the page closes

    }, []);


  // move the indicator under the link that the mouse is on
  function moveIndicator(e) {
    indicatorRef.current.style.width = e.currentTarget.offsetWidth + "px";
    indicatorRef.current.style.left = e.currentTarget.offsetLeft + "px";
  }

  // when the mouse leaves the menu, go back to Matching (we are on this page)
  function resetIndicator() {
    const links = menuRef.current.querySelectorAll("a");
    const matchingLink = links[1];
    if (matchingLink) {
      indicatorRef.current.style.width = matchingLink.offsetWidth + "px";
      indicatorRef.current.style.left = matchingLink.offsetLeft + "px";
    }
  }

  function goTo(e, path) {
    e.preventDefault();
    setMenuOpen(false);
    navigate(path);
  }

  async function handleLogout() {
    await signOut(auth);
    navigate("/", { replace: true });
  }

  return (
    <div className="orb-scene text-white">

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



    {/* pt-32 so the fixed navbar doesnt cover the search bar */}
    <main className="relative z-10 w-full px-4 pt-32 pb-10 sm:px-8">

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
            <input type="text" id="searchInput" placeholder="Search Majors.." spellCheck="false" onChange={e => searchOperation(e.target.value)} />
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

    {/* grid of cards (starts from the left) */}
    {/* the card classes are match-card now, because neo-card from Home.css has !important and was breaking the size here */}

    <div className="mt-10 grid auto-rows-fr grid-cols-1 gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        {filtered.map((p) => (

            <div key={p.id} className="match-card">
            <div className="match-card-inner">

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
                        <a href={p.linkedin} target="_blank" rel="noreferrer" className="text-sm text-cyan-300 underline block mb-1">LinkedIn profile</a>
                    )}

                    {/* mt-auto pushes the button to the bottom of the card, pt-5 keeps a gap above it */}
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

    </div>
  );
}

export default Matching;
