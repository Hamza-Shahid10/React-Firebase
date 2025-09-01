import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import { Link, useNavigate } from 'react-router-dom'
import { auth } from '../config/firebase'
import "../styles/Login.css"
import {
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence,
    signInWithPopup,
    onAuthStateChanged,
} from 'firebase/auth'

export default function Login() {
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [remember, setRemember] = useState(false)
    const [showPwd, setShowPwd] = useState(false)

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => {
            // if (u) navigate('/dashboard', { replace: true })
        })
        return () => unsub()
    }, [navigate])

    const handleLogin = async (e) => {
        e.preventDefault()
        try {
            Swal.fire({ title: 'Logging in…', allowOutsideClick: false, didOpen: () => Swal.showLoading() })
            await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence)
            const userCred = await signInWithEmailAndPassword(auth, email.trim(), password)
            const user = userCred.user
            Swal.close()
            const authUser = {
                displayName: user.displayName || email.split('@')[0],
                email: user.email,
                uid: user.uid,
            }
            localStorage.setItem('authUser', JSON.stringify(authUser))
            Swal.fire({ title: 'Welcome!', icon: 'success', timer: 900, showConfirmButton: false })
            navigate('/dashboard')
        } catch (err) {
            Swal.fire('Login Failed', err.message, 'error')
        }
    }

    const provider = new GoogleAuthProvider()
    const handleGoogle = async () => {
        try {
            Swal.fire({ title: 'Redirecting to Google…', allowOutsideClick: false, didOpen: () => Swal.showLoading() })
            await setPersistence(auth, browserLocalPersistence)
            await signInWithPopup(auth, provider)
            Swal.close()
            Swal.fire({ title: 'Signed in with Google', icon: 'success', timer: 900, showConfirmButton: false })
            navigate('/dashboard')
        } catch (err) {
            Swal.fire('Google Login Failed', err.message, 'error')
        }
    }

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h1>Welcome Back</h1>
                    <p>Sign in to your account</p>
                </div>

                <form onSubmit={handleLogin} className="login-form">
                    <div className="login-form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <div className="login-form-group">
                        <label>Password</label>
                        <div className="login-password-toggle">
                            <input
                                type={showPwd ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                            />
                            <button
                                type="button"
                                className="login-toggle-btn"
                                onClick={() => setShowPwd(!showPwd)}
                            >
                                {showPwd ? '🙈' : '👁️'}
                            </button>
                        </div>
                    </div>

                    <div className="login-remember-me">
                        <input
                            type="checkbox"
                            id="remember"
                            checked={remember}
                            onChange={(e) => setRemember(e.target.checked)}
                        />
                        <label htmlFor="remember">Remember me</label>
                    </div>

                    <button type="submit" className="login-btn">
                        Sign In
                    </button>
                </form>

                <div className="login-forgot">
                    <Link to="/forgot-password">Forgot your password?</Link>
                </div>

                <div className="login-signup">
                    Don't have an account? <Link to="/signup">Sign Up</Link>
                </div>

                <div className="login-google">
                    <p>or sign in with</p>
                    <button className="login-btn google-btn" onClick={handleGoogle}>
                        Google
                    </button>
                </div>
            </div>
        </div>
    )
}
