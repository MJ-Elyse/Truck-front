import { useEffect, useState } from "react";
import{ useAuth } from "../../hooks/useAuth"
import { User, Key, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import "./Register.scss";

const Register = () => {
    const { register, isLoading, error } = useAuth();
    const [name, setName] = useState(''); 
    const [email, setEmail] = useState(''); 
    const [password, setPassword] = useState(''); 
    const navigate = useNavigate();

    const submitForm = async () => {
        try {
            await register(name, email, password);
            navigate("/login");
        }catch(ignored) {}
    }

    useEffect(() => {
        if(error) {
            toast.error("Invalid credentials");
        }
    }, [error]);

    const backlogin = () => {
        window.location.replace("/login");
    }

    return (
        <>
        <ToastContainer position="top-right" autoClose={3000} />
        <div className="login-container">
            <div className="login-content">
                <div className="company-name">log in to <span>truck</span></div>
                <div className="form-group">
                    <TextField
                        label="Name"
                        variant="outlined"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
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
                        label="Login"
                        variant="outlined"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        fullWidth
                        InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                            <Mail size={20} color="white" />
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
                        Register
                        {isLoading && (
                            <CircularProgress size={18} color="inherit" />
                        )}
                    </Button>
                </div>
                <div className="backlogin" onClick={() => backlogin()}>Already have an account? Log in</div>
            </div>
        </div>
        </>
    );
};

export default Register;