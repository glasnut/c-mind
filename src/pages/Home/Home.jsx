import { Link } from 'react-router-dom'
import Button from '../../components/Buttons/Button.jsx'
import Icon from '../../components/Icon/Icon.jsx'
import ProductCard from '../../components/ProductCard/ProductCard.jsx'
import HeroArt from './HeroArt.jsx'
import { CATEGORY_LIST } from '../../data/categories.js'
import { productsService } from '../../services/products/index.js'
import './Home.css'

const FEATURES = [
  { icon: 'chart', title: 'Умная оценка', text: 'и рекомендации', to: '/analyzer' },
  { icon: 'chip', title: 'Сравнение', text: 'по характеристикам', to: '/comparison' },
  { icon: 'bolt', title: 'Автоанализ', text: 'плюсы, минусы, советы', to: '/analyzer' },
  { icon: 'cube', title: 'Подбор сборки', text: 'под твои задачи', to: '/builder' },
]

export default function Home() {
  const featured = productsService.getFeatured()
  const bestScore = Math.max(...featured.map((p) => p.score.total))

  return (
    <main>
      <section className="hero">
        <div className="container hero__inner">
          <div className="hero__text">
            <h1 className="hero__title">
              Умный помощник по выбору <span className="hero__accent">комплектующих</span>
            </h1>
            <p className="hero__subtitle">Сравнивай. Анализируй. Выбирай лучшее.</p>
            <div className="hero__actions">
              <Button to="/builder" icon="search" arrow>
                Начать подбор
              </Button>
              <Button to="/comparison" variant="outline" icon="scale">
                Сравнить комплектующие
              </Button>
            </div>
          </div>

          <div className="hero__visual">
            <HeroArt />
            <div className="hero__stat">
              <Icon name="chart" size={30} />
              <div>
                <strong>{CATEGORY_LIST.length}</strong>
                <span>категорий комплектующих</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container features" aria-label="Возможности">
        {FEATURES.map((f) => (
          <Link key={f.title} to={f.to} className="feature">
            <span className="feature__icon">
              <Icon name={f.icon} size={30} />
            </span>
            <span>
              <span className="feature__title">{f.title}</span>
              <span className="feature__text">{f.text}</span>
            </span>
          </Link>
        ))}
      </section>

      <section className="container popular">
        <div className="popular__head">
          <h2 className="popular__title">
            <Icon name="flame" size={28} className="popular__flame" />
            Популярные комплектующие
          </h2>
          <Link to="/catalog" className="popular__all">
            Все товары <Icon name="arrow" size={18} />
          </Link>
        </div>

        <div className="popular__grid">
          {featured.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              badge={product.score.total === bestScore ? 'Лучшая оценка' : undefined}
            />
          ))}
        </div>
        <p className="popular__note">
          Цены условные (демо-данные), оценки рассчитаны автоматически по характеристикам.
        </p>
      </section>
    </main>
  )
}
