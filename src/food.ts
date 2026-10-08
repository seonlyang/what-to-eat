export interface FoodItem {
  id: string
  name: string
}

export const MAX_FOOD_LENGTH = 30

export function validateFood(input: string, foods: FoodItem[]): string | null {
  const name = input.trim()
  if (!name) return '음식 이름을 입력해 주세요.'
  if (name.length > MAX_FOOD_LENGTH) return '음식 이름은 30자 이하로 입력해 주세요.'
  if (foods.some((food) => food.name.toLowerCase() === name.toLowerCase())) {
    return '이미 추가한 메뉴예요.'
  }
  return null
}

export function pickFood<T>(items: readonly T[], random = Math.random): T {
  if (items.length === 0) throw new Error('후보가 없습니다.')
  return items[Math.floor(random() * items.length)]
}
