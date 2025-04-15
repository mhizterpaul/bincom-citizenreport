import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  styled,
} from "@mui/material";
import { useAuth } from "../hooks/useAuth";
import api from "../api/axios";

const AuthWrapper = styled(Box)(({ theme }) => ({
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.default,
}));

const AuthCard = styled(Card)(() => ({
  width: "100%",
  maxWidth: 400,
  margin: "0 auto",
  padding: "2rem",
  borderRadius: "8px",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
}));

const Form = styled("form")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
}));

interface AuthFormData {
  email: string;
  password: string;
}

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<AuthFormData>({
    email: "",
    password: "",
  });

  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await api.post(
        `/auth/${isLogin ? "login" : "register"}`,
        formData
      );
      const { data } = response.data;

      // Store token in localStorage
      localStorage.setItem("token", data.token);

      // Update auth state with user and token
      login({
        token: data.token,
        user: {
          id: data.user.id,
          name: data.user.firstName + " " + data.user.lastName,
          email: data.user.email,
          image: data.user.image,
        },
      });
    } catch (err: any) {
      setError(err.response?.data?.message || "Authentication failed");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <AuthWrapper>
      <AuthCard>
        <CardContent>
          <Typography variant="h5" component="h1" gutterBottom align="center">
            {isLogin ? "Login" : "Register"}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <TextField
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              fullWidth
            />
            <TextField
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              fullWidth
            />
            <Button type="submit" variant="contained" color="primary" fullWidth>
              {isLogin ? "Login" : "Register"}
            </Button>
          </Form>

          <Box sx={{ mt: 2, textAlign: "center" }}>
            <Button onClick={() => setIsLogin(!isLogin)} color="primary">
              {isLogin
                ? "Don't have an account? Register"
                : "Already have an account? Login"}
            </Button>
          </Box>
        </CardContent>
      </AuthCard>
    </AuthWrapper>
  );
};

export default Auth;
