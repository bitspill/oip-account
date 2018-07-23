import { isValidEmail, isValidIdentifier } from '../src/util'

test('isValidEmail', () => {
    let username = "jesus@gmail.com"
    console.log(isValidEmail(username))
    expect(isValidEmail(username)).toBeTruthy()
})

test('isNOTValidEmail', () => {
    let username = "046132a-dddc1051-cb7ec34-5692930"
    console.log(isValidEmail(username))
    expect(isValidEmail(username)).toBeFalsy()
})

test('isValidIdentifier', () => {
    let identifier = "046132a-dddc1051-cb7ec34-5692930"
    console.log(isValidIdentifier(identifier))
    expect(isValidIdentifier(identifier)).toBeTruthy()
})

test('isNOTValidIdentifier', () => {
    let username = "jesus@gmail.com"
    console.log(isValidIdentifier(username))
})