import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaUserCircle } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import "./pages/Home.css";

const particles = Array.from({ length: 24 }, () => ({
  left: Math.random() * 100,
  size: Math.random() * 6 + 2,
  duration: Math.random() * 4 + 5,
  delay: Math.random() * 8,
}));

function ConnectionAnimation() {
  return (
    <svg viewBox="0 0 400 240" className="h-full w-full">
      <path
        id="connection-route"
        d="M 45 175 C 120 35, 280 215, 355 65"
        fill="none"
        stroke="#a78bfa"
        strokeWidth="3"
      />

      <FaUserCircle x={29} y={159} size={32} color="#ff75cb" />
      <FaUserCircle x={339} y={49} size={32} color="#6aeeff" />

      <circle r="5" fill="white">
        <animateMotion dur="3s" repeatCount="indefinite">
          <mpath href="#connection-route" />
        </animateMotion>
      </circle>
    </svg>
  );
}


function App() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // error msgs
  const [emailError, setEmailError] = useState("");
  const [passError, setPassError] = useState("");
  const [generalError, setGeneralError] = useState("");

  function clearErrors() {
    setEmailError("");
    setPassError("");
    setGeneralError("");
  }

  // checks if the user is also in the firestore "users" collection
  // if yes -> go home, if no -> log them out again and show error
  async function checkUserInDb(user) {
    const snap = await getDoc(doc(db, "users", user.uid));

    if (snap.exists()) {
      navigate("/home");
    } else {
      await signOut(auth);
      setGeneralError("No account found for this user. Please sign up first.");
    }
  }

  function showError(err) {
    console.log(err.code);

    if (err.code === "auth/invalid-email") {
      setEmailError("Enter a valid email");
    } else if (err.code === "auth/user-not-found") {
      setEmailError("No account with this email");
    } else if (err.code === "auth/wrong-password") {
      setPassError("Wrong password");
    } else if (err.code === "auth/invalid-credential") {
      setPassError("Incorrect email or password");
    } else if (err.code === "auth/too-many-requests") {
      setGeneralError("Too many tries, wait a bit and try again");
    } else if (err.code === "auth/network-request-failed") {
      setGeneralError("Network problem, check your internet");
    } else if (err.code === "auth/popup-closed-by-user") {
      setGeneralError("Google popup was closed");
    } else {
      setGeneralError("Something went wrong, try again");
    }
  }

  async function handleLogin(e) {
    e.preventDefault();

    
    clearErrors();

    let ok = true;

    if (email.trim() === "") {
      setEmailError("Email is required");
      ok = false;
    }

    if (password === "") {
      setPassError("Password is required");
      ok = false;
    } else if (password.length < 6) {
      setPassError("Password must be at least 6 characters");
      ok = false;
    }

    // stop here if something is wrong
    if (!ok) return;

    setLoading(true);

    try {
      // step 1: firebase authentication
      const result = await signInWithEmailAndPassword(auth, email, password);

      // step 2: firestore
      await checkUserInDb(result.user);
    } catch (err) {
      showError(err);
    }

    setLoading(false);
  }

  async function handleGoogleLogin() {
    clearErrors();

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await checkUserInDb(result.user);
    } catch (err) {
      showError(err);
    }
  }


  return (
      <div className="orb-scene flex items-center justify-center p-6 text-white">

      <div className="orb-grid"></div>
      <div className="orb-glow orb-glow-1"></div>
      <div className="orb-glow orb-glow-2"></div>

      {particles.map((p, i) => (
        <span key={i} className="orb-particle" style={{ left: p.left + "%", width: p.size, height: p.size, animationDuration: p.duration + "s", animationDelay: "-" + p.delay + "s" }}></span>
      ))}

      <div className="relative z-10 w-full max-w-4xl bg-[#2c2937] rounded-2xl p-4 grid gap-6 md:grid-cols-2 md:min-h-[540px] shadow-2xl">

        {/* left side, hidden on phone */}
        <div className="hidden md:flex flex-col justify-between bg-[#221f2c] rounded-xl p-6">
          <div className="text-2xl font-bold">ConnectYou</div>

          <div className="h-48">
            <ConnectionAnimation />
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-2">Connecting People, Bridging Ideas</h2>
            <p className="text-sm text-gray-400 mb-4">
              Meet new people, share your ideas and stay close to the ones that matter.
            </p>
            <ul className="text-sm text-gray-300 flex flex-col gap-1">
              <li>✓ Find people who like the same things</li>
              <li>✓ Chat and share in one place</li>
            </ul>
          </div>
        </div>

        {/* right side */}
        <div className="flex flex-col justify-center px-2 py-4">
          <h1 className="text-3xl font-semibold mb-2">Welcome back</h1>
          <p className="text-sm text-gray-400 mb-6">
            Don't have an account? <a href="/signup" className="text-white underline">Sign up</a>
          </p>


          <form onSubmit={handleLogin} noValidate className="flex flex-col gap-4">

            <div>
              <input
                type="email"
                placeholder="Email"
                autoFocus
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={"w-full bg-[#3b3748] px-4 py-3 rounded-lg outline-none border " + (emailError ? "border-red-400" : "border-transparent focus:border-purple-400")}
              />
              {emailError && <p className="text-red-400 text-xs mt-1">{emailError}</p>}
            </div>

            <div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className={"w-full bg-[#3b3748] px-4 py-3 pr-12 rounded-lg outline-none border " + (passError ? "border-red-400" : "border-transparent focus:border-purple-400")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {passError && <p className="text-red-400 text-xs mt-1">{passError}</p>}
            </div>

            <a href="#" className="text-xs text-gray-400 text-right hover:text-white">Forgot password?</a>

            {generalError && <p className="text-red-400 text-sm text-center">{generalError}</p>}

            <button type="submit" disabled={loading} className="bg-[#6d5bb8] hover:bg-[#7c6bc8] active:scale-95 transition disabled:opacity-50 font-semibold py-3 rounded-lg">
              {loading ? "Logging in..." : "Log in"}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5 text-xs text-gray-500">
            <div className="h-px flex-1 bg-gray-600"></div>
            <span>Or log in with</span>
            <div className="h-px flex-1 bg-gray-600"></div>
          </div>

          <button onClick={handleGoogleLogin} className="flex items-center justify-center gap-2 border border-gray-600 hover:bg-[#3b3748] py-3 rounded-lg">
            <FcGoogle size={20} /> Google
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
