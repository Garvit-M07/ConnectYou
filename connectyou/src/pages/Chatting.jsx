import { Link, useNavigate } from "react-router-dom";
import { FaGlobe, FaCommentDots, FaSignOutAlt } from "react-icons/fa";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import "./Home.css";
import { collection, getDocs, query, where } from "firebase/firestore";

//all chats of the currentUser
async function getCurrentUserChats() {
  const currentUid = auth.currentUser?.uid;
  if (!currentUid) return [];

  const chatsQuery = query(
    collection(db, "chats"),
    where("users", "array-contains", currentUid)
  );

  const snapshot = await getDocs(chatsQuery);
  const otherUserIds = [];

  //iterate through each chat document and find the other user's UID
  snapshot.forEach((chatDoc) => {
    const { users } = chatDoc.data();
    const otherUid = users.find((uid) => uid !== currentUid);

    if (otherUid) {
      otherUserIds.push(otherUid);
    }
  });

  if (otherUserIds.length === 0) return [];

    const usersQuery = query(
    collection(db, "users"),
    where(documentId(), "in", otherUserIds)
    );

    const usersSnapshot = await getDocs(usersQuery);
    const displayNames = [];

    usersSnapshot.forEach((userDoc) => {
    const user = userDoc.data();
    displayNames.push(`${user.firstName} ${user.lastName}`);
    });

    return displayNames;

}

function Chatting() {
  const navigate = useNavigate();
  const navItem =
    "flex items-center gap-2 rounded-full px-4 py-2.5 text-sm transition";

  async function handleLogout() {
    await signOut(auth);
    navigate("/", { replace: true });
  }

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















      <nav
        aria-label="Main navigation"
        className="fixed bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/10 bg-[#2c2937]/80 p-1.5 shadow-2xl backdrop-blur-md"
      >
        <Link
          to="/home"
          aria-label="Galaxy"
          className={`${navItem} text-gray-300 hover:text-white`}
        >
          <FaGlobe aria-hidden="true" />
          <span className="hidden sm:inline">Galaxy</span>
        </Link>

        <Link
          to="/chatting"
          aria-label="Chats"
          aria-current="page"
          className={`${navItem} bg-[#6d5bb8] text-white`}
        >
          <FaCommentDots aria-hidden="true" />
          <span className="hidden sm:inline">Chats</span>
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          aria-label="Log out"
          className={`${navItem} cursor-pointer text-gray-300 hover:text-white`}
        >
          <FaSignOutAlt aria-hidden="true" />
          <span className="hidden sm:inline">Log out</span>
        </button>
      </nav>
    </div>
  );
}

export default Chatting;