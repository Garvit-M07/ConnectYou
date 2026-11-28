import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaGlobe, FaCommentDots, FaSignOutAlt, FaUserCircle, FaUserFriends, FaPen } from "react-icons/fa";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, updateDoc} from "firebase/firestore";
import { auth, db } from "../firebase";
import "./Home.css";   // the particles css is in here

// credits
// bg particles: https://codepen.io/perror12/pen/gbwZKQg

const particles = Array.from({ length: 24 }, () => ({
  left: Math.random() * 100,
  size: Math.random() * 6 + 2,
  duration: Math.random() * 4 + 5,
  delay: Math.random() * 8,
}));

// same style for all the inputs
const inputStyle = "w-full rounded-lg border border-white/10 bg-slate-800/60 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400";


function Profile() {
    const navigate = useNavigate();

    const [fieldErrors, setFieldErrors] = useState({});
    const [profile, setProfile] = useState(null);   // the saved profile
    const [editing, setEditing] = useState(false);
    const [error, setError] = useState("");

  useEffect(() => {
    
    // if user logs out go to login
    const unsub = onAuthStateChanged(auth, async (user) => {
        
      if (!user) {
        navigate("/");
        return;
      }
      

      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        const data = snap.data();
        setProfile({ ...data, email: user.email });
      } catch (err) {
        console.log(err);
        setError("Couldn't load profile (" + err.code + ")");
      }
    });

    return () => unsub();
  }, []);

  // when the pen button is clicked
  function startEdit() {
    setEditing(true);
  }

  // when save is clicked we just grab whatever is in each input
    async function handleSave() {
        const firstName = document.getElementById("firstName").value.trim();
        const lastName = document.getElementById("lastName").value.trim();
        const major = document.getElementById("major").value.trim();
        const year = document.getElementById("year").value;
        const college = document.getElementById("college").value.trim();
        const linkedin = document.getElementById("linkedin").value.trim();
        const interests = document.getElementById("interests").value.trim();   // still just text, not a list
        const bio = document.getElementById("bio").value.trim();

        
        const snap = await getDoc(doc(db, "users", auth.currentUser?.uid));
        const data = snap.data();

        //get old data
        const oldFirstName = data.firstName;
        const oldLastName = data.lastName;
        const oldMajor = data.major;
        const oldYear = data.year;
        const oldCollege = data.college;
        const oldLinkedin = data.linkedin;
        const oldInterests = data.interests;
        const oldBio = data.bio;

        try {
            if (firstName !== oldFirstName) {
                await updateDoc(doc(db, "users", auth.currentUser?.uid), {
                    firstName: firstName,
                });
            }

            if (lastName !== oldLastName) {
                await updateDoc(doc(db, "users", auth.currentUser?.uid), {
                    lastName: lastName,
                });
            }

            if (major !== oldMajor) {
                await updateDoc(doc(db, "users", auth.currentUser?.uid), {
                    major: major,
                });
            }

            if (year !== oldYear) {
                await updateDoc(doc(db, "users", auth.currentUser?.uid), {
                    year: year,
                });
            }

            if (college !== oldCollege) {
                await updateDoc(doc(db, "users", auth.currentUser?.uid), {
                    college: college,
                });
            }

            if (linkedin !== oldLinkedin) {
                await updateDoc(doc(db, "users", auth.currentUser?.uid), {
                    linkedin: linkedin,
                });
            }

            if (bio !== oldBio) {
                await updateDoc(doc(db, "users", auth.currentUser?.uid), {
                    bio: bio,
                });
            }

            const newInterests = interests.split(",").map((i) => i.trim()).filter((i) => i !== "");
            const savedInterests = oldInterests ?? [];

            let changed = newInterests.length !== savedInterests.length;

            if (!changed) {
                for (let i = 0; i < newInterests.length; i++) {
                    if (newInterests[i] !== savedInterests[i]) {
                        changed = true;
                        break;
                    }
                }
            }

            if (changed) {
                await updateDoc(doc(db, "users", auth.currentUser?.uid), {
                    interests: newInterests,
                });
            }
            
            const updatedSnap = await getDoc(doc(db, "users", auth.currentUser?.uid));
            setProfile(updatedSnap.data());
            setEditing(false);
            setEditing(false);
        } catch (error) {
                console.error("Couldn't save profile:", error);
        }
  }

  async function handleLogout() {
    await signOut(auth);
    navigate("/", { replace: true });
  }

  function barBtn(active) {
    return "flex items-center gap-2 px-4 py-2.5 rounded-full text-sm transition cursor-pointer " + (active ? "bg-cyan-600 text-white" : "text-gray-300 hover:text-white");
  }


  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0b1020] text-white">

      {/* background = just the color above + the particles */}
      {particles.map((p, i) => (
        <span key={i} className="orb-particle" style={{ left: p.left + "%", width: p.size, height: p.size, animationDuration: p.duration + "s", animationDelay: "-" + p.delay + "s" }}></span>
      ))}

      <main className="relative z-10 mx-auto w-full max-w-2xl px-4 pt-10 pb-28">

        {error && <p className="mb-4 text-center text-sm text-red-400">{error}</p>}

        {!profile && !error && <p className="text-center text-gray-400">Loading...</p>}

        {profile && (
          <div className="relative rounded-2xl border border-cyan-300/15 bg-slate-900/55 p-6 shadow-xl backdrop-blur-xl">

            {/* edit button (pen icon) */}
            {!editing && (
              <button onClick={startEdit} title="Edit profile" className="absolute right-4 top-4 cursor-pointer rounded-full border border-cyan-300/30 p-2.5 text-cyan-300 transition hover:bg-cyan-400/20">
                <FaPen />
              </button>
            )}

            {/* avatar + name */}
            <div className="mb-6 flex flex-col items-center text-center">
              <FaUserCircle className="text-8xl text-cyan-300" />
              <p className="mt-3 text-2xl font-semibold">{profile.firstName} {profile.lastName}</p>
              <p className="text-sm text-gray-400">{profile.email}</p>
            </div>


            {/* NOT editing: just show everything */}
            {!editing && (
              <div>
                <div className="text-xs text-cyan-300 tracking-widest mb-1">MAJOR</div>
                <p className="text-sm mb-4">{profile.major} · {profile.year}</p>

                <div className="text-xs text-cyan-300 tracking-widest mb-1">COLLEGE</div>
                <p className="text-sm mb-4">{profile.college}</p>

                {profile.bio && (
                  <div>
                    <div className="text-xs text-cyan-300 tracking-widest mb-1">BIO</div>
                    <p className="text-sm text-gray-300 mb-4">{profile.bio}</p>
                  </div>
                )}

                {profile.interests && profile.interests.length > 0 && (
                  <div>
                    <div className="text-xs text-cyan-300 tracking-widest mb-1">INTERESTS</div>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {profile.interests.map((i) => (
                        <span key={i} className="text-xs border border-cyan-400/40 px-2 py-1 rounded-full">{i}</span>
                      ))}
                    </div>
                  </div>
                )}

                {profile.linkedin && (
                  <a href={profile.linkedin} target="_blank" rel="noreferrer" className="text-sm text-cyan-300 underline">LinkedIn profile</a>
                )}
              </div>
            )}


            {/* edit mode (defaultValue = start with the saved value, then you can type) */}
            {editing && (
              <div className="flex flex-col gap-3">

                <div className="grid grid-cols-2 gap-3">
                  <input id="firstName" placeholder="First name" defaultValue={profile.firstName} className={inputStyle} />
                  <input id="lastName" placeholder="Last name" defaultValue={profile.lastName} className={inputStyle} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <input id="major" placeholder="Major" defaultValue={profile.major} className={inputStyle} />
                  <select id="year" defaultValue={profile.year} className={inputStyle}>
                    <option value="Freshman">Freshman</option>
                    <option value="Sophomore">Sophomore</option>
                    <option value="Junior">Junior</option>
                    <option value="Senior">Senior</option>
                    <option value="Graduate">Graduate</option>
                  </select>
                </div>

                <input id="college" placeholder="College / University" defaultValue={profile.college} className={inputStyle} />
                <input id="linkedin" placeholder="LinkedIn link" defaultValue={profile.linkedin} className={inputStyle} />
                <input id="interests" placeholder="Interests (separate with commas)" defaultValue={profile.interests ? profile.interests.join(", ") : ""} className={inputStyle} />
                <textarea id="bio" placeholder="Short bio" maxLength={200} rows={3} defaultValue={profile.bio} className={inputStyle + " resize-none"} />

                <div className="mt-2 flex gap-3">
                  <button onClick={() => setEditing(false)} className="flex-1 cursor-pointer rounded-lg border border-white/20 py-2 text-sm text-gray-300 hover:bg-white/10">Cancel</button>
                  <button onClick={handleSave} className="flex-1 cursor-pointer rounded-lg bg-cyan-600 py-2 text-sm font-semibold text-white hover:bg-cyan-500">Save</button>
                </div>
              </div>
            )}

          </div>
        )}
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

        {/* we are on the profile page */}
        <button onClick={() => navigate("/profile")} title="Profile" className={barBtn(true)}>
          <FaUserCircle /> <span className="hidden sm:inline">Profile</span>
        </button>

        <button onClick={handleLogout} title="Log out" className={barBtn(false)}>
          <FaSignOutAlt /> <span className="hidden sm:inline">Log out</span>
        </button>
      </div>
    </div>
  );
}

export default Profile;
