import React from 'react';
import Grid from '@mui/material/Grid';
import classnames from 'classnames';
import makeStyles from '@mui/styles/makeStyles';

const useStyles = makeStyles(() => ({
    fullPage: {
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
    },
}));

interface FullPageContainerProps {
    children: React.ReactNode;
    className?: string;
}

export default function FullPageContainer({
    children,
    className,
}: FullPageContainerProps) {
    const classes = useStyles();

    return (
        <Grid
            className={classnames(className, classes.fullPage)}
            container
            spacing={0}
            alignItems="center"
            justifyContent="center"
        >
            {children}
        </Grid>
    );
}
