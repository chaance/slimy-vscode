import styled from '@emotion/styled';
import { styleVars, breakpoint as bp } from '@lib/style';
import Menu from '@components/Menu';

export const StyledNav: any = styled.nav`
  ${bp('small down')} {
    z-index: 10;
    display: flex;
    flex-flow: row wrap;
    align-items: center;
    justify-content: center;
    text-align: center;
    background: #fff;
    position: absolute;
    width: 100vw;
    height: 100vh;
    left: 100%;
    top: 0;
    padding: calc(${styleVars.outerMargin} / 2);
    transition: transform 300ms ease-out;
    transform: translateX(
      ${({ menuActive }: any) => (menuActive ? '-100%' : '0')}
    );
  }

  ${bp('medium')} {
    position: relative;
  }
`;

export const MenuToggle: any = styled.button`
  position: relative;
  z-index: 11;
  height: 100%;
  width: 50px;
  margin: 0;
  border: 1px solid transparent;
  appearance: none;
  transition: transform 500ms cubic-bezier(0.2, 0.3, 0.25, 0.9) 0s;
  outline: 0;
  padding: 0;
  border-radius: 0;
  box-shadow: none;
  background-color: transparent;
  cursor: pointer;

  ${({ 'aria-expanded': active }) =>
    active
      ? `
      transform: rotate(360deg);
    `
      : null}

  .toggle-bar {
    position: absolute;
    display: block;
    width: 6px;
    height: 6px;
    border-radius: 6px;
    margin: auto -4px;
    left: calc(50% + 1px);
    top: calc(50% - 3px);
    background: #222;
    transform-origin: 50% 50%;
    transition: all 0.25s ease 0ms;

    &:nth-of-type(1) {
      ${({ 'aria-expanded': active }) =>
        active
          ? `
          transform: scale(1, 1) rotate(45deg) translate(0, 0);
          width: 3.5px;
          height: 30px;
          top: calc(50% - 15px);
          transition: all 0.25s ease 0.25s;
    `
          : null}
    }

    &:nth-of-type(2) {
      margin-left: -4px;
      ${({ 'aria-expanded': active }) =>
        active
          ? `
          transform: scale(1, 1) rotate(-45deg) translate(0, 0);
          width: 3.5px;
          height: 30px;
          top: calc(50% - 15px);
          transition: all 0.25s ease 0.125s;
        `
          : null}
    }

    &:nth-of-type(3) {
      margin-left: -16px;
    }

    &:nth-of-type(4) {
      margin-left: 8px;
    }

    &:nth-of-type(3),
    &:nth-of-type(4) {
      ${({ 'aria-expanded': active }) =>
        active
          ? `
          opacity: 0;
          transform: scale(0, 0) rotate(0) translate(0, 8px);
            `
          : null}
    }
  }
`;

export const StyledMenu: any = styled(Menu)`
  display: grid;
  grid-template: auto / auto;
  grid-row-gap: 20px;
  ${bp('medium')} {
    display: flex;
  }
`;
