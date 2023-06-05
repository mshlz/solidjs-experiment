import { A } from "@solidjs/router"
import { Button, Stack, Typography } from "@suid/material"

export default function NotFound() {
  return (
    <Stack alignItems="center" justifyContent="center" height={"100vh"} spacing={3} style={{ background: "aliceblue" }}>
      <Typography variant="h6">Ops! Page not found 💩</Typography>

      <Button as={A} variant="outlined" href="/login">
        Go back to home
      </Button>
    </Stack>
  )
}
