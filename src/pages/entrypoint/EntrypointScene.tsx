import { useNavigate } from "@solidjs/router"

const EntrypointScene = () => {
  const navigate = useNavigate()
  setTimeout(() => {
    navigate("/login")
  }, 2000)
  return <>Redirecting...</>
}

export default EntrypointScene
