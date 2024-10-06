export const bonusSwitch = (day: number) => {
    switch (day) {
        case 1: return 20
        case 2: return 30
        case 3: return 40
        case 4: return 60
        case 5: return 80
        case 6: return 100
        case 7: return 150
        default: return 0
    }
}