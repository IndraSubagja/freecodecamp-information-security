class Player {
  constructor({x, y, score, id}) {
    this.x = x
    this.y = y
    this.score = score
    this.id = id
  }

  movePlayer(dir, speed) {
    switch(dir) {
      case 'up':
        this.y -= speed
        return { x: this.x, y: this.y }
      case 'down':
        this.y += speed
        return { x: this.x, y: this.y }
      case 'left':
        this.x -= speed
        return { x: this.x, y: this.y }
      case 'right':
        this.x += speed
        return { x: this.x, y: this.y }
      default:
        return { x: this.x, y: this.y }
    }
  }

  collision(item) {
    return this.x === item.x && this.y === item.y ? true : false
  }

  calculateRank(arr) {
    arr.sort((a, b) => b.score - a.score)
    const rank = arr.findIndex(player => player.score === this.score) + 1

    return `Rank: ${rank} / ${arr.length}`
  }
}

export default Player;
