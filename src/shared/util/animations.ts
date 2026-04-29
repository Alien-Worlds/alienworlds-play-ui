const pageTransition = {
  initial: { y: -100, opacity: 0.1, x: '0%' },
  animate: { y: 0, opacity: 1, x: '0%' },
  exit: { y: 0, x: '100%', opacity: 0, transition: { duration: 0.15 } },
  transition: { duration: 0.3 },
}

export { pageTransition }
