import React from 'react';
import styled from '@emotion/styled';
import { css } from '@emotion/react';
import theme from '../../styles/theme';

const ButtonBase = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: ${({ size = 'md' }) => {
    const sizes = {
      sm: `${theme.spacing.sm} ${theme.spacing.md}`,
      md: `${theme.spacing.md} ${theme.spacing.lg}`,
      lg: `${theme.spacing.lg} ${theme.spacing.xl}`,
    };
    return sizes[size];
  }};
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  line-height: 1.5;
  cursor: pointer;
  transition: ${theme.transitions.default};
  text-decoration: none;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  user-select: none;
  background-color: ${({ variant = 'primary' }) => 
    variant === 'primary' ? theme.colors.primary : 'transparent'};
  color: ${({ variant = 'primary' }) => 
    variant === 'primary' ? 'white' : theme.colors.primary};
  border: ${({ variant = 'primary' }) => 
    variant === 'outline' ? `1px solid ${theme.colors.primary}` : 'none'};

  &:hover {
    background-color: ${({ variant = 'primary' }) => 
      variant === 'primary' ? theme.colors.primaryDark : 'rgba(0, 0, 0, 0.04)'};
    ${({ variant }) => variant === 'outline' && `color: ${theme.colors.primaryDark};`}
    ${({ variant }) => variant === 'outline' && `border-color: ${theme.colors.primaryDark};`}
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  ${({ fullWidth }) => 
    fullWidth && 
    css`
      width: 100%;
    `}
`;

const Button = ({ 
  children, 
  onClick, 
  type = 'button', 
  disabled = false, 
  loading = false,
  ...props 
}) => (
  <ButtonBase
    type={type}
    onClick={onClick}
    disabled={disabled || loading}
    {...props}
  >
    {loading ? 'Loading...' : children}
  </ButtonBase>
);

export default Button;
