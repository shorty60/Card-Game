//定義遊戲狀態
const GAME_STATE = {
  FirstCardAwaits: "FirstCardAwaits",
  SecondCardAwaits: "SecondCardAwaits",
  CardsMatchFailed: "CardsMatchFailed",
  CardsMatched: "CardsMatched",
  GameFinished: "GameFinished",
}

const Symbols = [
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png",
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png",
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png",
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png",
]
const view = {
  getCardContent(index) {
    const number = this.transformNumber((index % 13) + 1)
    const symbol = Symbols[Math.floor(index / 13)]
    return ` 
        <p>${number}</p>
        <img
          src="${symbol}"
          alt=""
        />
        <p>${number}</p>
      `
  },
  getCardElement(index) {
    return `<div class="card back" data-index="${index}"></div>`
  },
  transformNumber(number) {
    switch (number) {
      case 1:
        return "A"
      case 11:
        return "J"
      case 12:
        return "Q"
      case 13:
        return "K"
      default:
        return number
    }
  },
  displayCards(indexes) {
    const rootElement = document.querySelector("#cards")

    rootElement.innerHTML = indexes
      .map((index) => this.getCardElement(index))
      .join("")
  },
  //flipCards(1, 2, 3, 4)
  //cards = [1, 2, 3, 4]
  flipCards(...cards) {
    cards.map((card) => {
      //如果是背面
      if (card.classList.contains("back")) {
        card.classList.remove("back")
        card.innerHTML = this.getCardContent(Number(card.dataset.index))
        //回傳正面
        return
      }

      card.classList.add("back")
      card.innerHTML = null
    })
  },
  pairCards(...cards) {
    //配對成功的樣式變化
    cards.map((card) => card.classList.add("paired"))
  },

  renderScores(score) {
    document.querySelector(".score").textContent = `Score: ${score}`
  },

  renderTriedTimes(times) {
    document.querySelector(
      ".tried"
    ).textContent = `You've tried: ${times} times`
  },

  appendWrongAnimation(...cards) {
    cards.map((card) => {
      card.classList.add("wrong")
      card.addEventListener(
        "animationend",
        (event) => {
          card.classList.remove("wrong")
        },
        { once: true }
      )
    })
  },

  showGameFinished() {
    const div = document.createElement("div")
    div.classList.add("completed") //加入樣式
    div.innerHTML = `
      <p>Mission Complete!</p>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.triedTimes} times.</p>
    `
    const header = document.querySelector("#header")
    header.before(div)
  },
}

const model = {
  revealCards: [],
  isRevealedCardsMatched() {
    return (
      Number(this.revealCards[0].dataset.index) % 13 ===
      Number(this.revealCards[1].dataset.index) % 13
    )
  },
  score: 0,
  triedTimes: 0,
}
const utility = {
  getRandomNumberArray(count) {
    const number = Array.from(Array(count).keys())
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1))
      ;[number[index], number[randomIndex]] = [
        number[randomIndex],
        number[index],
      ]
    }
    return number
  },
}

const controller = {
  currentState: GAME_STATE.FirstCardAwaits,
  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52))
  },
  //依照不同遊戲狀態，做不同行為
  dispatchCardAction(card) {
    if (!card.classList.contains("back")) {
      return
    }

    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits: //如果翻開的是第一張卡，則執行
        view.flipCards(card) //翻牌
        model.revealCards.push(card) //把這張卡片push進去array
        this.currentState = GAME_STATE.SecondCardAwaits //改變狀態
        break
      case GAME_STATE.SecondCardAwaits:
        view.renderTriedTimes(++model.triedTimes)
        view.flipCards(card) //翻牌
        model.revealCards.push(card) //把這張卡片push進去array
        if (model.isRevealedCardsMatched()) {
          //配對正確
          this.currentState = GAME_STATE.CardsMatched
          view.renderScores((model.score += 10))
          //配對成功就不再翻回來
          view.pairCards(...model.revealCards)
          model.revealCards = []
          if (model.score === 260) {
            console.log('showGameFinished')
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished()
            return
          }
          this.currentState = GAME_STATE.FirstCardAwaits
        } else {
          //配對失敗
          this.currentState = GAME_STATE.CardsMatchFailed
          view.appendWrongAnimation(...model.revealCards)
          setTimeout(this.resetCards, 1000) //蓋回去之前要停一下，不然玩家沒時間記憶
        }
        break
    }
    console.log("Current State", this.currentState)
    console.log(
      "Reaveal Cards",
      model.revealCards.map((card) => card.dataset.index)
    )
  },

  resetCards() {
    view.flipCards(...model.revealCards)
    model.revealCards = []
    controller.currentState = GAME_STATE.FirstCardAwaits
  },
}
controller.generateCards()
//Node List(array-like)
document.querySelectorAll(".card").forEach((card) => {
  card.addEventListener("click", (event) => {
    controller.dispatchCardAction(card)
  })
})
