import { Button, Paper, Stack, Typography } from "@suid/material"
import { ErrorBoundary as $Boundary, FlowComponent } from "solid-js"

export const ErrorBoundary: FlowComponent = (props) => {
  const processError = (err) => {
    console.error("[ERROR_BOUNDARY]", err)
  }

  return (
    <$Boundary
      fallback={(err, retry) => {
        processError(err)

        return (
          <Stack alignItems="center" justifyContent="center" height={"100vh"} spacing={2} style={{ background: "aliceblue" }}>
            <Typography variant="h6">Ops! Something went wrong 💩</Typography>
            <Paper>
              <pre style={{ margin: "8px", padding: "8px", "min-width": "400px", "max-width": "70vw", "overflow-x": "auto" }}>
                <code>{err.stack}</code>
              </pre>
            </Paper>
            <Button onClick={() => retry()} variant="outlined">
              Retry
            </Button>
          </Stack>
        )
      }}
    >
      {props.children}
    </$Boundary>
  )
}
