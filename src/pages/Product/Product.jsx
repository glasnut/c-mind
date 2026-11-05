import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import Button from '../../components/Buttons/Button.jsx'
import Icon from '../../components/Icon/Icon.jsx'
import ListCard from '../../components/ListCard/ListCard.jsx'
import ProductCard from '../../components/ProductCard/ProductCard.jsx'
import ScoreBreakdown from '../../components/ScoreBreakdown/ScoreBreakdown.jsx'
import { CATEGORIES } from '../../data/categories.js'
import { SPEC_DEFS, formatSpec } from '../../data/specs.js'
import { useLists } from '../../context/ListsContext.jsx'
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js'
import { analyzeProduct, describeProduct } from '../../services/analysis/index.js'
import { productsService } from '../../services/products/index.js'
import { formatPrice } from '../../utils/format.js'
import './Product.css'

export default function Product() {
  const { id } = useParams()
  const product = productsService.getById(id)
  useDocumentTitle(product?.name)

  if (!product) return <NotFound />
  return <ProductView key={product.id} product={product} />
}

function NotFound() {
  return (
    <main className="container product product--empty">
      <h1>Товар не найден</h1>
      <p>Возможно, ссылка устарела или товар убрали из демо-базы.</p>
      <Button to="/catalog">Перейти в каталог</Button>
    </main>
  )
}

function ProductView({ product }) {
  const category = CATEGORIES[product.category]
  const { isFavorite, inCompare, toggleFavorite, toggleCompare, notice } = useLists()
  const favorite = isFavorite(product.id)
  const compared = inCompare(product.id)

  const analysis = useMemo(() => analyzeProduct(product, product.score), [product])
  const specs = SPEC_DEFS[product.category]

  // Похожие: та же категория, ближайшие по производительности
  const similar = useMemo(
    () =>
      productsService
        .getAll()
        .filter((p) => p.category === product.category && p.id !== product.id)
        .sort((a, b) => Math.abs(a.perfIndex - product.perfIndex) - Math.abs(b.perfIndex - product.perfIndex))
        .slice(0, 4),
    [product],
  )

  return (
    <main className="container product">
      <nav className="product__crumbs" aria-label="Навигация по разделам">
        <Link to="/">Главная</Link>
        <span>/</span>
        <Link to="/catalog">Каталог</Link>
        <span>/</span>
        <Link to={`/catalog?category=${category.id}`}>{category.name}</Link>
      </nav>

      <section className="product__top">
        <div className="product__visual">
          <Icon name={category.icon} size={140} strokeWidth={1} className="product__icon" />
          <span className="product__category">{category.name}</span>
        </div>

        <div className="product__info">
          <p className="product__brand">{product.brand}</p>
          <h1 className="product__name">{product.name}</h1>
          <p className="product__desc">{describeProduct(product)}</p>

          <div className="product__buy">
            <div>
              <div className="product__price">{formatPrice(product.price)}</div>
              <div className="product__note">условная цена, не актуальное предложение</div>
            </div>
            <div className="product__mini-score" title="Автоматическая оценка C-Mind (из 10)">
              <strong>{product.score.total.toFixed(1).replace('.', ',')}</strong>
              <span>/10</span>
            </div>
          </div>

          <div className="product__actions">
            <Button
              variant={compared ? 'outline' : 'primary'}
              icon={compared ? 'check' : 'scale'}
              onClick={() => toggleCompare(product.id)}
              aria-pressed={compared}
            >
              {compared ? 'В сравнении' : 'Добавить в сравнение'}
            </Button>
            <Button to={`/analyzer?product=${product.id}`} variant="outline" icon="chart">
              Проанализировать
            </Button>
            <Button
              variant="outline"
              icon="heart"
              onClick={() => toggleFavorite(product.id)}
              aria-pressed={favorite}
            >
              {favorite ? 'В избранном' : 'В избранное'}
            </Button>
          </div>

          {compared && (
            <p className="product__compare-link">
              <Link to="/comparison">Открыть сравнение</Link>
            </p>
          )}
          {notice && (
            <p className="product__notice" role="status">
              {notice}
            </p>
          )}
        </div>
      </section>

      <div className="product__columns">
        <section className="product__specs" aria-labelledby="specs-title">
          <h2 id="specs-title">Характеристики</h2>
          <dl>
            {specs.map((def) => (
              <div key={def.id} className="product__spec">
                <dt>{def.label}</dt>
                <dd>{formatSpec(def, product)}</dd>
              </div>
            ))}
            <div className="product__spec">
              <dt>Год выхода</dt>
              <dd>{product.releaseYear}</dd>
            </div>
          </dl>
        </section>

        <ScoreBreakdown product={product} analysis={analysis} />
      </div>

      <section className="product__lists" aria-label="Выводы анализа">
        <ListCard title="Преимущества" tone="pro" items={analysis.pros} empty="Явных преимуществ по расчётам не выявлено." />
        <ListCard title="Недостатки" tone="con" items={analysis.cons} empty="Заметных недостатков по расчётам не выявлено." />
        <ListCard
          title="Подходящие сценарии"
          tone="use"
          items={analysis.scenarios}
          empty="Универсальный вариант без выраженной специализации."
        />
      </section>

      {similar.length > 0 && (
        <section className="product__similar">
          <h2>Похожие товары</h2>
          <div className="product__similar-grid">
            {similar.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
