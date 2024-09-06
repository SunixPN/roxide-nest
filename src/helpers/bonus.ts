export const bonusSwitch = (day: number) => {
    switch (day) {
        case 1: return 10
        case 2: return 20
        case 3: return 30
        case 4: return 40
        case 5: return 60
        case 6: return 80
        case 7: return 100
        default: return 0
    }
}