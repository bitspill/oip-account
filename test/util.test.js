import { isValidEmail, isValidIdentifier } from '../src/util'

test('isValidEmail', () => {
    let username = "jesus@gmail.com"
    expect(isValidEmail(username)).toBe(true)
})

test('isNOTValidEmail', () => {
    let username = "046132a-dddc1051-cb7ec34-5692930"
    expect(isValidEmail(username)).toBe(false)
})

test('isValidIdentifier', () => {
    let identifier = "046132a-dddc1051-cb7ec34-5692930"
    expect(isValidIdentifier(identifier)).toBe(true)
})

test('isNOTValidIdentifier', () => {
    let username = "jesus@gmail.com"
    expect(isValidIdentifier(username)).toBe(false)
})