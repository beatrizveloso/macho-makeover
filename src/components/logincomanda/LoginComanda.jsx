import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import logo from '../../../public/images/logo-comandou.png';
import './LoginComanda.css';

const LoginComandou = ({ onLogin }) => {
  const [loginComandouEmail, setLoginComandouEmail] = useState('');
  const [loginComandouSenha, setLoginComandouSenha] = useState('');
  const [mostrarSenhaComandou, setMostrarSenhaComandou] = useState(false);
  const [erroLoginComandou, setErroLoginComandou] = useState('');

  const handleSubmitComandou = (e) => {
    e.preventDefault();
    /*aqui dá pra alterar a senha que o login aceita*/
    if (loginComandouEmail === 'nextiscontato@gmail.com' && loginComandouSenha === 'nextiscomandou12@') {
      setErroLoginComandou('');
      onLogin(true);
    } else {
      setErroLoginComandou('Email ou senha incorretos');
    }
  };

  return (
    <div className="login-comandou-container">
      <div className="login-comandou-card">
        <div className="login-comandou-logo">
          <img src={logo} alt="Comandou" className="logo-comandou-image" />
        </div>
        <div className="login-comandou-header">
          <h2>Acesso Restrito</h2>
          <p>Apenas funcionários autorizados</p>
        </div>
        
        <form onSubmit={handleSubmitComandou} className="login-comandou-form">
          {erroLoginComandou && <div className="login-comandou-error">{erroLoginComandou}</div>}
          
          <div className="form-group-comandou">
            <label htmlFor="loginComandouEmail">Email</label>
            <input
              type="email"
              id="loginComandouEmail"
              value={loginComandouEmail}
              onChange={(e) => setLoginComandouEmail(e.target.value)}
              placeholder="Digite seu email"
              required
              className="login-comandou-input"
            />
          </div>
          
          <div className="form-group-comandou">
            <label htmlFor="loginComandouSenha">Senha</label>
            <div className="password-input-container-comandou">
              <input
                type={mostrarSenhaComandou ? "text" : "password"}
                id="loginComandouSenha"
                value={loginComandouSenha}
                onChange={(e) => setLoginComandouSenha(e.target.value)}
                placeholder="Digite sua senha"
                required
                className="login-comandou-input"
              />
              <span 
                className="password-toggle-comandou"
                onClick={() => setMostrarSenhaComandou(!mostrarSenhaComandou)}
              >
                {mostrarSenhaComandou ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>
          
          <button type="submit" className="login-comandou-button">
            Acessar Comanda
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginComandou;