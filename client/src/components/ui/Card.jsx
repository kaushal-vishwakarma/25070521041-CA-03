// Dark rounded container. hover adds the lift + violet glow used on clickable cards.
export default function Card({ as: Tag = 'div', hover = false, className = '', children, ...props }) {
  return (
    <Tag className={['card', hover && 'card-hover', className].filter(Boolean).join(' ')} {...props}>
      {children}
    </Tag>
  );
}
