import { about } from './content.ts'

function About() {
  return (
    <section className="section" id="about">
      <div className="shell">
        <h2 className="about__title">About</h2>
        <div className="about__body">
          {about.map((paragraph) => (
            <p key={paragraph.slice(0, 24)}>{paragraph}</p>
          ))}
        </div>
      </div>
    </section>
  )
}

export default About
