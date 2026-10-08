import { describe, expect, it } from 'vitest'
import { pickFood, validateFood } from './food'

describe('food validation', () => {
  const foods = [{ id: '1', name: 'Pasta' }]

  it('rejects blank, duplicate and overlong names', () => {
    expect(validateFood('   ', foods)).toMatch(/입력/)
    expect(validateFood(' pasta ', foods)).toMatch(/이미/)
    expect(validateFood('가'.repeat(31), foods)).toMatch(/30자/)
  })

  it('accepts a new name', () => {
    expect(validateFood(' 김치찌개 ', foods)).toBeNull()
  })
})

describe('random selection', () => {
  it('maps equal intervals to each candidate', () => {
    const items = ['a', 'b', 'c', 'd']
    expect([0, .249, .25, .499, .5, .749, .75, .999].map((n) => pickFood(items, () => n)))
      .toEqual(['a', 'a', 'b', 'b', 'c', 'c', 'd', 'd'])
  })

  it('returns the sole candidate and rejects an empty list', () => {
    expect(pickFood(['a'])).toBe('a')
    expect(() => pickFood([])).toThrow('후보가 없습니다.')
  })
})
