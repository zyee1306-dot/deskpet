import PetCanvas from '../components/PetCanvas'

/**
 * 应用根组件
 */
function App(): JSX.Element {
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', background: 'transparent' }}>
      <PetCanvas />
    </div>
  )
}

export default App