import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Button } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useTelegram } from '../hooks/useTelegram';

const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: var(--tg-theme-bg-color, #fff);
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--tg-theme-button-color, #1976d2);
`;

const MenuItems = styled.div`
  display: flex;
  gap: 2rem;
  align-items: center;

  @media (max-width: 768px) {
    display: none;
  }
`;

const MenuItem = styled(Link)`
  text-decoration: none;
  color: var(--tg-theme-text-color, #333);
  font-weight: 500;
  transition: color 0.3s ease;

  &:hover {
    color: var(--tg-theme-button-color, #1976d2);
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--tg-theme-button-color, #333);

  @media (max-width: 768px) {
    display: block;
  }
`;

const StyledButton = styled(Button)`
  && {
    background-color: var(--tg-theme-button-color, #1976d2);
    color: var(--tg-theme-button-text-color, #fff);

    &:hover {
      background-color: var(--tg-theme-button-color, #1565c0);
    }
  }
`;

const Navigation = () => {
  const { onClose } = useTelegram();

  const handleCallRequest = () => {
    onClose();
  };

  return (
    <Nav>
      <Logo>
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          MP Logistic
        </Link>
      </Logo>

      <MenuItems>
        <MenuItem to="/">Главная</MenuItem>
        <MenuItem to="/services">Услуги</MenuItem>
        <MenuItem to="/about">О компании</MenuItem>
        <MenuItem to="/contacts">Контакты</MenuItem>
        <StyledButton variant="contained" onClick={handleCallRequest}>
          Заказать звонок
        </StyledButton>
      </MenuItems>

      <MobileMenuButton>
        <MenuIcon />
      </MobileMenuButton>
    </Nav>
  );
};

export default Navigation; 