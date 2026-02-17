const Tooltip = ({ text, children }: { text: string; children: React.ReactNode }) => {
  return (
    <div className='tooltip'>
      {children}

      <span className='tooltip-content'>{text}</span>
    </div>
  )
}

export default Tooltip
