import { Global, css, useTheme } from '@emotion/react';

const GlobalStyles = () => {
  const theme = useTheme(); // Make sure theme is injected

  return (
    <Global
      styles={css`
        *, *::before, *::after {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        html, body, #root {
          height: 100%;
          width: 100%;
        }

        html {
          font-size: 16px;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        body {
          font-family: ${theme.typography.fontFamily};
          color: ${theme.palette.text.primary};
          background-color: ${theme.palette.background.default};
          line-height: 1.5;
        }

        a {
          color: ${theme.palette.primary.main};
          text-decoration: none;
          transition: ${theme.transitions.create(['color', 'text-decoration'])};
        }

        a:hover {
          color: ${theme.palette.primary.dark};
          text-decoration: underline;
        }

        h1, h2, h3, h4, h5, h6 {
          margin-top: 0;
          margin-bottom: ${theme.spacing(2)};
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
          margin-bottom: ${theme.spacing(2)};
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

        button, [type='button'], [type='reset'], [type='submit'] {
          -webkit-appearance: button;
        }

        #root {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
      `}
    />
  );
};

export default GlobalStyles;
