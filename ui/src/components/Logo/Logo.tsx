import React from 'react';
import classnames from 'classnames';
import { ReactComponent as LogoIcon } from '../../assets/logo.svg';
import styles from './Logo.module.css';

interface LogoProps {
    className?: string;
}

export default function Logo({ className }: LogoProps) {
    return (
        <div className={classnames(styles.logo, className)}>
            <LogoIcon />
        </div>
    );
}
