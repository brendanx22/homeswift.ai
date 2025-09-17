import { Global, css } from '@emotion/react';
import { theme } from './theme';

const GlobalStyles = () => (
  <Global
    styles={css`
      *,
      *::before,
      *::after {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      html {
        font-size: 16px;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        height: 100%;
      }

      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
          'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
          sans-serif;
        color: ${theme.colors.text};
        background-color: ${theme.colors.background};
        line-height: 1.5;
        height: 100%;
        margin: 0;
        padding: 0;
      }

      #root {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
      }

      a {
        color: ${theme.colors.primary};
        text-decoration: none;
        transition: ${theme.transitions.default};

        &:hover {
          color: ${theme.colors.primaryDark};
          text-decoration: underline;
        }
      }

      h1, h2, h3, h4, h5, h6 {
        margin-top: 0;
        margin-bottom: ${theme.spacing.md};
        font-weight: 600;
        line-height: 1.2;
      }

      h1 { font-size: 2.5rem; }
      h2 { font-size: 2rem; }
      h3 { font-size: 1.75rem; }
      h4 { font-size: 1.5rem; }
      h5 { font-size: 1.25rem; }
      h6 { font-size: 1rem; }

      p {
        margin-top: 0;
        margin-bottom: ${theme.spacing.md};
      }

      img {
        max-width: 100%;
        height: auto;
        display: block;
      }

      button, input, optgroup, select, textarea {
        font-family: inherit;
        font-size: 100%;
        line-height: 1.15;
        margin: 0;
      }

      button, input {
        overflow: visible;
      }

      button, select {
        text-transform: none;
      }

      button, [type="button"], [type="reset"], [type="submit"] {
        -webkit-appearance: button;
      }
    `}
  />
);

export default GlobalStyles;
