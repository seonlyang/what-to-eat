import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Plus, RotateCcw, Sparkles, Trash2, UtensilsCrossed } from 'lucide-react'
import { MAX_FOOD_LENGTH, pickFood, validateFood, type FoodItem } from './food'

const DRAW_DURATION = 1800
const CYCLE_INTERVAL = 85

function App() {
  const [foods, setFoods] = useState<FoodItem[]>([])
  const [input, setInput] = useState('')
  const [message, setMessage] = useState('')
  const [isDrawing, setIsDrawing] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [result, setResult] = useState<FoodItem | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const drawingRef = useRef(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }, [])

  function addFood(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (drawingRef.current) return
    const error = validateFood(input, foods)
    if (error) {
      setMessage(error)
      inputRef.current?.focus()
      return
    }

    setFoods((current) => [...current, { id: crypto.randomUUID(), name: input.trim() }])
    setInput('')
    setMessage('')
    inputRef.current?.focus()
  }

  function removeFood(id: string) {
    if (drawingRef.current) return
    setFoods((current) => current.filter((food) => food.id !== id))
    if (result?.id === id) {
      setResult(null)
      setDisplayName('')
    }
  }

  function drawFood() {
    if (drawingRef.current || foods.length === 0) return
    drawingRef.current = true
    const selected = pickFood(foods)
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    setResult(null)
    setMessage('')

    if (reducedMotion) {
      setDisplayName(selected.name)
      setResult(selected)
      drawingRef.current = false
      return
    }

    setIsDrawing(true)
    setDisplayName(pickFood(foods).name)
    intervalRef.current = setInterval(() => {
      setDisplayName(pickFood(foods).name)
    }, CYCLE_INTERVAL)
    timeoutRef.current = setTimeout(() => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      intervalRef.current = null
      timeoutRef.current = null
      setDisplayName(selected.name)
      setResult(selected)
      setIsDrawing(false)
      drawingRef.current = false
    }, DRAW_DURATION)
  }

  return (
    <div className="app-shell">
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />
      <main className="page-wrap">
        <header className="site-header">
          <div className="brand-mark" aria-hidden="true"><UtensilsCrossed size={25} strokeWidth={2.6} /></div>
          <div className="brand-text">오늘 뭐 먹지<span>?</span></div>
          <div className="header-pill"><span className="pill-dot" /> 메뉴 고민은 이제 그만!</div>
        </header>

        <section className="hero" aria-labelledby="hero-title">
          <div className="eyebrow"><Sparkles size={15} fill="currentColor" /> 매일 하는 행복한 고민</div>
          <h1 id="hero-title">오늘은 <span>뭐 먹지?</span><br />고민될 땐, 뽑아보세요!</h1>
          <p>먹고 싶은 메뉴를 쏙쏙 담고, 버튼 하나로 오늘의 한 끼를 정해요.</p>
          <div className="hero-doodle hero-doodle-left" aria-hidden="true">✳</div>
          <div className="hero-doodle hero-doodle-right" aria-hidden="true">✺</div>
        </section>

        <div className="content-grid">
          <div className="left-column">
            <section className="panel input-panel" aria-labelledby="add-title">
              <div className="section-heading">
                <div className="section-icon orange-icon" aria-hidden="true"><Plus size={20} strokeWidth={2.8} /></div>
                <div>
                  <h2 id="add-title">먹고 싶은 메뉴</h2>
                  <p>떠오르는 음식을 적어주세요</p>
                </div>
              </div>
              <form onSubmit={addFood} className="add-form">
                <label className="sr-only" htmlFor="food-input">음식 이름</label>
                <input
                  id="food-input"
                  ref={inputRef}
                  type="text"
                  value={input}
                  maxLength={MAX_FOOD_LENGTH}
                  disabled={isDrawing}
                  onChange={(event) => { setInput(event.target.value); if (message) setMessage('') }}
                  placeholder="먹고 싶은 음식을 입력하세요"
                  aria-describedby={message ? 'input-message' : 'input-hint'}
                  aria-invalid={Boolean(message)}
                />
                <button className="add-button" type="submit" disabled={isDrawing} aria-label="음식 후보 추가">
                  <Plus size={19} strokeWidth={2.7} /><span>추가</span>
                </button>
              </form>
              <div className="form-footer">
                <span id={message ? 'input-message' : 'input-hint'} className={message ? 'input-error' : 'input-hint'} role={message ? 'alert' : undefined}>
                  {message || 'Enter 키를 눌러도 추가할 수 있어요'}
                </span>
                <span className="char-count">{input.length}/{MAX_FOOD_LENGTH}</span>
              </div>
            </section>

            <section className="panel list-panel" aria-labelledby="list-title">
              <div className="list-header">
                <div className="section-heading compact-heading">
                  <div className="section-icon yellow-icon" aria-hidden="true">📋</div>
                  <div>
                    <h2 id="list-title">오늘의 후보 <span className="count-badge">{foods.length}</span></h2>
                    <p>이 중에서 오늘의 메뉴를 골라요</p>
                  </div>
                </div>
              </div>
              {foods.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-illustration" aria-hidden="true"><span>🍽️</span></div>
                  <strong>아직 등록된 메뉴가 없어요</strong>
                  <p>먹고 싶은 음식을 추가해 보세요!</p>
                </div>
              ) : (
                <ul className="food-list">
                  {foods.map((food, index) => (
                    <li className="food-item" key={food.id}>
                      <span className="food-index">{String(index + 1).padStart(2, '0')}</span>
                      <span className="food-name">{food.name}</span>
                      <button type="button" className="remove-button" onClick={() => removeFood(food.id)} disabled={isDrawing} aria-label={`${food.name} 삭제`} title={`${food.name} 삭제`}>
                        <Trash2 size={17} strokeWidth={2} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <section className="draw-panel" aria-labelledby="draw-title">
            <div className="draw-decoration draw-decoration-one" aria-hidden="true">✦</div>
            <div className="draw-decoration draw-decoration-two" aria-hidden="true">✳</div>
            <div className="draw-decoration draw-decoration-three" aria-hidden="true">●</div>
            <div className="draw-topline"><span className="draw-sparkle">✳</span> 오늘의 메뉴 추첨</div>
            <h2 id="draw-title">뭘 먹을지<br />정해드릴게요!</h2>
            <div className={`result-stage ${result ? 'has-result' : ''} ${isDrawing ? 'is-drawing' : ''}`}>
              {isDrawing ? (
                <div className="result-content" aria-hidden="true">
                  <span className="result-kicker">두근두근, 고르는 중...</span>
                  <strong className="cycling-name">{displayName}</strong>
                  <span className="result-caption">잠시만 기다려 주세요!</span>
                </div>
              ) : result ? (
                <div className="result-content result-reveal" key={result.id}>
                  <span className="result-kicker">오늘의 메뉴는...</span>
                  <strong className="winning-name">{displayName}<span className="winning-bang">!</span></strong>
                  <span className="result-caption">맛있게 드세요 😋</span>
                </div>
              ) : (
                <div className="result-content placeholder-content">
                  <div className="plate-art" aria-hidden="true"><span>🍜</span></div>
                  <strong>오늘의 메뉴는 뭘까요?</strong>
                  <span>메뉴를 추가하고 뽑아보세요!</span>
                </div>
              )}
            </div>
            <div className="draw-actions">
              <button type="button" className="draw-button" onClick={drawFood} disabled={foods.length === 0 || isDrawing}>
                {isDrawing ? <><span className="button-spinner" aria-hidden="true" /> 뽑는 중...</> : <><span aria-hidden="true">🎲</span> 오늘 뭐 먹지? <ArrowRight size={19} strokeWidth={2.5} aria-hidden="true" /></>}
              </button>
              {result && !isDrawing && (
                <button type="button" className="retry-button" onClick={drawFood}><RotateCcw size={17} strokeWidth={2.4} /> 다시 뽑기</button>
              )}
            </div>
            <p className="draw-note">{foods.length === 0 ? '후보를 하나 이상 추가하면 시작할 수 있어요' : `${foods.length}개의 후보 중 하나를 뽑아요`}</p>
            <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">{result ? `오늘의 메뉴는 ${result.name}입니다.` : ''}</div>
          </section>
        </div>

        <footer className="site-footer"><span>🍽️</span> 메뉴 고민은 이제 그만! <span className="footer-divider">·</span> 오늘도 맛있는 하루 보내세요</footer>
      </main>
    </div>
  )
}

export default App
