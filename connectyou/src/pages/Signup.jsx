import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaUserCircle } from "react-icons/fa";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";
import "./Home.css";

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


function Signup() {
  const navigate = useNavigate();

  // "users" collection stuff
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    major: "",
    year: "",
    college: "",
    linkedin: "",
    lookingFor: "",
    interests: "",
    bio: "",
  });


  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // errors 
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");


  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // gives the input a red border if it has an error
  function inputClass(name) {
    return "w-full bg-[#3b3748] px-4 py-3 rounded-lg outline-none border " + (errors[name] ? "border-red-400" : "border-transparent focus:border-purple-400");
  }

  // small red text under the input
  function showErr(name) {
    if (errors[name]) {
      return <p className="text-red-400 text-xs mt-1">{errors[name]}</p>;
    }
    return null;
  }

  async function handleSignup(e) {
    e.preventDefault();
    setGeneralError("");

    // check everything first
    const newErrors = {};

    if (form.firstName.trim() === "") newErrors.firstName = "First name is required";
    if (form.lastName.trim() === "") newErrors.lastName = "Last name is required";

    if (form.email.trim() === "") {
      newErrors.email = "Email is required";
    } else if (!form.email.includes("@") || !form.email.includes(".")) {
      newErrors.email = "Enter a valid email";
    }

    if (form.password === "") {
      newErrors.password = "Password is required";
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (form.confirmPassword === "") {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (form.confirmPassword !== form.password) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (form.major.trim() === "") newErrors.major = "Major is required";
    if (form.year === "") newErrors.year = "Pick your year";
    if (form.college.trim() === "") newErrors.college = "College is required";

    // linkedin is optional but if they type something it has to look right
    if (form.linkedin.trim() !== "" && !form.linkedin.includes("linkedin.com/")) {
      newErrors.linkedin = "Enter a valid LinkedIn link";
    }



    setErrors(newErrors);

    // if there is any error stop here
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);

    try {
      // step 1: make the account in firebase auth
      const result = await createUserWithEmailAndPassword(auth, form.email, form.password);
      const user = result.user;

      await updateProfile(user, { displayName: form.firstName + " " + form.lastName });

      // step 2: save the rest of the info in firestore (users/uid)
      await setDoc(doc(db, "users", user.uid), {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        major: form.major.trim(),
        year: form.year,
        college: form.college.trim(),
        linkedin: form.linkedin.trim(),
        interests: form.interests.split(",").map((i) => i.trim()).filter((i) => i !== ""),
        bio: form.bio.trim(),
        createdAt: serverTimestamp(),
      });

      navigate("/home");
    } catch (err) {
      console.log(err.code);

      if (err.code === "auth/email-already-in-use") {
        setErrors({ email: "This email already has an account" });
      } else if (err.code === "auth/invalid-email") {
        setErrors({ email: "Enter a valid email" });
      } else if (err.code === "auth/weak-password") {
        setErrors({ password: "Password is too weak" });
      } else if (err.code === "auth/network-request-failed") {
        setGeneralError("Network problem, check your internet");
      } else {
        setGeneralError("Something went wrong, try again");
      }
    }

    setLoading(false);
  }


  return (
    <div className="orb-scene flex items-center justify-center p-6 text-white">

      <div className="orb-grid"></div>
      <div className="orb-glow orb-glow-1"></div>
      <div className="orb-glow orb-glow-2"></div>

      {particles.map((p, i) => (
        <span key={i} className="orb-particle" style={{ left: p.left + "%", width: p.size, height: p.size, animationDuration: p.duration + "s", animationDelay: "-" + p.delay + "s" }}></span>
      ))}

      <div className="relative w-full max-w-4xl bg-[#2c2937] rounded-2xl p-4 grid gap-6 md:grid-cols-2 shadow-2xl">

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
          <h1 className="text-3xl font-semibold mb-2">Create an account</h1>
          <p className="text-sm text-gray-400 mb-6">
            Already have an account? <Link to="/" className="text-white underline">Log in</Link>
          </p>


          <form onSubmit={handleSignup} noValidate className="flex flex-col gap-4">

            {/* name */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input name="firstName" placeholder="First name" autoFocus value={form.firstName} onChange={handleChange} className={inputClass("firstName")} />
                {showErr("firstName")}
              </div>
              <div>
                <input name="lastName" placeholder="Last name" value={form.lastName} onChange={handleChange} className={inputClass("lastName")} />
                {showErr("lastName")}
              </div>
            </div>

            <div>
              <input type="email" name="email" placeholder="Email" autoComplete="email" value={form.email} onChange={handleChange} className={inputClass("email")} />
              {showErr("email")}
            </div>

            {/* pwds */}
            <div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  autoComplete="new-password"
                  value={form.password}
                  onChange={handleChange}
                  className={inputClass("password") + " pr-12"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {showErr("password")}
            </div>

            <div>
              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm password"
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={handleChange}
                className={inputClass("confirmPassword")}
              />
              {showErr("confirmPassword")}
            </div>

            {/* major + year */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input name="major" placeholder="Major" value={form.major} onChange={handleChange} className={inputClass("major")} />
                {showErr("major")}
              </div>
              <div>
                <select name="year" value={form.year} onChange={handleChange} className={inputClass("year")}>
                  <option value="">Year</option>
                  <option value="Freshman">Freshman</option>
                  <option value="Sophomore">Sophomore</option>
                  <option value="Junior">Junior</option>
                  <option value="Senior">Senior</option>
                  <option value="Graduate">Graduate</option>
                </select>
                {showErr("year")}
              </div>
            </div>

            <div>
              <input name="college" placeholder="College / University" value={form.college} onChange={handleChange} className={inputClass("college")} />
              {showErr("college")}
            </div>

            <div>
              <input name="linkedin" placeholder="LinkedIn link (optional)" value={form.linkedin} onChange={handleChange} className={inputClass("linkedin")} />
              {showErr("linkedin")}
            </div>


            <input name="interests" placeholder="Interests (separate with commas)" value={form.interests} onChange={handleChange} className={inputClass("interests")} />
            <div>
              <textarea name="bio" placeholder="Short bio (optional)" maxLength={200} rows={3} value={form.bio} onChange={handleChange} className={inputClass("bio") + " resize-none"}
              />
              <p className="text-gray-500 text-xs text-right">{form.bio.length}/200</p>
            </div>

            {generalError && <p className="text-red-400 text-sm text-center">{generalError}</p>}

            <button type="submit" disabled={loading} className="bg-[#6d5bb8] hover:bg-[#7c6bc8] active:scale-95 transition disabled:opacity-50 font-semibold py-3 rounded-lg">
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Signup;
