import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

function add(name: string) {
  const input = screen.getByRole('textbox', { name: '음식 이름' })
  fireEvent.change(input, { target: { value: name } })
  fireEvent.submit(input.closest('form')!)
}

describe('menu picker', () => {
  beforeEach(() => vi.useFakeTimers())

  it('adds with Enter, trims names, blocks duplicates and deletes candidates', () => {
    render(<App />)
    const input = screen.getByRole('textbox', { name: '음식 이름' })
    fireEvent.change(input, { target: { value: '  Pasta  ' } })
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', charCode: 13 })
    fireEvent.submit(input.closest('form')!)
    expect(screen.getByText('Pasta')).toBeInTheDocument()
    expect(input).toHaveValue('')
    expect(input).toHaveFocus()
    add('pasta')
    expect(screen.getByText('이미 추가한 메뉴예요.')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /오늘의 후보 1/ })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Pasta 삭제' }))
    expect(screen.getByText('아직 등록된 메뉴가 없어요')).toBeInTheDocument()
  })

  it('disables drawing until candidates exist, locks editing while drawing, and allows a redraw', () => {
    render(<App />)
    const draw = screen.getByRole('button', { name: /오늘 뭐 먹지/ })
    expect(draw).toBeDisabled()
    add('김치찌개')
    fireEvent.click(draw)
    expect(screen.getByRole('button', { name: /뽑는 중/ })).toBeDisabled()
    expect(screen.getByRole('textbox', { name: '음식 이름' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '김치찌개 삭제' })).toBeDisabled()
    act(() => vi.advanceTimersByTime(1800))
    expect(screen.getByRole('status')).toHaveTextContent('오늘의 메뉴는 김치찌개입니다.')
    fireEvent.click(screen.getByRole('button', { name: '다시 뽑기' }))
    act(() => vi.advanceTimersByTime(1800))
    expect(screen.getByRole('status')).toHaveTextContent('김치찌개')
    fireEvent.click(screen.getByRole('button', { name: '김치찌개 삭제' }))
    expect(screen.getByRole('status')).toBeEmptyDOMElement()
  })

  it('shows a result immediately when reduced motion is requested', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }))
    render(<App />)
    add('비빔밥')
    fireEvent.click(screen.getByRole('button', { name: /오늘 뭐 먹지/ }))
    expect(screen.getByRole('status')).toHaveTextContent('비빔밥')
    expect(screen.queryByText('두근두근, 고르는 중...')).not.toBeInTheDocument()
  })

  it('starts with empty memory state on a fresh mount', () => {
    const { unmount } = render(<App />)
    add('라면')
    unmount()
    render(<App />)
    expect(screen.getByText('아직 등록된 메뉴가 없어요')).toBeInTheDocument()
  })
})
