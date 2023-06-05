import { Component, Suspense, createMemo } from "solid-js"
import { useRoutes, Router } from "@solidjs/router"
import { CircularProgress, GlobalStyles, ThemeProvider, createTheme } from "@suid/material"
import { routes } from "./routes"
import { ErrorBoundary } from "./core/components/ErrorBoundary"

const theme = createTheme({
  components: {},
  typography: {
    fontFamily: "Inter"
  },
  palette: {
    mode: "light",
    primary: {
      main: "#ee2c6c"
    },
    success: {
      main: "#28cca4"
    },
    info: {
      main: "#30a8ff"
    },
    warning: {
      main: "#ffc400"
    },
    error: {
      main: "#8C121E"
    },
    text: {
      primary: "#707390",
      secondary: "#707390"
    }
    // secondary: {
    //   // This is green.A700 as hex.
    //   // main: "#11cb5f"
    // }
  }
})

const App: Component = () => {
  const Routes = useRoutes(routes)
  const globalCss = createMemo(() =>
    GlobalStyles({
      styles: {
        "*": {
          margin: 0,
          padding: 0,
          boxSizing: "border-box"
        },
        body: {
          fontFamily: "Inter"
        }
      }
    })
  )

  return (
    <ThemeProvider theme={theme}>
      {globalCss()}
      <Router>
        <ErrorBoundary>
          <Suspense
            fallback={
              <>
                <CircularProgress />
                Loading
              </>
            }
          >
            <Routes />
          </Suspense>
        </ErrorBoundary>
      </Router>
    </ThemeProvider>
  )
}

export default App
