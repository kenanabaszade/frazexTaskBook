import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { Container, TextField, Button, Typography } from "@mui/material";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const response = await axios.post(
        "https://bookbuzz.inloya.com/api/v1/account/login",
        {
          email,
          password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.data.isError) {
        localStorage.setItem("token", response.data.result.jwt);
        router.push("/");
      } else {
        setError(response.data.errorMessage);
      }
    } catch (error) {
      console.error(error);
      setError("An unexpected error occurred.");
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Login
      </Typography>
      <TextField
        label="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        fullWidth
      />
      <TextField
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        fullWidth
      />
      {error && (
        <Typography color="error" gutterBottom>
          {error}
        </Typography>
      )}
      <Button variant="contained" color="primary" onClick={handleLogin}>
        Login
      </Button>
    </Container>
  );
};

export default LoginPage;
