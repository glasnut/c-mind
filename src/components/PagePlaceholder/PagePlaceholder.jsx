import Button from '../Buttons/Button.jsx'
import './PagePlaceholder.css'

// Временная страница для разделов, которые будут сделаны на следующих этапах.
export default function PagePlaceholder({ title, stage }) {
  return (
    <main className="container placeholder">
      <h1 className="placeholder__title">{title}</h1>
      <p className="placeholder__text">
        Этот раздел ещё в разработке — он появится на этапе {stage}.
      </p>
      <Button to="/" variant="outline">
        На главную
      </Button>
    </main>
  )
}
