import { css } from "lit";

export const globalStyles = css`
  h1 {
    font-size: var(--font-xl);
    margin-bottom: 1rem;
  }

  h2 {
    font-size: var(--font-large);
    margin-bottom: 0.75rem;
  }

  p {
    font-size: var(--font-medium);
    line-height: 1.6;
    margin-bottom: 1rem;
  }

  a {
    color: var(--color-2);
    text-decoration: none;
    transition: var(--transition-all);
    display: inline-flex;
    align-items: center;
  }

  a:hover {
    color: var(--color-1);
  }

  main {
    max-width: var(--content-width);
    margin: var(--size-large) auto;
    min-height: calc(100vh - 100px);
    box-sizing: border-box;
    width: 100%;
    padding: 0 var(--size-large);
  }

  button {
    background: transparent;
    border: none;
    cursor: pointer;
  }

  svg {
    width: var(--icon-size);
    height: var(--icon-size);
  }

  @media (max-width: 768px) {
    main {
      margin: var(--size-medium) auto;
      min-height: calc(100vh - 80px);
      padding: 0 var(--size-medium);
    }
  }
`;
