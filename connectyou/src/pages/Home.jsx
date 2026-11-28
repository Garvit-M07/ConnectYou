import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaGlobe, FaCommentDots, FaSignOutAlt, FaUserCircle, FaChevronRight, FaChevronLeft, FaUserFriends } from "react-icons/fa";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";
import "./Home.css";

// credits
// orb + bg particles: https://codepen.io/perror12/pen/gbwZKQg 
// panel: https://codepen.io/turkunazg/pen/EayeWaZ 

const particles = Array.from({ length: 24 }, () => ({
  left: Math.random() * 100,
  size: Math.random() * 6 + 2,
  duration: Math.random() * 4 + 5,
  delay: Math.random() * 8,
}));


function Home() {
  const navigate = useNavigate();

  //setState initialization for variables
  const [name, setName] = useState("");
  const [view, setView] = useState("galaxy");
  const [zoomed, setZoomed] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [people, setPeople] = useState([]);
  const [index, setIndex] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    //if user logsout, redirect to login page
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/");
        return;
      }

      if (user.displayName) {
        setName(user.displayName.split(" ")[0]);
      }

      try {
        const snap = await getDocs(collection(db, "users"));
        const list = [];
        snap.forEach((d) => {
          if (d.id !== user.uid) list.push({ id: d.id, ...d.data() });
        });

        //for errors
        console.log(list);   
        setPeople(list);
      } catch (err) {
        console.log(err);
        setError("Couldn't load people (" + err.code + ")");
      }
    });

    return () => unsub();
  }, []);

  function handleOrbClick() {
    console.log("orb");

    if (people.length === 0) {
      setError("The spiderverse is empty, this is your sign to invite people!");
      return;
    }

    setError("");
    setZoomed(true);
    setTimeout(() => setPanelOpen(true), 600);
  }

  function closePanel() {
    setPanelOpen(false);
    setZoomed(false);
  }

  function nextPerson() {
    // if (index == people.length - 1) { setIndex(0) } else { setIndex(index + 1) }
    setIndex((index + 1) % people.length);
  }

  // go to the person before
  function prevPerson() {
    if (index === 0) {
      setIndex(people.length - 1);
    } else {
      setIndex(index - 1);
    }
  }

  async function handleConnect() {
    try {
      //chatting doc framework
      //every chat will have a seperate document with the users chatting and the messages and also sent by whom
      await addDoc(collection(db, "chats"), {
        users: [auth.currentUser.uid, person.id],
        createdAt: serverTimestamp(),
        messages: [],
        messagesSentBy: [],
        messagesTimestamp: [],
      });


      navigate("/chatting", { state: { otherUid: person.id, otherName: person.firstName } });
    } catch (err) {
      console.log(err);
      setError("Couldn't connect (" + err.code + ")");
    }
  }

  async function handleLogout() {
    await signOut(auth);
    navigate("/");
  }

  function barBtn(active) {
    return "flex items-center gap-2 px-4 py-2.5 rounded-full text-sm transition " + (active ? "bg-[#6d5bb8] text-white" : "text-gray-300 hover:text-white");
  }

  const person = people[index];


  return (
    <div className="orb-scene text-white">

      <div className="orb-grid"></div>
      <div className="orb-glow orb-glow-1"></div>
      <div className="orb-glow orb-glow-2"></div>

      {particles.map((p, i) => (
        <span key={i} className="orb-particle" style={{ left: p.left + "%", width: p.size, height: p.size, animationDuration: p.duration + "s", animationDelay: "-" + p.delay + "s" }}></span>
      ))}


      {/* zoom by simply scaling the orb and blurring it which gives a nice effect */}
      <div className={"absolute inset-0 transition-all duration-700 " + (zoomed ? "scale-[3] opacity-20 blur-sm" : "")}>

        <div className="relative z-10 px-4 pt-6">
          <div className="text-2xl font-bold mb-6">ConnectYou</div>
          <h1 className="text-2xl sm:text-3xl font-semibold mb-1">Hello {name || "there"} !</h1>
          <p className="text-sm text-gray-400">Welcome to ConnectYou. Explore the spiderverse of connections.</p>
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </div>

        <div className="orb-wrapper">
          <div className="orb" onClick={handleOrbClick}>
            <div className="orb-core"></div>
            <div className="orb-ring orb-ring-1"></div>
            <div className="orb-ring orb-ring-2"></div>
            <div className="orb-ring orb-ring-3"></div>
          </div>
        </div>

        <p className="absolute bottom-28 w-full text-center text-xs sm:text-sm tracking-[0.3em] uppercase text-cyan">Tap to meet people</p>
      </div>


      {/* panel */}
      <div className={"fixed inset-0 z-30 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity duration-500 " + (panelOpen ? "opacity-100" : "opacity-0 pointer-events-none")}>

        {person && (
          <div className="neo-card">
            <span className="neo-glow"></span>

            <div className="neo-inner">

              {/* top row */}
              <div className="flex items-center justify-between mb-4 text-xs text-cyan-300 tracking-widest"> {/*set letter spacing*/}
                <span>PROFILE {index + 1}/{people.length}</span>
                <button onClick={closePanel} className="justify-end hover:text-white cursor-pointer">✕</button>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <FaUserCircle size={56} color="#6aeeff" />
                <div>
                  <p className="text-lg font-semibold">{person.firstName} {person.lastName}</p>
                  <p className="text-xs text-gray-300">{person.major} · {person.year}</p>
                </div>
              </div>

              <div className="text-xs text-cyan-300 tracking-widest mb-1">COLLEGE</div>
              <p className="text-sm mb-3">{person.college}</p>
            
            {/* check for not empty */}
              {person.bio && (
                <div>
                  <div className="text-xs text-cyan-300 tracking-widest mb-1">BIO</div>
                  <p className="text-sm text-gray-300 mb-3">{person.bio}</p>
                </div>
              )}


              {person.interests && person.interests.length > 0 && (
                <div>
                  <div className="text-xs text-cyan-300 tracking-widest mb-1">INTERESTS</div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {person.interests.map((i) => (
                      <span key={i} className="text-xs border border-cyan-400/40 px-2 py-1 rounded-full">{i}</span>
                    ))}
                  </div>
                </div>
              )}

              {person.linkedin && (
                <a href={person.linkedin} target="_blank" rel="noreferrer" className="text-sm text-purple-300 underline block mb-1">LinkedIn profile</a>
              )}

              <button onClick={handleConnect} className="neo-btn">CONNECT</button>
            </div>

            {/* back person */}
            <button onClick={prevPerson} title="Back" className="neo-arrow neo-arrow-left">
              <FaChevronLeft />
            </button>

            {/* skip person */}
            <button onClick={nextPerson} title="Skip" className="neo-arrow">
              <FaChevronRight />
            </button>
          </div>
        )}
      </div>


      {/* bottom bar */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 bg-[#2c2937]/80 backdrop-blur-md border border-white/10 rounded-full p-1.5 shadow-2xl">

        <button onClick={() => setView("galaxy")} title="Galaxy" className={barBtn(view === "galaxy")}>
        <div className="flex items-center gap-1.5 hover:cursor-pointer ">
            <FaGlobe /> <span className="hidden sm:inline ">Galaxy</span>
          </div>
        </button>

        <button onClick={() => navigate("/matching")} title="Matching" className={barBtn(false)}>
        <div className="flex items-center gap-1.5 hover:cursor-pointer ">
          <FaUserFriends /> <span className="hidden sm:inline hover:cursor-pointer">Matching</span>
          </div>
        </button>

        <button onClick={() => navigate("/chatting")} title="Chats" className={barBtn(false)}>
        <div className="flex items-center gap-1.5 hover:cursor-pointer ">
          <FaCommentDots /> <span className="hidden sm:inline hover:cursor-pointer">Chats</span>
          </div>
        </button>

        

        <button onClick={() => navigate("/profile")} title="Profile" className={barBtn(false)}>
        <div className="flex items-center gap-1.5 hover:cursor-pointer ">
          <FaUserCircle /> <span className="hidden sm:inline hover:cursor-pointer">Profile</span>
          </div>
        </button>

        <button onClick={handleLogout} title="Log out" className={barBtn(false)}>
          <div className="flex items-center gap-1.5 hover:cursor-pointer ">
          <FaSignOutAlt /> <span className="hidden sm:inline hover:cursor-pointer">Log out</span>
          </div>
        </button>
      </div>
    </div>
  );
}

export default Home;
