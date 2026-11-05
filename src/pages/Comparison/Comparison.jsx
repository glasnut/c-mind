import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import Button from '../../components/Buttons/Button.jsx'
import ComparePicker from './ComparePicker.jsx'
import CompareTable from './CompareTable.jsx'
import SaveComparison from './SaveComparison.jsx'
import ComparisonCharts from './ComparisonCharts.jsx'
import { useLists } from '../../context/ListsContext.jsx'
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js'
import { buildComparison } from '../../services/comparison/index.js'
import { productsService } from '../../services/products/index.js'
import './Comparison.css'

export default function Comparison() {
  useDocumentTitle('Сравнение комплектующих')
  const { compare, removeFromCompare, clearCompare } = useLists()

  const products = useMemo(() => compare.map((id) => productsService.getById(id)).filter(Boolean), [compare])
  const result = useMemo(() => (products.length >= 2 ? buildComparison(products) : null), [products])

  return (
    <main className="container cmp">
      <header className="cmp__head">
        <div>
          <h1>Сравнение комплектующих</h1>
          <p>Цены условные (демо-данные). Победитель в строке определяется по смыслу параметра, а не по размеру числа.</p>
        </div>
        {products.length > 0 && (
          <button type="button" className="cmp__clear" onClick={clearCompare}>
            Очистить список
          </button>
        )}
      </header>

      <ComparePicker products={products} />

      {products.length === 0 && (
        <div className="cmp__empty">
          <h2>Список сравнения пуст</h2>
          <p>Выберите товары выше или добавьте их из каталога кнопкой «Сравнить».</p>
          <Button to="/catalog" variant="outline">
            Перейти в каталог
          </Button>
        </div>
      )}

      {products.length === 1 && (
        <div className="cmp__empty">
          <h2>Добавьте ещё минимум один товар</h2>
          <p>
            Сейчас выбран <Link to={`/product/${products[0].id}`}>{products[0].name}</Link>. Для сравнения нужно два товара
            или больше.
          </p>
        </div>
      )}

      {result && (
        <>
          <CompareTable products={products} sections={result.sections} onRemove={removeFromCompare} />
          <SaveComparison products={products} />
          <ComparisonCharts products={products} criteria={result.criteria} />

          <section className="cmp__conclusion" aria-labelledby="conclusion-title">
            <h2 id="conclusion-title">Итоговое заключение</h2>
            {result.conclusion.map((text) => (
              <p key={text}>{text}</p>
            ))}
            <p className="cmp__auto">Заключение сформировано автоматически по характеристикам — это не нейросеть.</p>
          </section>
        </>
      )}
    </main>
  )
}
