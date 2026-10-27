import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)
ScrollTrigger.config({ ignoreMobileResize: true }) // phone address bar hide/show should not refresh the animations

// image links. to use our own images, keep them in the public folder and write '/name.jpg'
const u = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=70`
const P = {
  hero: u('photo-1486718448742-163732cd1544'),
  tower: u('photo-1486406146926-c627a92ad1ab'),
  city: u('photo-1480714378408-67cf0d13bc1b'),
  projects: [u('photo-1545324418-cc1a3fa10c00'), u('photo-1449824913935-59a10b8d2000'), u('photo-1477959858617-67f85cf4f1df')],
  menu: [u('photo-1512917774080-9991f1c4c750'), u('photo-1545324418-cc1a3fa10c00'), u('photo-1477959858617-67f85cf4f1df'), u('photo-1486406146926-c627a92ad1ab'), u('photo-1480714378408-67cf0d13bc1b')],
}
const LINKS = ['Home', 'About', 'Services', 'Projects', 'Contact']
const FEATURES = [
  ['Smart control', 'Lighting, climate and security from a single app.'],
  ['Prime locations', 'Every address is chosen for access and skyline views.'],
  ['Built to last', 'Materials and structure tested well beyond code.'],
  ['Clear process', 'One team from first visit to key handover.'],
]

// small component for text lines. the outer span hides the text, the inner span slides up
const L = ({ children }) => <span className="mk"><span className="ln">{children}</span></span>

export default function App() {
  const root = useRef(null) // main wrapper, gsap only looks inside this
  const menuTl = useRef(null) // keeps the menu animation so we can play / reverse it
  const [open, setOpen] = useState(false) // menu open or closed (changes the button text)
  const [hover, setHover] = useState(0) // which menu link is hovered, used to change the menu image

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // 1. hero section: image zooms out, heading words slide up, small text fades in
      gsap.timeline({ defaults: { ease: 'power3.out' } })
        .from('.hero-img', { scale: 1.3, duration: 2 })
        .from('.hero h1 .w', { yPercent: 110, duration: 1.1, stagger: 0.12 }, 0.4)
        .from('.hero-sub, .nav, .ring', { opacity: 0, y: 20, duration: 0.9 }, 1.3)
      // hero image moves down slowly while scrolling (parallax)
      gsap.to('.hero-img', {
        yPercent: 20, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
      })

      // pin = section stays fixed on screen while we scroll, scrub = animation follows the scroll
      const pin = (trigger, end) => gsap.timeline({
        scrollTrigger: { trigger, start: 'top top', end, pin: true, scrub: 0.5 },
      })
      // empty pause in the timeline, so the page waits a little before the next animation
      const hold = (d) => ({ duration: d })

      // 2. intro section: text slides up and image comes from the right.
      //    then text slides out, image becomes smaller, moves down and changes to the next image
      pin('.intro', '+=300%')
        .from('.intro .ln', { yPercent: 110, stagger: 0.15, duration: 1 })
        .from('.intro .card', { xPercent: 110, duration: 1.2 }, 0)
        .to({}, hold(0.8))
        .to('.intro .ln', { yPercent: -110, stagger: 0.1, duration: 1 })
        .to('.intro .card', { width: '22vw', height: '30vh', right: '14vw', top: '56vh', duration: 2 }, '<')
        .to('.img-a', { opacity: 0, duration: 1 }, '<0.5')
        .to('.img-b', { scale: 1.15, duration: 1.5 }, '<')

      // 3. features section: heading slides up, cards come one from left and one from right, then everything goes out
      pin('.features', '+=250%')
        .from('.features .ln', { yPercent: 110, duration: 1 })
        .from('.feature', { x: (i) => (i % 2 ? 220 : -220), opacity: 0, stagger: 0.3, duration: 1 }, '<0.3')
        .to({}, hold(0.8))
        .to('.features .ln', { yPercent: -110, duration: 1 })
        .to('.feature', { x: (i) => (i % 2 ? -220 : 220), opacity: 0, stagger: 0.1, duration: 1 }, '<')

      // 4. projects section: text slides up, the 3 images cover each other one by one, number and title change
      const titles = ['Marina Heights', 'Glass Residences', 'Harbour Towers']
      let last = 0 // last image number shown, so we update text only when it changes
      pin('.projects', '+=350%')
        .from('.project-info .ln, .project-info p', { yPercent: 110, opacity: 0, stagger: 0.12, duration: 1 })
        .fromTo('.s1', { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 1, ease: 'none' }, 0)
        .fromTo('.s2', { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 1, ease: 'none' })
        .fromTo('.s3', { clipPath: 'inset(0 0 0 100%)' }, { clipPath: 'inset(0 0 0 0%)', duration: 1, ease: 'none' })
        // runs on every scroll, finds which image is showing (1, 2 or 3) from scroll progress
        .eventCallback('onUpdate', () => {
          const p = ScrollTrigger.getAll().find((t) => t.trigger?.classList?.contains('projects'))?.progress || 0
          const i = Math.min(2, Math.floor(p * 3))
          if (i !== last) {
            last = i
            document.querySelector('.count').textContent = '0' + (i + 1)
            document.querySelector('.ptitle').textContent = titles[i]
            gsap.fromTo('.count, .ptitle', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 })
          }
        })

      // 5. contact section: heading, 3 columns and button slide up when we reach it
      gsap.timeline({ scrollTrigger: { trigger: '.contact', start: 'top 60%' } })
        .from('.contact .ln', { yPercent: 110, duration: 0.9, ease: 'power3.out' })
        .from('.col', { y: 60, opacity: 0, stagger: 0.15, duration: 0.8 }, '-=0.4')
        .from('.cta', { scale: 0.8, opacity: 0, duration: 0.6 }, '-=0.2')

      // menu: opens from the top, then the links slide up. starts paused until the button is clicked
      menuTl.current = gsap.timeline({ paused: true, reversed: true })
        .to('.menu', { clipPath: 'inset(0 0 0% 0)', duration: 0.8, ease: 'power4.inOut' })
        .from('.menu li span', { yPercent: 110, duration: 0.6, stagger: 0.08, ease: 'power3.out' }, '-=0.3')
    }, root)
    return () => ctx.revert()
  }, [])

  // open the menu if it is closed, close it if it is open
  const toggleMenu = () => {
    const tl = menuTl.current
    tl.reversed() ? tl.play() : tl.reverse()
    setOpen(!tl.reversed())
  }
  // menu link click: close the menu and scroll to that section
  const goTo = (e, name) => {
    e.preventDefault()
    toggleMenu()
    const t = { Home: '.hero', About: '.intro', Services: '.features', Projects: '.projects', Contact: '.contact' }[name]
    setTimeout(() => document.querySelector(t)?.scrollIntoView({ behavior: 'smooth' }), 600)
  }

  return (
    <div ref={root}>
      <header className="nav">
        <span className="logo">Skyline</span>
        <button className="menu-btn" onClick={toggleMenu} aria-expanded={open}>{open ? 'Close' : 'Menu'}</button>
      </header>

      <nav className="menu" aria-label="Main">
        <ul>
          {LINKS.map((l, i) => (
            <li key={l} onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)}>
              <a href="#" onClick={(e) => goTo(e, l)}><span>{l}</span></a>
            </li>
          ))}
        </ul>
        <div className="menu-img">
          {P.menu.map((s, i) => <img key={i} src={s} alt="" loading="lazy" decoding="async" className={i === hover ? 'on' : ''} />)}
        </div>
      </nav>

      <section className="hero">
        <div className="hero-img" style={{ backgroundImage: `url(${P.hero})` }} />
        <h1>
          {['Ultimate', 'Smart', 'Living'].map((w) => (
            <span className="mask" key={w}><span className="w">{w}</span></span>
          ))}
        </h1>
        <p className="hero-sub">Homes designed around the way you live, from the ground up.</p>
        <div className="ring">↓</div>
      </section>

      <section className="intro">
        <div className="intro-text">
          <p className="small"><L>Skyline Developments</L></p>
          <h2><L>Providing unique</L><L>and priceless</L><L>experience</L></h2>
          <p className="body"><L>We plan, build and manage residences that</L><L>feel considered in every detail, from the</L><L>first sketch to the last handle.</L></p>
        </div>
        <div className="card">
          <img className="img-b" src={P.city} alt="City lights" />
          <img className="img-a" src={P.tower} alt="Tower at dusk" />
        </div>
      </section>

      <section className="features">
        <h2><L>Providing excellence</L></h2>
        <div className="grid">
          {FEATURES.map(([t, d]) => (
            <div className="feature" key={t}><h3>{t}</h3><p>{d}</p></div>
          ))}
        </div>
      </section>

      <section className="projects">
        <div className="frame">
          {P.projects.map((s, i) => <img key={i} className={'s' + (i + 1)} src={s} alt={'Project ' + (i + 1)} loading="lazy" decoding="async" />)}
        </div>
        <div className="project-info">
          <span className="count">01</span>
          <h2><L>Our projects</L></h2>
          <h3 className="ptitle">Marina Heights</h3>
          <p>Browse the residences we have delivered and the ones now under construction.</p>
        </div>
      </section>

      <section className="contact">
        <h2><L>Have a project in mind?</L></h2>
        <div className="cols">
          <div className="col"><h3>Talk</h3><p>+91 9500741762</p></div>
          <div className="col"><h3>Meet</h3><p>Pallikaranai, Chennai</p></div>
          <div className="col"><h3>Write</h3><p>megalamasanam@gmail.com</p></div>
        </div>
        <a
          className="cta"
          href="https://mail.google.com/mail/?view=cm&to=megalamasanam@gmail.com&su=Site%20visit%20enquiry"
          target="_blank"
          rel="noreferrer"
        >
          Book a visit
        </a>
      </section>
    </div>
  )
}
