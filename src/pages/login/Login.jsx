import { useEffect, useState } from "react";
import{ useAuth } from "../../hooks/useAuth"
import { User, Key } from "lucide-react";
import { useNavigate } from "react-router-dom";
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import "./Login.scss";

const Login = () => {
    const { login, isLoading, error } = useAuth();
    const [email, setEmail] = useState(''); 
    const [password, setPassword] = useState(''); 
    const navigate = useNavigate();

    const submitForm = async () => {
        try {
            await login(email, password);
            navigate("/trip");
        }catch(ignored) {}
    }

    useEffect(() => {
        if(error) {
            toast.error("Invalid credentials");
        }
    }, [error]);

    const register = () => {
        window.location.replace("/register");
    }

    return (
        <>
        <ToastContainer position="top-right" autoClose={3000} />
        <div className="login-container">
            <div className="login-content">
                <div className="company-name">log in to <span>truck</span></div>
                <div className="form-group">
                    <TextField
                        label="Login"
                        variant="outlined"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        fullWidth
                        InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                            <User size={20} color="white" />
                            </InputAdornment>
                        ),
                        }}
                        sx={{ marginBottom: '1rem' }}
                    />

                    <TextField
                        label="Password"
                        variant="outlined"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        fullWidth
                        InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                            <Key size={20} color="white"/>
                            </InputAdornment>
                        ),
                        }}
                    />
                </div>
                <div className="action-submit">
                    <Button
                        variant="contained"
                        onClick={submitForm}
                        disabled={isLoading}
                        sx={{
                        backgroundColor: '#12A594',
                        color: 'white',
                        '&:hover': {
                            backgroundColor: '#0f8c82',
                        },
                        textTransform: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        }}
                    >
                        log in
                        {isLoading && (
                            <CircularProgress size={18} color="inherit" />
                        )}
                    </Button>
                </div>
                <div className="register" onClick={() => register()}>New here? Create your account.</div>
            </div>
        </div>
        </>
    );
};

export default Login;