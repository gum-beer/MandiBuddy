import { comparison } from './content.ts'

function Comparison() {
  return (
    <section className="section comparison" id="why">
      <div className="shell">
        <h2 className="comparison__title">Why not generic billing software</h2>

        <div className="comparison__scroll">
          <table className="comparison__table">
            <thead>
              <tr>
                <th>Feature</th>
                <th>Generic billing software</th>
                <th>MandiBuddy</th>
              </tr>
            </thead>
            <tbody>
              {comparison.map((row) => (
                <tr key={row.feature}>
                  <th scope="row">{row.feature}</th>
                  <td>{row.generic}</td>
                  <td className="comparison__yes">{row.mandibuddy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

export default Comparison
