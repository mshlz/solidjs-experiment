import { Component, ParentProps } from "solid-js"
import "./PublicVisuals.css"
import { Stack } from "@suid/material"
import { HeaderTitle } from "../../components/HeaderTitle/HeaderTitleScene"

export const PublicDecorator: Component<
  ParentProps<{
    title?: string
    paragraph?: string
    staticHeader?: boolean
    backButton?: boolean
  }>
> = (props) => {
  return (
    <>
      <Stack class="PublicDecorator__rowContainer">
        <div class="PublicDecorator__colWhiteBackground">
          <div class="PublicDecorator__divTemplateContainer">
            {props.staticHeader && <HeaderTitle backButton={props.backButton} paragraph={props.paragraph} title={props.title} />}
            <div class="PublicDecorator__divChildrenContainer">{props.children}</div>
            <div class="PublicDecorator__divLogoContainer">
              <img class="PublicDecorator__img" src="assets/AdopetsLogo.svg" alt="adopets logo" />
            </div>
          </div>
        </div>
        <div class="PublicDecorator__colBackground">
          <img class="PublicDecorator__imgBackground" src="assets/BG.png" alt="public background" />
        </div>
      </Stack>
    </>
  )
}
