import { useNavigate } from "@solidjs/router"
import "./HeaderTitleVisuals.css"
import { Typography, useTheme } from "@suid/material"
import { Component } from "solid-js"

export const HeaderTitle: Component<{
  title: string
  paragraph: string
  backButton?: boolean
}> = ({ title, paragraph, backButton }) => {
  const navigate = useNavigate()
  const handleKeyboardEvent = (event: KeyboardEvent) => {
    if (event && event.key === "Enter") {
      navigate(-1)
    }
  }

  return (
    <div class="HeaderTitle">
      {backButton && (
        <div tabIndex={0} role="button" onClick={() => navigate(-1)} onKeyDown={handleKeyboardEvent}>
          <img class="HeaderTitle__img" src="assets/arrow-left.svg" alt="button to go back page" />
        </div>
      )}
      <Typography class="HeaderTitle__title" variant="inherit">
        {title}
      </Typography>
      <Typography class="HeaderTitle__paragraph" variant="subtitle1" color={useTheme().palette.text.secondary}>
        {paragraph}
      </Typography>
    </div>
  )
}
