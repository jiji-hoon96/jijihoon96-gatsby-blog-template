import { FaMoon, FaSun } from 'react-icons/fa'; /

import { ThemeManagerContext } from 'gatsby-emotion-dark-mode';
import { useContext } from 'react';

import * as S from './styled';

const ThemeToggle: React.FC = () => {
  const theme = useContext(ThemeManagerContext);

  return (
    <S.Wrapper onClick={() => theme.toggleDark()} isDark={theme.isDark}>
      {theme.isDark ? <FaSun className='theme-icon' /> : <FaMoon className='theme-icon' />}
    </S.Wrapper>
  );
};

export default ThemeToggle;
