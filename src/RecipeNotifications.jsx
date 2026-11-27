function RecipeNotifications({notifications,onDismiss}) {
  return (
    <div className="notifications" aria-live="polite">
      {notifications.map(recipe => (
        <div className="notification" key={recipe.id}>
          <div className="notificationHeader">
            <strong>New Recipe!</strong>

            <button
              onClick={() => onDismiss(recipe.id)}
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </div>

          <p>{recipe.title}</p>

          <small>
            Shared by {recipe.username}
          </small>

          <a href={`/recipes/${recipe.id}`}>
            View recipe
          </a>
        </div>
      ))}
    </div>
  )
}

export default RecipeNotifications