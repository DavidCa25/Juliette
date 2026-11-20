import { isotipoPaths } from './Isotipo'

/** Las cerezas del isotipo (con sus tallos), recortadas del vector oficial de la marca. */
export function Cerezas({ color = '#82001a', className = '' }: { color?: string; className?: string }) {
  return (
    <svg viewBox="392 652 494 566" className={className} aria-hidden="true" focusable="false">
      <g transform="matrix(1.1779609,0,0,1.1779609,386.134,517.32339)" fill={color}>
        {isotipoPaths.slice(6).map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
    </svg>
  )
}
