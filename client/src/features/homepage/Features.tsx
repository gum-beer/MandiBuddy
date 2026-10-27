import { features } from './content.ts'

function Features() {
  return (
    <section className="section" id="features">
      <div className="shell">
        <h2 className="features__title">What it does</h2>

        {/* .map turns each data row into a card. `key` lets React tell the
            cards apart when the list changes. */}
        <ul className="features__grid">
          {features.map((feature) => (
            <li className="feature" key={feature.title}>
              <h3 className="feature__title">{feature.title}</h3>
              <p className="feature__body">{feature.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default Features
