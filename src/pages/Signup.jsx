import { useState } from 'react'
import Swal from 'sweetalert2'
import { auth } from '../config/firebase'
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth'
import { Link, useNavigate } from 'react-router-dom'
import "../styles/Signup.css"

export default function Signup() {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [showCPwd, setShowCPwd] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      Swal.fire('Oops!', 'Passwords do not match!', 'error')
      return
    }

    try {
      setLoading(true)
      Swal.fire({
        title: 'Creating account…',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      })

      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password)
      await updateProfile(cred.user, { displayName: fullName.trim() })
      const authUser = {
        displayName: cred.user.displayName || email.split('@')[0],
        email: cred.user.email,
        uid: cred.user.uid,
      };
      localStorage.setItem('authUser', JSON.stringify(authUser));
      
      await Swal.fire({
        title: 'Success!',
        text: 'Account created successfully',
        icon: 'success',
        confirmButtonText: 'Go to Login',
      })
      navigate('/login')
    } catch (err) {
      Swal.fire('Error', err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-card">
      <div className="auth-header">
        <h1>Create Account</h1>
        <p>Join us today and start your journey</p>
      </div>

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter your full name"
            required
          />
        </div>

        <div className="form-group">
          <label>Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <div className="password-toggle">
            <input
              type={showPwd ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              required
            />
            <button
              type="button"
              className="toggle-btn"
              onClick={() => setShowPwd((s) => !s)}
              aria-label="Toggle password visibility"
            >
              {showPwd ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label>Confirm Password</label>
          <div className="password-toggle">
            <input
              type={showCPwd ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
            />
            <button
              type="button"
              className="toggle-btn"
              onClick={() => setShowCPwd((s) => !s)}
              aria-label="Toggle confirm password visibility"
            >
              {showCPwd ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        <button className="btn" type="submit" disabled={loading}>
          {loading ? 'Please wait…' : 'Sign Up'}
        </button>
      </form>

      <div className="muted-center">
        Already have an account? <Link to="/login">Sign In</Link>
      </div>
    </div>
  )
}