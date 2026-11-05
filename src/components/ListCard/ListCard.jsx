import './ListCard.css'

// Карточка со списком выводов. tone: 'pro' (+), 'con' (−), 'warn' (!), 'use' (→).
export default function ListCard({ title, tone, items, empty }) {
  return (
    <article className={`listcard listcard--${tone}`}>
      <h2>{title}</h2>
      {items.length > 0 ? (
        <ul>
          {items.map((text) => (
            <li key={text}>{text}</li>
          ))}
        </ul>
      ) : (
        <p>{empty}</p>
      )}
    </article>
  )
}
