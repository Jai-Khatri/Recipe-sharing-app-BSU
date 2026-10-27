import { useEffect,useState } from "react"
import "./App.css"

function App() {
  const [recipes,setRecipes] = useState([])

  const [signupUsername,setSignupUsername] = useState("")
  const [signupEmail,setSignupEmail] = useState("")
  const [signupPassword,setSignupPassword] = useState("")

  const [loginEmail,setLoginEmail] = useState("")
  const [loginPassword,setLoginPassword] = useState("")

  const [title,setTitle] = useState("")
  const [ingredients,setIngredients] = useState("")
  const [imageUrl,setImageUrl] = useState("")

  const [editingId,setEditingId] = useState(null)
  const [message,setMessage] = useState("")

  const [token,setToken] = useState(
    localStorage.getItem("token") || ""
  )

  const [user,setUser] = useState(() => {
    const saved = localStorage.getItem("user")

    return saved ? JSON.parse(saved) : null
  })

  useEffect(() => {
    loadRecipes()
  },[])

  async function loadRecipes() {
    const response = await fetch("/api/recipes")
    const data = await response.json()

    setRecipes(data)
  }

  async function signup(e) {
    e.preventDefault()
    setMessage("")

    const response = await fetch("/api/auth/signup",{
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: signupUsername,
        email: signupEmail,
        password: signupPassword
      })
    })

    const data = await response.json()

    if (!response.ok) {
      setMessage(data.message)
      return
    }

    setSignupUsername("")
    setSignupEmail("")
    setSignupPassword("")
    setLoginEmail(data.email)

    setMessage("Account created. You can log in now.")
  }

  async function login(e) {
    e.preventDefault()
    setMessage("")

    const response = await fetch("/api/auth/login",{
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: loginEmail,
        password: loginPassword
      })
    })

    const data = await response.json()

    if (!response.ok) {
      setMessage(data.message)
      return
    }

    localStorage.setItem("token",data.token)
    localStorage.setItem("user",JSON.stringify(data.user))

    setToken(data.token)
    setUser(data.user)

    setLoginEmail("")
    setLoginPassword("")

    setMessage(`Logged in as ${data.user.username}`)
  }

  function logout() {
    localStorage.removeItem("token")
    localStorage.removeItem("user")

    setToken("")
    setUser(null)
    cancelEdit()
    setMessage("Logged out")
  }

  function ingredientArray() {
    return ingredients
      .split("\n")
      .map(item => item.trim())
      .filter(Boolean)
  }

  async function submitRecipe(e) {
    e.preventDefault()
    setMessage("")

    const url = editingId
      ? `/api/recipes/${editingId}`
      : "/api/recipes"

    const method = editingId ? "PUT" : "POST"

    const response = await fetch(url,{
      method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        title,
        ingredients: ingredientArray(),
        imageUrl
      })
    })

    const data = await response.json()

    if (!response.ok) {
      setMessage(data.message)
      return
    }

    if (editingId) {
      setRecipes(current =>
        current.map(recipe =>
          recipe._id === editingId ? data : recipe
        )
      )

      setMessage("Recipe updated")
    }
    else {
      setRecipes(current => [data,...current])
      setMessage("Recipe created")
    }

    clearRecipeForm()
  }

  async function removeRecipe(id) {
    const response = await fetch(`/api/recipes/${id}`,{
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })

    const data = await response.json()

    if (!response.ok) {
      setMessage(data.message)
      return
    }

    setRecipes(current =>
      current.filter(recipe => recipe._id !== id)
    )

    if (editingId === id) {
      clearRecipeForm()
    }

    setMessage("Recipe deleted")
  }

  function editRecipe(recipe) {
    setEditingId(recipe._id)
    setTitle(recipe.title)
    setIngredients(recipe.ingredients.join("\n"))
    setImageUrl(recipe.imageUrl)

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    })
  }

  function clearRecipeForm() {
    setEditingId(null)
    setTitle("")
    setIngredients("")
    setImageUrl("")
  }

  function cancelEdit() {
    clearRecipeForm()
  }

  function ownsRecipe(recipe) {
    return user && recipe.owner?._id === user.id
  }

  return (
    <main>
      <header>
        <div>
          <h1>Recipe Share</h1>
          <p>Save and share your favorite recipes.</p>
        </div>

        {user && (
          <div className="userBar">
            <span>{user.username}</span>
            <button className="secondary" onClick={logout}>
              Logout
            </button>
          </div>
        )}
      </header>

      {message && (
        <p className="message">{message}</p>
      )}

      {!user && (
        <section className="auth">
          <form onSubmit={signup}>
            <h2>Sign up</h2>

            <input
              value={signupUsername}
              onChange={e => setSignupUsername(e.target.value)}
              placeholder="Username"
              required
            />

            <input
              type="email"
              value={signupEmail}
              onChange={e => setSignupEmail(e.target.value)}
              placeholder="Email"
              required
            />

            <input
              type="password"
              value={signupPassword}
              onChange={e => setSignupPassword(e.target.value)}
              placeholder="Password"
              minLength="6"
              required
            />

            <button>Sign up</button>
          </form>

          <form onSubmit={login}>
            <h2>Login</h2>

            <input
              type="email"
              value={loginEmail}
              onChange={e => setLoginEmail(e.target.value)}
              placeholder="Email"
              required
            />

            <input
              type="password"
              value={loginPassword}
              onChange={e => setLoginPassword(e.target.value)}
              placeholder="Password"
              required
            />

            <button>Login</button>
          </form>
        </section>
      )}

      {user && (
        <section className="recipeForm">
          <h2>
            {editingId ? "Edit recipe" : "Add a recipe"}
          </h2>

          <form onSubmit={submitRecipe}>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Recipe title"
              required
            />

            <textarea
              value={ingredients}
              onChange={e => setIngredients(e.target.value)}
              placeholder={"Ingredients, one per line\n2 eggs\n1 cup flour\n1 cup milk"}
              required
            />

            <input
              type="url"
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
              placeholder="Image URL"
              required
            />

            <div className="formButtons">
              <button>
                {editingId ? "Save changes" : "Create recipe"}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="secondary"
                  onClick={cancelEdit}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>
      )}

      <section>
        <h2>Recipes</h2>

        {recipes.length === 0 && (
          <p>No recipes yet.</p>
        )}

        <div className="recipes">
          {recipes.map(recipe => (
            <article key={recipe._id}>
              <img
                src={recipe.imageUrl}
                alt={recipe.title}
              />

              <div className="recipeBody">
                <h3>{recipe.title}</h3>

                <p className="author">
                  by {recipe.owner?.username || "Unknown"}
                </p>

                <h4>Ingredients</h4>

                <ul>
                  {recipe.ingredients.map((ingredient,index) => (
                    <li key={index}>
                      {ingredient}
                    </li>
                  ))}
                </ul>

                {ownsRecipe(recipe) && (
                  <div className="recipeButtons">
                    <button
                      className="secondary"
                      onClick={() => editRecipe(recipe)}
                    >
                      Edit
                    </button>

                    <button
                      className="danger"
                      onClick={() => removeRecipe(recipe._id)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

export default App