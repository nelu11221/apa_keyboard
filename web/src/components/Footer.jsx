import { useState } from 'react'
import { Link } from 'react-router-dom'

import { Logo } from './Icons.jsx'
import Picture from './Picture.jsx'

export default function Footer() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  return (
    <footer className="footer">
      <div className="footer-card footer-card-left">
        <Logo dark size={24} />
        <p className="footer-desc">
          A premium mechanical keyboard designed for performance, customization, and complete control down to every key.
        </p>
        <h4>Stay in the loop.</h4>
        <p className="footer-muted">Get product updates, new releases, and exclusive news from NEXA.</p>
        <form
          className="footer-form"
          onSubmit={(event) => {
            event.preventDefault()
            setSubscribed(true)
          }}
        >
          <input
            type="email"
            required
            placeholder="ENTER YOUR EMAIL"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <button type="submit" className="btn btn-orange">{subscribed ? 'SUBSCRIBED' : 'SUBSCRIBE'}</button>
        </form>
      </div>

      <div className="footer-card footer-card-right">
        <div className="footer-cols">
          <div>
            <h5>EXPLORE</h5>
            <Link to="/#features">Features</Link>
            <Link to="/#explore">Technology</Link>
            <Link to="/shop?category=keycaps">Customization</Link>
            <Link to="/shop?category=accessories">Support</Link>
          </div>
          <div>
            <h5>COMPANY</h5>
            <a href="#about">About NEXA</a>
            <a href="#journal">Journal</a>
            <a href="#careers">Careers</a>
            <a href="#contact">Contact</a>
          </div>
          <div>
            <h5>FOLLOW US</h5>
            <a href="#instagram">Instagram</a>
            <a href="#x">X / Twitter</a>
            <a href="#linkedin">LinkedIn</a>
            <a href="#youtube">YouTube</a>
          </div>
        </div>
        <div className="footer-keycap">
          <Picture name="footerKeycap" kind="keycaps" rows={2} cols={2} accent="orange" alt="Keycaps" />
        </div>
        <div className="footer-bottom">
          <span>© 2026 NEXA. All rights reserved.</span>
          <div className="footer-legal">
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
            <a href="#cookies">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
