import { GithubUser } from "./GithubUser.js"

export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root)
    this.load()
  }

  load() {
    this.entries = JSON.parse(localStorage.getItem("@github-favorites:")) || []
  }

  save() {
    localStorage.setItem("@github-favorites:", JSON.stringify(this.entries))
  }

  async add(username) {
    try {
      const userExists = this.entries.find((entry) => entry.login === username)

      if (userExists) {
        throw new Error("User already exist!")
      }

      const user = await GithubUser.search(username)

      if (user.login === undefined) {
        throw new Error("User not found!")
      }

      this.entries = [user, ...this.entries]
      this.update()
      this.save()
    } catch (error) {
      alert(error.message)
    }
  }

  delete(user) {
    const filteredEntries = this.entries.filter((entry) => entry.login !== user.login)

    this.entries = filteredEntries
    this.update()
    this.save()
  }
}

export class FavoritesView extends Favorites {
  constructor(root) {
    super(root)

    this.tbody = this.root.querySelector("table tbody")

    this.update()
    this.onadd()
  }

  onadd() {
    const addButton = this.root.querySelector(".search button")
    const searchInput = this.root.querySelector(".search input")
    addButton.onclick = () => {
      const { value } = searchInput

      this.add(value)
    }

    searchInput.addEventListener("keyup", ({ key }) => {
      if (key === "Enter") {
        const { value } = searchInput

        this.add(value)
      }
    })
  }

  update() {
    this.removelAllTr()

    this.entries.forEach((user) => {
      const row = this.createRow()

      row.querySelector(".user img").src = `https://github.com/${user.login}.png`
      row.querySelector(".user a").href = `https://github.com/${user.login}`
      row.querySelector(".user p").textContent = user.name
      row.querySelector(".user span").textContent = user.login
      row.querySelector(".repositories").textContent = user.public_repos
      row.querySelector(".followers").textContent = user.followers

      row.querySelector(".remove").onclick = () => {
        const isOk = confirm("Tem certeza que deseja deletar essa linha?")

        if (isOk) {
          this.delete(user)
        }
      }

      this.tbody.append(row)
    })
  }

  createRow() {
    const tr = document.createElement("tr")

    tr.innerHTML = `
      <td class="user">
        <img src="https://github.com/adrielqueiroz2006.png" alt="" />
        <a href="">
          <p>Adriel Queiroz</p>
          <span>adrielqueiroz2006</span>
        </a>
      </td>
      <td class="repositories">76</td>
      <td class="followers">120000</td>
      <td>
        <button class="remove">&times;</button>
      </td>
    `
    return tr
  }

  removelAllTr() {
    this.tbody.querySelectorAll("tr").forEach((tr) => {
      tr.remove()
    })
  }
}
