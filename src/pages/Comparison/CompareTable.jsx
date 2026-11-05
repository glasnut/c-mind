import { Link } from 'react-router-dom'
import Icon from '../../components/Icon/Icon.jsx'
import { SERIES_COLORS } from './colors.js'

// Таблица сравнения: столбец на каждый товар, победитель в строке выделен цветом и галочкой.
export default function CompareTable({ products, sections, onRemove }) {
  return (
    <div className="cmp__scroll">
      <table className="cmp__table">
        <thead>
          <tr>
            <th scope="col" className="cmp__corner">
              <span className="visually-hidden">Параметр</span>
            </th>
            {products.map((p, i) => (
              <th key={p.id} scope="col" className="cmp__product">
                <span className="cmp__dot" style={{ background: SERIES_COLORS[i] }} aria-hidden="true" />
                <Link to={`/product/${p.id}`} className="cmp__name">
                  {p.name}
                </Link>
                <button type="button" className="cmp__remove" onClick={() => onRemove(p.id)} aria-label={`Убрать ${p.name}`}>
                  <Icon name="close" size={14} />
                </button>
              </th>
            ))}
          </tr>
        </thead>

        {sections.map((section) => (
          <tbody key={section.title}>
            <tr className="cmp__section">
              <th colSpan={products.length + 1} scope="colgroup">
                {section.title}
              </th>
            </tr>
            {section.rows.map((row) => (
              <tr key={row.id}>
                <th scope="row" className="cmp__label">
                  {row.label}
                  {row.hint && (
                    <span className="cmp__hint" title={row.hint} aria-label={row.hint} tabIndex={0}>
                      i
                    </span>
                  )}
                </th>
                {row.cells.map((cell, i) => (
                  <td key={products[i].id} className={cell.best ? 'is-best' : undefined}>
                    {cell.best && <Icon name="check" size={15} />}
                    <span>{cell.text}</span>
                    {cell.best && <span className="visually-hidden"> — лучшее значение</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        ))}
      </table>
    </div>
  )
}
