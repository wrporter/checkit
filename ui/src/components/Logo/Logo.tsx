import React from 'react';
import { ReactComponent as LogoIcon } from '../../assets/logo.svg';
import styles from './Logo.module.css';
import classnames from 'classnames';

interface LogoProps {
    className?: string;
}

const Logo: React.FC<LogoProps> = ({ className }: LogoProps) => {
    return (
        <div className={classnames(styles.logo, className)}>
            <LogoIcon />
        </div>
    );
};

export default Logo;
