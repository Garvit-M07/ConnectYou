import { useState } from "react";
import { FaEye, FaEyeSlash, FaUserCircle } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // error msgs
  const [emailError, setEmailError] = useState("");
  const [passError, setPassError] = useState("");

  function handleLogin(e) {
    e.preventDefault();

    // reset errors every time
    setEmailError("");
    setPassError("");

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

    console.log(email, password);
    // TODO login stuff goes here
  }

  function handleGoogleLogin() {
    console.log("google clicked");
  }


  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#14111d] via-[#231c36] to-[#14111d] flex items-center justify-center p-6 text-white">

      {/* blurry glow circles for the background */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-600 opacity-20 blur-3xl rounded-full"></div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-pink-500 opacity-10 blur-3xl rounded-full"></div>

      <div className="relative w-full max-w-4xl bg-[#2c2937] rounded-2xl p-4 grid gap-6 md:grid-cols-2 md:min-h-[540px] shadow-2xl">

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
            Don't have an account? <a href="#" className="text-white underline">Sign up</a>
          </p>

          {/* noValidate so the browser popup doesnt show, we use our own msgs */}
          <form onSubmit={handleLogin} noValidate className="flex flex-col gap-4">

            <div>
              <input
                type="email"
                placeholder="Email"
                autoFocus
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                  onChange={(e) => setPassword(e.target.value)}
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

            <button type="submit" className="bg-[#6d5bb8] hover:bg-[#7c6bc8] active:scale-95 transition font-semibold py-3 rounded-lg">
              Log in
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
