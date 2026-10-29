import { describe, expect, it } from 'vitest'
import { formatNpr } from './currency'

describe('formatNpr', () => {
  it('formats amounts with the Nepali rupee symbol and Indian-style digit grouping', () => {
    expect(formatNpr(123456.7)).toBe('रु 1,23,456.70')
  })
})
