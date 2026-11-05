import { useEffect,useRef,useState } from "react"
import { VictoryChart,VictoryAxis,VictoryBar } from "victory"

function RecipePage({recipeId}) {
  const [recipe,setRecipe] = useState(null)
  const [stats,setStats] = useState(null)
  const [loading,setLoading] = useState(true)
  const [error,setError] = useState("")

  const hasLoaded = useRef(false)

  useEffect(() => {
    if (hasLoaded.current) return

    hasLoaded.current = true

    async function loadRecipe() {
      try {
        const response = await fetch(`/api/recipes/${recipeId}`)

        if (!response.ok) {
          throw new Error("Recipe not found")
        }

        const data = await response.json()
        setRecipe(data)

        const viewResponse = await fetch(`/api/recipes/${recipeId}/views`,{
          method: "POST"
        })

        if (!viewResponse.ok) {
          throw new Error("Could not load view statistics")
        }

        const viewData = await viewResponse.json()
        setStats(viewData)
      }
      catch (err) {
        setError(err.message)
      }
      finally {
        setLoading(false)
      }
    }

    loadRecipe()
  },[recipeId])

  if (loading) {
    return (
      <main>
        <p>Loading recipe...</p>
      </main>
    )
  }

  if (!recipe) {
    return (
      <main>
        <a href="/">← Back to recipes</a>
        <p>{error || "Recipe not found"}</p>
      </main>
    )
  }

  return (
    <main className="detailPage">
      <a href="/" className="backLink">
        ← Back to recipes
      </a>

      <h1>{recipe.title}</h1>

      <p className="author">
        by {recipe.owner?.username || "Unknown"}
      </p>

      <img
        className="detailImage"
        src={recipe.imageUrl}
        alt={recipe.title}
      />

      <div className="detailsCard">
        <h2>Ingredients</h2>

        <ul>
          {recipe.ingredients.map((ingredient,index) => (
            <li key={index}>{ingredient}</li>
          ))}
        </ul>
      </div>

      <section className="statsSection">
        <h2>Recipe Statistics</h2>

        {stats ? (
          <>
            <div className="viewCount">
              <h3>Total Views</h3>
              <p>{stats.totalViews}</p>
            </div>

            <h3>Daily Views</h3>

            <div className="chart">
              <VictoryChart
                height={300}
                domainPadding={25}
                padding={{
                  top: 30,
                  bottom: 55,
                  left: 50,
                  right: 20
                }}
              >
                <VictoryAxis
                  tickFormat={date => date.slice(5)}
                />

                <VictoryAxis
                  dependentAxis
                  tickFormat={value =>
                    Number.isInteger(value) ? value : ""
                  }
                />

                <VictoryBar
                  data={stats.dailyViews}
                  x="date"
                  y="views"
                  labels={({datum}) => datum.views}
                />
              </VictoryChart>
            </div>
          </>
        ) : (
          <p>{error || "Statistics unavailable"}</p>
        )}
      </section>
    </main>
  )
}

export default RecipePage