import {
  Box,
  Button,
  Container,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
  Alert,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { useState } from "react";
import { useRegister } from "../hooks/useRegister";
import { useNavigate } from "react-router-dom";
import { AuthSocialButtons } from "../components/AuthSocialButtons";
import { EmailField } from "../components/EmailField";
import { InternationalPhoneField, buildInternationalPhone, getDefaultPhoneCountry } from "../components/InternationalPhoneField";
import { getLocaleDefaults } from "../utils/locale";
import { useApi } from "../hooks/useApi";

function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneCountry, setPhoneCountry] = useState(() => {
    const localeCountry = getLocaleDefaults().countryCode;
    return getDefaultPhoneCountry(localeCountry);
  });
  const [phoneLocal, setPhoneLocal] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<
    null | "google" | "microsoft" | "facebook" | "email"
  >(null);
  const { registerAsync, isLoading, error } = useRegister();
  const api = useApi();
  const navigate = useNavigate();
  const [emailError, setEmailError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    registerAsync({
      firstName,
      lastName,
      phone: buildInternationalPhone(phoneCountry, phoneLocal),
      email,
      password
    })
      .then(() => navigate("/"))
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error("Registration failed", err);
      });
  };

  const checkEmail = async () => {
    const value = email.trim();
    if (!value) {
      setEmailError(null);
      return;
    }
    const res = await api.get<{ exists: boolean }>(`/auth/register/check?email=${encodeURIComponent(value)}`);
    setEmailError(res.exists ? "This email is already registered." : null);
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        py: 8,
      }}
    >
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <img
          src="/static/meetplanner-logo.svg"
          alt="Meetplanner logo"
          width={350}
          height="auto"
        />
      </Box>

      <Paper elevation={2} sx={{ width: "100%", p: 3 }}>
        <Typography variant="h5" mb={2}>
          Create account
        </Typography>
        {!selectedMethod && (
          <AuthSocialButtons showEmail onSelect={setSelectedMethod} />
        )}
        {selectedMethod && selectedMethod !== "email" && (
          <Stack spacing={2}>
            <Alert severity="info">
              Continue with {selectedMethod} is not configured yet.
            </Alert>
            <Button variant="text" onClick={() => setSelectedMethod(null)}>
              Choose another method
            </Button>
          </Stack>
        )}
        {selectedMethod === "email" && (
          <>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error.message}
              </Alert>
            )}
            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={2}>
                <TextField
                  label="First name"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <PersonOutlineIcon
                        fontSize="small"
                        sx={{ mr: 1, color: "text.disabled" }}
                      />
                    ),
                  }}
                />
                <TextField
                  label="Last name"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <PersonOutlineIcon
                        fontSize="small"
                        sx={{ mr: 1, color: "text.disabled" }}
                      />
                    ),
                  }}
                />
                <InternationalPhoneField
                  label="Phone"
                  required
                  country={phoneCountry}
                  local={phoneLocal}
                  onCountryChange={setPhoneCountry}
                  onLocalChange={setPhoneLocal}
                />
                <EmailField
                  required
                  value={email}
                  onChange={(value) => setEmail(value)}
                  onBlur={checkEmail}
                />
                {emailError && <Alert severity="warning">{emailError}</Alert>}
                <TextField
                  label="Password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <LockOutlinedIcon
                        fontSize="small"
                        sx={{ mr: 1, color: "text.disabled" }}
                      />
                    ),
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  sx={{ textTransform: "uppercase" }}
                  disabled={Boolean(emailError)}
                >
                  {isLoading ? "Creating..." : "Create account"}
                </Button>
                <Button variant="text" onClick={() => setSelectedMethod(null)}>
                  Choose another method
                </Button>
              </Stack>
            </Box>
          </>
        )}

        <Stack direction="row" justifyContent="space-between" sx={{ mt: 2 }}>
          <Link href="/login">Already have an account?</Link>
        </Stack>
      </Paper>
    </Container>
  );
}

export default RegisterPage;
