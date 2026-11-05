import Button from '../../components/Buttons/Button.jsx'
import '../../components/PagePlaceholder/PagePlaceholder.css'

export default function NotFound() {
  return (
    <main className="container placeholder">
      <h1 className="placeholder__title">Страница не найдена</h1>
      <p className="placeholder__text">Такого адреса на сайте нет. Проверьте ссылку или вернитесь на главную.</p>
      <Button to="/">На главную</Button>
    </main>
  )
}
